
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { LightbulbIcon } from './icons/LightbulbIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import Loader from './Loader';

const MnemonicView: React.FC = () => {
    const [input, setInput] = useState('');
    const [technique, setTechnique] = useState<'Story' | 'Palace' | 'Acronym'>('Story');
    const [result, setResult] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!input.trim()) return;
        setIsGenerating(true);
        setResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let prompt = "";
            if (technique === 'Story') {
                prompt = `Create a vivid, bizarre, and memorable short story to help me memorize the following list/concept: "${input}". Bold the key terms in the story.`;
            } else if (technique === 'Palace') {
                prompt = `Create a 'Memory Palace' (Method of Loci) using a standard house layout to memorize: "${input}". Place each key item in a specific room/furniture. Be highly visual.`;
            } else {
                prompt = `Create a clever acronym or mnemonic phrase to memorize: "${input}". Explain what each letter stands for.`;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setResult(response.text || "Could not generate mnemonic.");
        } catch (error) {
            console.error("Mnemonic generation error", error);
            setResult("Error generating mnemonic. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in min-h-[80vh] flex flex-col">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-amber-900/30 rounded-xl text-amber-500">
                    <LightbulbIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-stone-100">Mnemonic Master</h2>
                    <p className="text-stone-400">Hack your memory with behavioral psychology techniques.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="bg-stone-950 p-6 rounded-xl border border-stone-800">
                        <label className="block text-sm font-bold text-stone-300 mb-2">What do you need to memorize?</label>
                        <textarea 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="e.g., The first 10 elements of the periodic table, or the causes of WW1..."
                            className="w-full h-32 p-4 bg-stone-800 border border-stone-700 rounded-xl text-stone-200 focus:ring-2 focus:ring-amber-500 outline-none resize-none placeholder-stone-600"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <button 
                            onClick={() => setTechnique('Story')}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${technique === 'Story' ? 'border-amber-500 bg-amber-900/20 text-amber-100' : 'border-stone-700 bg-stone-900 text-stone-400 hover:bg-stone-800'}`}
                        >
                            <span className="text-2xl">📖</span>
                            <span className="text-xs font-bold uppercase">Story</span>
                        </button>
                        <button 
                            onClick={() => setTechnique('Palace')}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${technique === 'Palace' ? 'border-purple-500 bg-purple-900/20 text-purple-100' : 'border-stone-700 bg-stone-900 text-stone-400 hover:bg-stone-800'}`}
                        >
                            <span className="text-2xl">🏰</span>
                            <span className="text-xs font-bold uppercase">Palace</span>
                        </button>
                        <button 
                            onClick={() => setTechnique('Acronym')}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${technique === 'Acronym' ? 'border-green-500 bg-green-900/20 text-green-100' : 'border-stone-700 bg-stone-900 text-stone-400 hover:bg-stone-800'}`}
                        >
                            <span className="text-2xl">🔠</span>
                            <span className="text-xs font-bold uppercase">Acronym</span>
                        </button>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !input.trim()}
                        className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isGenerating ? 'Consulting Brain...' : <><SparklesIcon className="w-5 h-5"/> Generate Mnemonic</>}
                    </button>
                </div>

                {/* Output Section */}
                <div className="bg-stone-950 border border-stone-800 rounded-xl p-6 relative min-h-[300px]">
                    {isGenerating ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader message="Weaving memory threads..." />
                        </div>
                    ) : result ? (
                        <div className="prose prose-invert prose-amber max-w-none animate-slide-up">
                            <h3 className="text-xl font-bold text-stone-200 mb-4 border-b border-stone-800 pb-2 flex items-center gap-2">
                                {technique === 'Story' && '📖 Narrative Chain'}
                                {technique === 'Palace' && '🏰 Memory Palace'}
                                {technique === 'Acronym' && '🔠 Mnemonic Key'}
                            </h3>
                            <div className="whitespace-pre-wrap text-stone-300 leading-relaxed text-lg">
                                {result}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-stone-600 opacity-50">
                            <LightbulbIcon className="w-16 h-16 mb-4" />
                            <p className="text-center">Your memory aid will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MnemonicView;
