
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { PenToolIcon } from './icons/PenToolIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import Loader from './Loader';

const SmartNotesView: React.FC = () => {
    const [rawNotes, setRawNotes] = useState('');
    const [formattedNotes, setFormattedNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [formatType, setFormatType] = useState<'Cornell' | 'Outline' | 'Summary' | 'Action'>('Cornell');

    const handleFormat = async () => {
        if (!rawNotes.trim()) return;
        setIsProcessing(true);
        setFormattedNotes('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let prompt = "";
            switch (formatType) {
                case 'Cornell':
                    prompt = "Rewrite the following notes using the Cornell Note-taking system. Use Markdown. Separate cues/questions from the main notes.";
                    break;
                case 'Outline':
                    prompt = "Rewrite the following text as a structured hierarchical outline using Markdown bullet points.";
                    break;
                case 'Summary':
                    prompt = "Provide a concise executive summary of the following text in one paragraph, followed by 3 key takeaways.";
                    break;
                case 'Action':
                    prompt = "Extract all action items, to-dos, and deadlines from the text and list them as a checklist.";
                    break;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `${prompt}\n\nInput Text:\n${rawNotes}`,
            });

            setFormattedNotes(response.text || "Could not format notes.");

        } catch (error) {
            console.error("Note formatting error", error);
            setFormattedNotes("Error processing notes. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in min-h-[80vh] flex flex-col">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-teal-900/30 rounded-xl text-teal-500">
                    <PenToolIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-stone-100">Smart Notes</h2>
                    <p className="text-stone-400">Turn messy thoughts into structured knowledge.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
                {/* Input Section */}
                <div className="flex flex-col gap-4">
                    <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex-grow flex flex-col">
                        <label className="block text-sm font-bold text-stone-400 mb-2">Raw Notes / Brain Dump</label>
                        <textarea 
                            value={rawNotes}
                            onChange={(e) => setRawNotes(e.target.value)}
                            placeholder="Paste lecture notes, thoughts, or a messy draft here..."
                            className="flex-grow w-full p-4 bg-stone-900 border border-stone-700 rounded-lg text-stone-200 focus:outline-none focus:border-teal-500 resize-none font-mono text-sm leading-relaxed"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {['Cornell', 'Outline', 'Summary', 'Action'].map((t) => (
                            <button 
                                key={t}
                                onClick={() => setFormatType(t as any)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                    formatType === t 
                                        ? 'bg-teal-600 text-white shadow-md' 
                                        : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={handleFormat}
                        disabled={isProcessing || !rawNotes.trim()}
                        className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isProcessing ? 'Structuring...' : <><SparklesIcon className="w-5 h-5"/> Magic Format</>}
                    </button>
                </div>

                {/* Output Section */}
                <div className="bg-stone-950 border border-stone-800 rounded-xl p-6 relative flex flex-col min-h-[400px]">
                    {isProcessing ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader message="Organizing your thoughts..." />
                        </div>
                    ) : formattedNotes ? (
                        <div className="animate-slide-up h-full flex flex-col">
                            <div className="flex justify-between items-center border-b border-stone-800 pb-4 mb-4">
                                <h3 className="text-lg font-bold text-stone-200">{formatType} Output</h3>
                                <button 
                                    onClick={() => navigator.clipboard.writeText(formattedNotes)}
                                    className="text-xs text-teal-500 hover:text-teal-400 font-bold uppercase"
                                >
                                    Copy Text
                                </button>
                            </div>
                            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                                <div className="prose prose-invert prose-teal max-w-none text-sm leading-relaxed whitespace-pre-wrap text-stone-300">
                                    {formattedNotes}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-stone-600 opacity-50">
                            <PenToolIcon className="w-16 h-16 mb-4" />
                            <p className="text-center">Formatted notes will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SmartNotesView;
