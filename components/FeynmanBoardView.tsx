
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { StudyTopic } from '../types';
import { PresentationIcon } from './icons/PresentationIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import Loader from './Loader';

interface FeynmanBoardViewProps {
    topics: StudyTopic[];
}

// Schema for the evaluation response
const evaluationSchema = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.INTEGER, description: "A score from 0 to 100 representing how well the student understands the topic." },
        strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 1-2 things the student explained correctly."
        },
        missingConcepts: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of key concepts the student failed to mention or got wrong."
        },
        simplifiedExplanation: { 
            type: Type.STRING, 
            description: "A clear, simple paragraph explaining the topic as if to a 5-year-old (ELI5)." 
        }
    },
    required: ["score", "strengths", "missingConcepts", "simplifiedExplanation"]
};

const FeynmanBoardView: React.FC<FeynmanBoardViewProps> = ({ topics }) => {
    // Default to custom mode if no topics exist
    const [selectedTopicName, setSelectedTopicName] = useState<string>(
        topics.length > 0 ? topics[0].topicName : '__custom__'
    );
    const [customTopic, setCustomTopic] = useState('');
    
    const [explanation, setExplanation] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any | null>(null);

    // Update state if topics change (e.g. user generates a plan while on this view)
    useEffect(() => {
        if (topics.length > 0 && selectedTopicName === '__custom__' && !customTopic) {
            setSelectedTopicName(topics[0].topicName);
        }
    }, [topics]);

    const handleAnalyze = async () => {
        const activeTopic = selectedTopicName === '__custom__' ? customTopic : selectedTopicName;
        
        if (!explanation.trim() || !activeTopic.trim()) return;
        
        setIsAnalyzing(true);
        setResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const selectedTopicData = topics.find(t => t.topicName === activeTopic);
            
            // Context helps if it's a known topic, otherwise generic
            const context = selectedTopicData 
                ? `Key Sub-topics involved: ${selectedTopicData.subTopics.join(', ')}` 
                : 'General knowledge concept';

            const prompt = `
                You are a strict but fair professor grading a student using the 'Feynman Technique'.
                
                The Topic: "${activeTopic}"
                Context: ${context}
                
                The Student's Explanation:
                "${explanation}"
                
                Task:
                1. Evaluate how well they understand the concept.
                2. Identify if they used jargon to hide lack of understanding (bad) or simple language (good).
                3. Identify what they missed.
                4. Provide a 'Golden Explanation' that is simple and accurate.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: evaluationSchema,
                }
            });

            const jsonResponse = JSON.parse(response.text);
            setResult(jsonResponse);

        } catch (error) {
            console.error("Error analyzing explanation:", error);
            alert("Something went wrong with the grading AI. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-400';
        if (score >= 70) return 'text-amber-400';
        return 'text-red-400';
    };

    const isAnalyzeDisabled = isAnalyzing || !explanation.trim() || (selectedTopicName === '__custom__' && !customTopic.trim());

    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in min-h-[80vh]">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-900/30 rounded-lg text-amber-500">
                    <PresentationIcon className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-stone-100">The Feynman Board</h2>
                    <p className="text-stone-400 text-sm">"If you can't explain it simply, you don't understand it well enough." — Albert Einstein</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="bg-stone-950 p-6 rounded-xl border border-stone-800 shadow-inner">
                        <label className="block text-sm font-medium text-stone-400 mb-2">1. Choose a concept to teach</label>
                        
                        {topics.length > 0 && (
                            <select 
                                value={selectedTopicName} 
                                onChange={(e) => { setSelectedTopicName(e.target.value); setResult(null); }}
                                className="w-full p-3 bg-stone-800 border border-stone-700 rounded-lg text-stone-200 focus:ring-2 focus:ring-amber-500 outline-none transition-shadow mb-3"
                            >
                                {topics.map(t => (
                                    <option key={t.topicName} value={t.topicName}>{t.topicName}</option>
                                ))}
                                <option value="__custom__">+ Custom Topic / Concept</option>
                            </select>
                        )}

                        {(selectedTopicName === '__custom__' || topics.length === 0) && (
                            <input 
                                type="text"
                                value={customTopic}
                                onChange={(e) => setCustomTopic(e.target.value)}
                                placeholder="e.g., Photosynthesis, The French Revolution, Recursion..."
                                className="w-full p-3 bg-stone-800 border border-stone-700 rounded-lg text-stone-200 focus:ring-2 focus:ring-amber-500 outline-none placeholder-stone-500"
                            />
                        )}
                    </div>

                    <div className="bg-stone-950 p-6 rounded-xl border border-stone-800 shadow-inner flex flex-col h-[400px]">
                        <label className="block text-sm font-medium text-stone-400 mb-2">2. Explain it in your own words</label>
                        <textarea 
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            placeholder="Imagine you are teaching this to a 5-year-old. Don't just recite definitions—explain how it works..."
                            className="flex-grow w-full p-4 bg-stone-800/50 border border-stone-700 rounded-lg text-stone-200 focus:ring-2 focus:ring-amber-500 outline-none resize-none font-sans leading-relaxed placeholder-stone-600"
                        />
                        <div className="mt-4 flex justify-end">
                            <button 
                                onClick={handleAnalyze}
                                disabled={isAnalyzeDisabled}
                                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-bold rounded-lg shadow-lg transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isAnalyzing ? 'Grading...' : <>Check Understanding <SparklesIcon className="w-5 h-5"/></>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Output Section */}
                <div className="relative">
                    {isAnalyzing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-stone-900/80 z-10 rounded-xl backdrop-blur-sm">
                            <Loader message="Professor AI is reviewing your explanation..." />
                        </div>
                    )}
                    
                    {result ? (
                        <div className="h-full bg-stone-950 border border-stone-800 rounded-xl p-6 shadow-xl animate-slide-up overflow-y-auto">
                            <div className="flex justify-between items-center border-b border-stone-800 pb-4 mb-6">
                                <h3 className="text-lg font-semibold text-stone-300">Evaluation Result</h3>
                                <div className="text-center">
                                    <span className={`text-4xl font-bold ${getScoreColor(result.score)}`}>{result.score}%</span>
                                    <p className="text-xs text-stone-500 uppercase tracking-wide mt-1">Mastery Score</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-bold text-green-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span> What you nailed
                                    </h4>
                                    <ul className="list-disc list-inside text-stone-300 space-y-1 text-sm bg-green-900/10 p-3 rounded-lg border border-green-900/30">
                                        {result.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-red-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500"></span> Knowledge Gaps
                                    </h4>
                                    {result.missingConcepts.length > 0 ? (
                                        <ul className="list-disc list-inside text-stone-300 space-y-1 text-sm bg-red-900/10 p-3 rounded-lg border border-red-900/30">
                                            {result.missingConcepts.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-stone-500 italic">No major gaps detected. Great job!</p>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-amber-500 mb-2 uppercase tracking-wide flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> The "Golden" Explanation
                                    </h4>
                                    <div className="p-4 bg-amber-900/20 border border-amber-900/40 rounded-lg">
                                        <p className="text-stone-200 text-sm leading-relaxed italic">
                                            "{result.simplifiedExplanation}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full border-2 border-dashed border-stone-800 rounded-xl flex flex-col items-center justify-center text-stone-600 p-8 text-center">
                            <PresentationIcon className="w-16 h-16 mb-4 opacity-20" />
                            <h3 className="text-xl font-bold text-stone-500 mb-2">Ready to Teach?</h3>
                            <p className="max-w-xs mb-4">Select a topic and explain it on the left. The AI will evaluate your mastery.</p>
                            {selectedTopicName === '__custom__' && !customTopic && (
                                <p className="text-amber-500 text-sm animate-pulse">Please enter a topic name to begin.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeynmanBoardView;
