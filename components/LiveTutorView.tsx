
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { HeadphonesIcon } from './icons/HeadphonesIcon';
import { MicIcon } from './icons/MicIcon';
import { SquareIcon } from './icons/SquareIcon';

// --- Helper Functions for Audio Processing ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // Clamp values to [-1, 1] before scaling
    const s = Math.max(-1, Math.min(1, data[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const LiveTutorView: React.FC = () => {
    const [connected, setConnected] = useState(false);
    const [status, setStatus] = useState('Ready to Connect');
    const [volume, setVolume] = useState(0); // For visualizer
    
    // Refs for Audio Handling
    const audioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null); // Legacy but used in example
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const cleanup = () => {
        // Stop Mic
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        // Stop Audio Playback
        sourcesRef.current.forEach(source => {
            try { source.stop(); } catch(e) {}
        });
        sourcesRef.current.clear();
        
        // Close Audio Context
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        // Close Session
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close()).catch(() => {});
            sessionPromiseRef.current = null;
        }
        
        setConnected(false);
        setStatus('Disconnected');
        setVolume(0);
    };

    const startSession = async () => {
        try {
            setStatus('Initializing Audio...');
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            
            // 1. Output Context (24kHz)
            const outputCtx = new AudioContextClass({ sampleRate: 24000 });
            audioContextRef.current = outputCtx;
            nextStartTimeRef.current = outputCtx.currentTime; // Reset timing
            const outputNode = outputCtx.createGain();
            outputNode.connect(outputCtx.destination);

            // 2. Input Context (16kHz)
            const inputCtx = new AudioContextClass({ sampleRate: 16000 });
            
            // 3. Get Mic Stream
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            setStatus('Connecting to Gemini...');
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // 4. Connect to Gemini Live
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus('Connected! Say "Hello Mind Mate"');
                        setConnected(true);

                        // Start Mic Streaming
                        const source = inputCtx.createMediaStreamSource(stream);
                        sourceNodeRef.current = source;
                        
                        // Use ScriptProcessor for 16kHz resampling/buffering (as per example)
                        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = processor;

                        processor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            
                            // Visualizer Volume Calculation
                            let sum = 0;
                            for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
                            const rms = Math.sqrt(sum / inputData.length);
                            setVolume(Math.min(rms * 10, 1)); // Scale for UI

                            const pcmBlob = createBlob(inputData);
                            
                            // CRITICAL: Send data only if session resolved
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };

                        source.connect(processor);
                        processor.connect(inputCtx.destination); // Required for script processor to run
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Handle Audio Output
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio && audioContextRef.current) {
                            const ctx = audioContextRef.current;
                            
                            // Ensure strict timing
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            
                            const audioBuffer = await decodeAudioData(
                                decode(base64Audio),
                                ctx,
                                24000,
                                1
                            );

                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNode);
                            
                            source.addEventListener('ended', () => {
                                sourcesRef.current.delete(source);
                            });

                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }

                        if (message.serverContent?.interrupted) {
                            sourcesRef.current.forEach(s => s.stop());
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e) => {
                        console.error("Live API Error:", e);
                        setStatus('Connection Error');
                        setConnected(false);
                    },
                    onclose: () => {
                        setStatus('Session Ended');
                        setConnected(false);
                    }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                    },
                    systemInstruction: "You are Mind Mate, an encouraging, energetic, and highly intelligent AI tutor. You help students understand complex topics, quiz them, and keep them motivated. Keep your responses concise and conversational, like a real human tutor on a call."
                }
            });

        } catch (err) {
            console.error("Failed to start session:", err);
            setStatus('Failed to Start (Check Permissions)');
            cleanup();
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => cleanup();
    }, []);

    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden">
            
            {/* Background Ambience */}
            <div className={`absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-purple-900/10 transition-opacity duration-1000 ${connected ? 'opacity-100' : 'opacity-0'}`}></div>
            
            <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md">
                <div className="flex flex-col items-center gap-2">
                    <div className="p-4 bg-stone-800 rounded-full shadow-lg border border-stone-700">
                        <HeadphonesIcon className={`w-10 h-10 ${connected ? 'text-green-400 animate-pulse' : 'text-stone-500'}`} />
                    </div>
                    <h2 className="text-3xl font-bold text-stone-100">Live Tutor</h2>
                    <p className={`text-sm font-medium ${connected ? 'text-green-400' : 'text-stone-500'}`}>{status}</p>
                </div>

                {/* Visualizer Orb */}
                <div className="relative w-64 h-64 flex items-center justify-center">
                    {/* Pulsing Rings */}
                    {connected && (
                        <>
                            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" style={{ transform: `scale(${1 + volume})` }}></div>
                            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl animate-pulse delay-75" style={{ transform: `scale(${1 + volume * 1.5})` }}></div>
                        </>
                    )}
                    
                    {/* Core Orb */}
                    <div className={`w-40 h-40 rounded-full shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all duration-300 ${
                        connected 
                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 scale-100 border-4 border-white/10' 
                            : 'bg-stone-800 scale-90 border-4 border-stone-700'
                    }`}>
                        {connected ? (
                            <div className="space-y-1 flex gap-1 items-end h-8">
                                <div className="w-2 bg-white/80 rounded-full animate-[bounce_1s_infinite]" style={{ height: `${20 + volume * 50}%` }}></div>
                                <div className="w-2 bg-white/80 rounded-full animate-[bounce_1.2s_infinite]" style={{ height: `${30 + volume * 70}%` }}></div>
                                <div className="w-2 bg-white/80 rounded-full animate-[bounce_0.8s_infinite]" style={{ height: `${20 + volume * 50}%` }}></div>
                            </div>
                        ) : (
                            <span className="text-stone-600 text-xs font-bold uppercase tracking-widest">Offline</span>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-4">
                    {!connected ? (
                        <button 
                            onClick={startSession}
                            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <MicIcon className="w-6 h-6" /> Start Session
                        </button>
                    ) : (
                        <button 
                            onClick={cleanup}
                            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <SquareIcon className="w-6 h-6" /> End Session
                        </button>
                    )}
                </div>

                <div className="bg-stone-950/50 p-4 rounded-xl border border-stone-800 text-center max-w-sm">
                    <p className="text-stone-400 text-xs">
                        Tip: Wear headphones to prevent echo. The AI uses the Gemini Live API for real-time voice interaction.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LiveTutorView;
