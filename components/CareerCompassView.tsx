
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { CompassIcon } from './icons/CompassIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import Loader from './Loader';

interface CareerPath {
    title: string;
    matchPercentage: number;
    reason: string;
    skills: string[];
    dayInLife: string;
}

const CareerCompassView: React.FC = () => {
    const [interests, setInterests] = useState('');
    const [subjects, setSubjects] = useState('');
    const [hobbies, setHobbies] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [paths, setPaths] = useState<CareerPath[] | null>(null);

    const handleExplore = async () => {
        if (!interests.trim() || !subjects.trim()) return;
        setIsGenerating(true);
        setPaths(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `
                Act as an expert career counselor for a student.
                Analyze the following profile:
                - Interests: ${interests}
                - Favorite Subjects: ${subjects}
                - Hobbies: ${hobbies}

                Suggest 3 potential career paths.
                For each path, provide:
                1. Job Title
                2. Match Percentage (0-100 based on fit)
                3. Reason why it fits
                4. Top 3 required skills
                5. A short, immersive "Day in the Life" paragraph (2-3 sentences).

                Return a JSON array.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                matchPercentage: { type: Type.INTEGER },
                                reason: { type: Type.STRING },
                                skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                                dayInLife: { type: Type.STRING },
                            },
                            required: ['title', 'matchPercentage', 'reason', 'skills', 'dayInLife']
                        }
                    }
                }
            });

            setPaths(JSON.parse(response.text));

        } catch (error) {
            console.error("Career gen error:", error);
            alert("Could not generate career paths. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in min-h-[80vh] flex flex-col">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-900/30 rounded-xl text-indigo-500">
                    <CompassIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-stone-100">Career Compass</h2>
                    <p className="text-stone-400">Discover your future path based on what you love today.</p>
                </div>
            </div>

            {!paths && !isGenerating && (
                <div className="max-w-2xl mx-auto w-full space-y-6">
                    <div className="bg-stone-950 p-6 rounded-xl border border-stone-800">
                        <label className="block text-sm font-bold text-stone-400 mb-2">What are you interested in?</label>
                        <textarea 
                            value={interests}
                            onChange={(e) => setInterests(e.target.value)}
                            placeholder="e.g., Solving puzzles, helping people, space exploration, coding..."
                            className="w-full p-3 bg-stone-900 border border-stone-700 rounded-lg text-stone-200 focus:outline-none focus:border-indigo-500 h-24 resize-none"
                        />
                    </div>
                    <div className="bg-stone-950 p-6 rounded-xl border border-stone-800">
                        <label className="block text-sm font-bold text-stone-400 mb-2">Favorite School Subjects</label>
                        <input 
                            type="text"
                            value={subjects}
                            onChange={(e) => setSubjects(e.target.value)}
                            placeholder="e.g., Math, Physics, Art"
                            className="w-full p-3 bg-stone-900 border border-stone-700 rounded-lg text-stone-200 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="bg-stone-950 p-6 rounded-xl border border-stone-800">
                        <label className="block text-sm font-bold text-stone-400 mb-2">Hobbies (Optional)</label>
                        <input 
                            type="text"
                            value={hobbies}
                            onChange={(e) => setHobbies(e.target.value)}
                            placeholder="e.g., Video games, gardening, reading sci-fi"
                            className="w-full p-3 bg-stone-900 border border-stone-700 rounded-lg text-stone-200 focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <button 
                        onClick={handleExplore}
                        disabled={!interests || !subjects}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <SparklesIcon className="w-5 h-5"/> Find My Path
                    </button>
                </div>
            )}

            {isGenerating && (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Loader message="Analyzing your profile and mapping the future..." />
                </div>
            )}

            {paths && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
                    <div className="lg:col-span-3 flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-stone-200">Recommended Paths</h3>
                        <button onClick={() => setPaths(null)} className="text-sm text-stone-400 hover:text-white">Search Again</button>
                    </div>
                    
                    {paths.map((path, idx) => (
                        <div key={idx} className="bg-stone-950 border border-stone-800 rounded-xl p-6 hover:border-indigo-500/30 transition-all group flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{path.title}</h3>
                                <div className="flex flex-col items-end">
                                    <span className="text-2xl font-bold text-green-400">{path.matchPercentage}%</span>
                                    <span className="text-xs text-stone-500 uppercase">Match</span>
                                </div>
                            </div>
                            
                            <p className="text-stone-400 text-sm mb-4 italic">"{path.reason}"</p>
                            
                            <div className="mb-6">
                                <h4 className="text-xs font-bold text-stone-500 uppercase mb-2">Required Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {path.skills.map((skill, i) => (
                                        <span key={i} className="px-2 py-1 bg-stone-900 border border-stone-700 rounded text-xs text-stone-300">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto bg-stone-900 p-4 rounded-lg border border-stone-800">
                                <h4 className="text-xs font-bold text-indigo-400 uppercase mb-2 flex items-center gap-2">
                                    <span className="text-lg">🌅</span> Day in the Life
                                </h4>
                                <p className="text-stone-300 text-sm leading-relaxed">
                                    {path.dayInLife}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CareerCompassView;
