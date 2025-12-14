
import React, { useState, useEffect, useRef } from 'react';
import { MicIcon } from './icons/MicIcon';
import { SquareIcon } from './icons/SquareIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { BellIcon } from './icons/BellIcon';
import { GoogleGenAI } from "@google/genai";
import { Preferences, StudyPlan, MoodEntry } from '../types';

// Check for SpeechRecognition API
// FIX: Cast window to `any` to access non-standard browser APIs for speech recognition.
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const mic = SpeechRecognition ? new SpeechRecognition() : null;

if (mic) {
    mic.continuous = true;
    mic.interimResults = true;
    mic.lang = 'en-US';
}

interface LogEntry {
    sender: 'User' | 'Mind Mate';
    text: string;
    isNudge?: boolean;
}

interface AmbientVoiceViewProps {
    preferences: Preferences | null;
    plan: StudyPlan | null;
    userName: string;
}

const AmbientVoiceView: React.FC<AmbientVoiceViewProps> = ({ preferences, plan, userName }) => {
    const [isListening, setIsListening] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [log, setLog] = useState<LogEntry[]>([]);
    const [note, setNote] = useState('');
    const [moodData, setMoodData] = useState<MoodEntry | null>(null);
    
    // Coach Settings State
    const [showSettings, setShowSettings] = useState(false);
    const [coachStyle, setCoachStyle] = useState('Encouraging');
    const [coachLearningPreference, setCoachLearningPreference] = useState(preferences?.learningStyle || 'Visual');
    const [autoNudgeEnabled, setAutoNudgeEnabled] = useState(true);

    const timeoutsRef = useRef<number[]>([]);

    useEffect(() => {
        // Load latest mood data from local storage
        try {
            const stored = localStorage.getItem('moodHistory');
            if (stored) {
                const history = JSON.parse(stored) as MoodEntry[];
                if (history && history.length > 0) {
                    setMoodData(history[history.length - 1]);
                }
            }
        } catch (e) {
            console.error("Failed to load mood data", e);
        }
    }, []);

    // Sync preference if props change and state hasn't been manually set yet (optional, simplified here)
    useEffect(() => {
        if (preferences?.learningStyle) {
            setCoachLearningPreference(preferences.learningStyle);
        }
    }, [preferences]);

    // --- AI Nudge Logic ---
    const triggerNudge = async () => {
        if (isThinking) return;
        setIsThinking(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const courseContext = plan ? `Course: ${plan.courseName}. Completed: ${plan.completedTopics.length} topics.` : 'General Study Session.';
            const moodContext = moodData ? `User Mood: ${moodData.mood}` : 'Mood: Neutral';

            const prompt = `
                You are "Mind Mate", an AI study companion.
                Generate a SHORT, proactive, encouraging nudge or a quick study tip for the student, ${userName}.
                
                Context:
                - ${courseContext}
                - ${moodContext}
                - Learning Style: ${coachLearningPreference}
                
                Constraint: 
                - Max 20 words. 
                - Be spontaneous and helpful. 
                - Do NOT ask a question, just give a statement.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const nudgeText = response.text || "Remember to take deep breaths and stay hydrated!";
            
            setLog(prev => [...prev, { sender: 'Mind Mate', text: nudgeText, isNudge: true }]);
            speak(nudgeText);

        } catch (error) {
            console.error("Nudge generation failed", error);
        } finally {
            setIsThinking(false);
        }
    };

    // Auto-Nudge Effect
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (autoNudgeEnabled) {
            // Trigger a nudge after 15 seconds of inactivity/mounting for demo purposes
            timer = setTimeout(() => {
                triggerNudge();
            }, 15000);
        }
        return () => clearTimeout(timer);
    }, [autoNudgeEnabled, plan, moodData]); // Re-set timer if these change


    const generateCoachingResponse = async (userText: string): Promise<string> => {
        setIsThinking(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Construct context for the AI
            const courseContext = plan ? `Course: ${plan.courseName}. Current progress: ${plan.completedTopics.length}/${plan.topics.length} topics.` : 'User is setting up their study plan.';
            const moodContext = moodData 
                ? `Current Mood: ${moodData.mood} (Intensity ${moodData.intensity}/10). Tags: ${moodData.tags.join(', ')}.` 
                : 'Mood unknown.';
            
            const prompt = `
                You are a supportive, empathetic AI study coach named "Mind Mate" for a student named ${userName}.
                
                **Coach Configuration:**
                - Communication Style: ${coachStyle}
                - Student's Learning Preference: ${coachLearningPreference}

                **User Context:**
                - ${courseContext}
                - ${moodContext}
                
                **User's Input:** "${userText}"
                
                **Instructions:**
                - Respond verbally (keep it short, 1-3 sentences max).
                - STRICTLY ADHERE to the Communication Style: "${coachStyle}".
                  - If 'Encouraging': Be warm, positive, and motivating.
                  - If 'Direct': Be concise, action-oriented, and no-nonsense.
                  - If 'Socratic': Ask guiding questions to help the student find the answer.
                  - If 'Concise': Use minimal words, bullet-point style speech.
                  - If 'Humorous': Be light-hearted and make small appropriate jokes.
                - Tailor advice to the Learning Preference: "${coachLearningPreference}".
                  - e.g., for 'Visual', suggest diagrams or mental imagery.
                  - e.g., for 'Auditory', discuss concepts aloud or use mnemonics.
                - Do not use markdown or complex formatting, just plain spoken text.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            return response.text || "I'm here for you. Could you say that again?";
        } catch (error) {
            console.error("Error generating AI response:", error);
            return "I'm having trouble connecting to my brain right now, but I'm listening. You're doing great!";
        } finally {
            setIsThinking(false);
        }
    };

    const speak = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
            if (isListening) mic?.start(); // Resume listening after speaking
        };
        mic?.stop(); // Pause listening while AI speaks
        window.speechSynthesis.speak(utterance);
    };

    const handleListen = () => {
        if (!mic) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        if (isListening) {
            mic.stop();
        } else {
            mic.start();
        }

        mic.onstart = () => {
            console.log('Mic is on');
            setIsListening(true);
        };

        mic.onend = async () => {
            console.log('Mic is off');
            // If the user said something, process it
            if (note.trim()) {
                // Temporarily stop listening state so UI reflects "processing"
                // Actually, mic is already off here.
                
                const userEntry: LogEntry = { sender: 'User', text: note };
                setLog(prev => [...prev, userEntry]);
                
                // Get AI response
                const aiResponseText = await generateCoachingResponse(note);
                
                const aiEntry: LogEntry = { sender: 'Mind Mate', text: aiResponseText };
                setLog(prev => [...prev, aiEntry]);
                
                speak(aiResponseText);
            } else {
                // If nothing was said, just update state
                setIsListening(false);
            }
            setNote('');
        };

        mic.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((result: any) => result[0])
                .map((result: any) => result.transcript)
                .join('');
            setNote(transcript);
        };
        
        mic.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            if (isListening) {
                setIsListening(false);
            }
        };
    };

    useEffect(() => {
        return () => {
            mic?.abort();
            timeoutsRef.current.forEach(clearTimeout);
            window.speechSynthesis.cancel();
        };
    }, []);

    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-stone-100">Ambient Coach 🎙️</h2>
                <div className="flex gap-2">
                    <button 
                        onClick={triggerNudge}
                        className="p-2 rounded-full hover:bg-stone-800 text-amber-500 hover:text-amber-400 transition-colors"
                        title="Get an AI Nudge now"
                    >
                        <BellIcon className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 rounded-full hover:bg-stone-800 text-stone-500 hover:text-stone-300 transition-colors"
                        title="Coach Settings"
                    >
                        <SettingsIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
            
            {showSettings && (
                <div className="mb-6 bg-stone-950 border border-stone-800 rounded-lg p-4 animate-fade-in shadow-inner">
                    <h3 className="font-semibold text-sm text-stone-300 mb-3 uppercase tracking-wide">Coach Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1">Communication Style</label>
                            <select 
                                value={coachStyle} 
                                onChange={(e) => setCoachStyle(e.target.value)}
                                className="w-full text-sm p-2 bg-stone-800 border border-stone-700 text-stone-200 rounded-md focus:ring-1 focus:ring-amber-500 outline-none shadow-sm"
                            >
                                <option value="Encouraging">Encouraging (Warm & Supportive)</option>
                                <option value="Direct">Direct (Concise & Action-Oriented)</option>
                                <option value="Socratic">Socratic (Asks Guiding Questions)</option>
                                <option value="Humorous">Humorous (Light-hearted)</option>
                                <option value="Concise">Concise (Minimal words)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1">Learning Preference</label>
                            <select 
                                value={coachLearningPreference} 
                                onChange={(e) => setCoachLearningPreference(e.target.value)}
                                className="w-full text-sm p-2 bg-stone-800 border border-stone-700 text-stone-200 rounded-md focus:ring-1 focus:ring-amber-500 outline-none shadow-sm"
                            >
                                <option value="Visual">Visual (Images, Diagrams)</option>
                                <option value="Auditory">Auditory (Listening, Discussion)</option>
                                <option value="Reading/Writing">Reading/Writing (Text, Notes)</option>
                                <option value="Kinesthetic">Kinesthetic (Hands-on, Examples)</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 flex items-center gap-2 mt-2">
                            <input 
                                type="checkbox" 
                                id="autoNudge"
                                checked={autoNudgeEnabled}
                                onChange={(e) => setAutoNudgeEnabled(e.target.checked)}
                                className="w-4 h-4 text-amber-600 bg-stone-800 border-stone-700 rounded focus:ring-amber-500"
                            />
                            <label htmlFor="autoNudge" className="text-sm text-stone-300">Enable Proactive AI Nudges</label>
                        </div>
                    </div>
                </div>
            )}

            <p className="text-stone-400 mb-6">
                Click the button and start speaking. I'll adapt to your mood and learning style.
            </p>

            <div className="flex flex-col items-center">
                <button 
                    onClick={handleListen}
                    disabled={isThinking}
                    className={`px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                        isListening 
                            ? 'bg-red-500 text-white animate-pulse-subtle ring-4 ring-red-900'
                            : isThinking 
                                ? 'bg-stone-700 text-stone-400 cursor-wait'
                                : 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white'
                    }`}
                >
                    {isListening 
                        ? <><SquareIcon className="w-6 h-6"/> Stop Listening</> 
                        : isThinking
                            ? <><span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span> Thinking...</>
                            : <><MicIcon className="w-6 h-6"/> Start Listening</>
                    }
                </button>
            </div>

            <div className="mt-8 p-4 bg-stone-950 rounded-xl min-h-[16rem] border border-stone-800 shadow-inner">
                <h3 className="font-semibold text-stone-400 mb-2 flex justify-between items-center">
                    <span>Conversation Log</span>
                    <div className="flex gap-2">
                        {moodData && <span className="text-xs font-normal text-stone-500 bg-stone-900 px-2 py-1 rounded-full border border-stone-800 shadow-sm">Mood: {moodData.mood}</span>}
                        <span className="text-xs font-normal text-amber-500 bg-amber-900/20 px-2 py-1 rounded-full border border-amber-900/30 shadow-sm">{coachStyle}</span>
                    </div>
                </h3>
                <div className="space-y-3 text-sm text-stone-300">
                    {log.map((entry, index) => (
                       <div key={index} className="animate-fade-in flex items-start gap-2">
                           {entry.isNudge && <BellIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />}
                           <div>
                               <span className={`font-bold ${entry.sender === 'User' ? 'text-stone-500' : 'text-amber-500'}`}>{entry.sender}: </span>
                               <span className={entry.isNudge ? 'italic text-amber-100' : ''}>{entry.text}</span>
                           </div>
                       </div>
                    ))}
                    {isListening && <p className="text-stone-500 italic">{note || 'Listening...'}</p>}
                    {isThinking && <p className="text-amber-500 italic animate-pulse">Mind Mate is thinking...</p>}
                </div>
            </div>
        </div>
    );
};

export default AmbientVoiceView;
