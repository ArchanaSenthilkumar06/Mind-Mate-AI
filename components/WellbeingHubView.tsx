import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { PlusIcon } from './icons/PlusIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { GoogleGenAI } from "@google/genai";

const VideoCard: React.FC<{ videoId: string; title: string; }> = ({ videoId, title }) => (
    <div className="bg-stone-900 border border-stone-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="w-full relative" style={{ aspectRatio: '16/9' }}>
            <iframe 
                src={`https://www.youtube.com/embed/${videoId}`}
                title={title}
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
            ></iframe>
        </div>
        <div className="p-4">
            <h3 className="font-semibold text-stone-200">{title}</h3>
        </div>
    </div>
);

const defaultAffirmations = [
    "I am capable of learning anything I set my mind to.",
    "Every challenge is an opportunity to grow.",
    "I am making progress, even when it feels slow.",
    "My worth is not defined by my grades.",
    "I trust in my ability to figure things out.",
    "Rest is productive and necessary."
];

const WellbeingHubView: React.FC = () => {
    // Affirmations State
    const [affirmations, setAffirmations] = useState<string[]>(defaultAffirmations);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [newAffirmation, setNewAffirmation] = useState('');

    // AI Video Gen State
    const [genVideoPrompt, setGenVideoPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [genVideoUrl, setGenVideoUrl] = useState<string | null>(null);
    const [genError, setGenError] = useState<string | null>(null);

    useEffect(() => {
        // Load user added affirmations
        const stored = localStorage.getItem('userAffirmations');
        if (stored) {
            try {
                const userAffirmations = JSON.parse(stored);
                if (Array.isArray(userAffirmations)) {
                    setAffirmations([...defaultAffirmations, ...userAffirmations]);
                }
            } catch (e) {
                console.error("Failed to parse user affirmations", e);
            }
        }
    }, []);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % affirmations.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + affirmations.length) % affirmations.length);
    };

    const handleAddAffirmation = (e: React.FormEvent) => {
        e.preventDefault();
        if (newAffirmation.trim()) {
            const added = newAffirmation.trim();
            const updated = [...affirmations, added];
            setAffirmations(updated);
            setCurrentIndex(updated.length - 1); // Jump to new one
            
            // Save only the custom ones
            const customOnes = updated.slice(defaultAffirmations.length);
            localStorage.setItem('userAffirmations', JSON.stringify(customOnes));
            
            setNewAffirmation('');
        }
    };

    const handleGenerateVideo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!genVideoPrompt.trim()) return;

        setIsGenerating(true);
        setGenError(null);
        setGenVideoUrl(null);

        try {
            // Check for API Key Selection (Mandatory for Veo)
            if ((window as any).aistudio) {
                const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                if (!hasKey) {
                    await (window as any).aistudio.openSelectKey();
                    // Assuming key selection was successful as per instructions, proceed immediately.
                }
            }

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: genVideoPrompt + ", cinematic, relaxing, high quality, 4k",
                config: {
                    numberOfVideos: 1,
                    resolution: '720p', // Using 720p for faster preview
                    aspectRatio: '16:9'
                }
            });

            // Polling loop
            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }

            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink) {
                // Fetch video bytes using the API key
                const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                if (!response.ok) throw new Error("Failed to download generated video.");
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setGenVideoUrl(url);
            } else {
                throw new Error("Video generation completed but no video URI was returned.");
            }

        } catch (error: any) {
            console.error("Video generation error:", error);
            setGenError("Failed to generate video. Please make sure you have selected a valid paid API key (billing enabled). " + (error.message || ""));
            
            // If the error indicates not found or permission issues, prompt for key again
            if (error.message && error.message.includes("Requested entity was not found") && (window as any).aistudio) {
                 await (window as any).aistudio.openSelectKey();
            }
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in">
            <h2 className="text-2xl font-bold mb-2 text-stone-100">Wellbeing Hub 🧘</h2>
            <p className="text-stone-400 mb-8">
                Your space to relax, recharge, and find a bit of motivation.
            </p>

            {/* Affirmations Carousel */}
            <div className="mb-10 bg-gradient-to-r from-amber-900/40 to-yellow-900/40 rounded-xl p-8 text-center relative overflow-hidden shadow-md border border-amber-900/50">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 to-yellow-600"></div>
                
                <h3 className="text-sm font-bold text-amber-500 mb-6 uppercase tracking-wider flex items-center justify-center gap-2">
                    <span className="text-xl">☀️</span> Daily Affirmations
                </h3>
                
                <div className="flex items-center justify-between gap-2 md:gap-4">
                    <button onClick={handlePrev} className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-amber-500 transition-colors shadow-sm">
                        <ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    
                    <div className="min-h-[100px] flex items-center justify-center px-4">
                        <p className="text-xl md:text-3xl font-serif text-stone-200 italic leading-relaxed transition-all duration-300">
                            "{affirmations[currentIndex]}"
                        </p>
                    </div>

                    <button onClick={handleNext} className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-amber-500 transition-colors shadow-sm">
                        <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>

                <div className="flex justify-center mt-6 gap-1.5 flex-wrap">
                    {affirmations.length <= 15 ? affirmations.map((_, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-6 bg-amber-500' : 'w-1.5 bg-stone-600 hover:bg-stone-500'}`} 
                            aria-label={`Go to affirmation ${idx + 1}`}
                        />
                    )) : (
                        <span className="text-xs font-medium text-amber-500 bg-stone-800 px-2 py-1 rounded-full">
                            {currentIndex + 1} / {affirmations.length}
                        </span>
                    )}
                </div>

                <form onSubmit={handleAddAffirmation} className="mt-8 flex justify-center items-center gap-2 max-w-md mx-auto">
                    <input 
                        type="text" 
                        value={newAffirmation} 
                        onChange={(e) => setNewAffirmation(e.target.value)} 
                        placeholder="Add your own affirmation..."
                        className="flex-grow text-sm p-3 rounded-lg border border-transparent focus:border-amber-500 focus:ring-2 focus:ring-amber-500 bg-stone-800 focus:bg-stone-800/80 transition-colors text-stone-200 placeholder-stone-500 shadow-sm outline-none"
                    />
                    <button type="submit" disabled={!newAffirmation.trim()} className="p-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-colors">
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>

            {/* AI Video Generator - Keeping dark for contrast/cinematic feel */}
            <div className="mb-12 bg-stone-950 border border-stone-800 text-white rounded-xl p-6 md:p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <SparklesIcon className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-xl font-bold">AI Relaxation Visualizer</h3>
                </div>
                <p className="text-stone-400 mb-6">
                    Describe a calming scene (e.g., "A peaceful mountain lake at sunrise") and our AI will generate a unique video clip for you to relax to.
                </p>
                
                <form onSubmit={handleGenerateVideo} className="flex flex-col md:flex-row gap-3 mb-6">
                    <input 
                        type="text" 
                        value={genVideoPrompt}
                        onChange={(e) => setGenVideoPrompt(e.target.value)}
                        placeholder="Describe your perfect relaxing scene..."
                        className="flex-grow p-3 rounded-lg bg-stone-900 border border-stone-700 text-white placeholder-stone-600 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        disabled={isGenerating}
                    />
                    <button 
                        type="submit" 
                        disabled={isGenerating || !genVideoPrompt.trim()}
                        className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg disabled:bg-stone-800 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-w-[140px]"
                    >
                        {isGenerating ? (
                            <>
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                Creating...
                            </>
                        ) : (
                            <>Generate <SparklesIcon className="w-4 h-4" /></>
                        )}
                    </button>
                </form>

                {genError && (
                    <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm mb-4">
                        {genError} <br/>
                        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline font-bold">Check Billing Docs</a>
                    </div>
                )}

                {genVideoUrl && (
                    <div className="animate-fade-in rounded-lg overflow-hidden border border-stone-800 shadow-2xl">
                        <video 
                            src={genVideoUrl} 
                            controls 
                            autoPlay 
                            loop 
                            className="w-full bg-black"
                            style={{ aspectRatio: '16/9' }}
                        />
                    </div>
                )}
            </div>

            <div className="space-y-10">
                {/* Motivational Videos */}
                <section>
                    <h3 className="text-xl font-bold mb-4 text-stone-200">Motivational Clips 💪</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <VideoCard videoId="gztva_I_t3o" title="A Pep Talk from Kid President" />
                        <VideoCard videoId="ZXsQAXx_ao0" title="The Power of Belief" />
                        <VideoCard videoId="StTqXEQ2l-Y" title="How to Stop Procrastinating" />
                    </div>
                </section>

                {/* Peaceful Music */}
                <section>
                    <h3 className="text-xl font-bold mb-4 text-stone-200">Peaceful Music 🎶</h3>
                    <div>
                        <VideoCard videoId="5qap5aO4i9A" title="lofi hip hop radio - beats to relax/study to" />
                    </div>
                </section>
                
                {/* Funny Videos */}
                <section>
                    <h3 className="text-xl font-bold mb-4 text-stone-200">Quick Laughs 😂</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <VideoCard videoId="3nFMv_cW8qA" title="Funny Animals Compilation" />
                        <VideoCard videoId="y0sF3F3i0aI" title="Try Not to Laugh" />
                        <VideoCard videoId="qRj8DPTa2p8" title="Unexpected Moments" />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default WellbeingHubView;