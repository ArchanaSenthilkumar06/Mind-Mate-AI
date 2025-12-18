
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { CameraIcon } from './icons/CameraIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import Loader from './Loader';

const SnapSolveView: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [solution, setSolution] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setSolution(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;
        setIsAnalyzing(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Extract base64 data (remove "data:image/png;base64," prefix)
            const base64Data = image.split(',')[1];
            const mimeType = image.split(';')[0].split(':')[1];

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash', // Using 2.5 Flash for vision
                contents: {
                    parts: [
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Data
                            }
                        },
                        {
                            text: "Analyze this image. If it's a math problem, solve it step-by-step. If it's a diagram, explain it. If it's text, summarize it. Be a helpful tutor."
                        }
                    ]
                }
            });

            setSolution(response.text || "Could not analyze image.");
        } catch (error) {
            console.error("Vision error:", error);
            setSolution("Failed to analyze image. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in min-h-[80vh] flex flex-col">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-purple-900/30 rounded-xl text-purple-500">
                    <CameraIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-stone-100">Snap & Solve</h2>
                    <p className="text-stone-400">Upload a problem or diagram, and get an instant explanation.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
                {/* Upload Section */}
                <div className="flex flex-col gap-4">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex-grow border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 cursor-pointer transition-all ${
                            image ? 'border-purple-500 bg-stone-900' : 'border-stone-700 hover:border-purple-500 hover:bg-stone-800'
                        }`}
                    >
                        {image ? (
                            <img src={image} alt="Uploaded" className="max-h-[400px] w-auto rounded-lg shadow-lg object-contain" />
                        ) : (
                            <>
                                <CameraIcon className="w-16 h-16 text-stone-600 mb-4" />
                                <p className="text-stone-400 font-medium">Click to upload image</p>
                                <p className="text-stone-600 text-sm mt-2">Supports JPG, PNG</p>
                            </>
                        )}
                        <input 
                            ref={fileInputRef} 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            className="hidden" 
                        />
                    </div>

                    <button 
                        onClick={handleAnalyze}
                        disabled={!image || isAnalyzing}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isAnalyzing ? 'Analyzing...' : <><SparklesIcon className="w-5 h-5"/> Solve / Explain</>}
                    </button>
                </div>

                {/* Solution Section */}
                <div className="bg-stone-950 border border-stone-800 rounded-xl p-6 relative min-h-[300px]">
                    {isAnalyzing ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader message="Reading image and solving..." />
                        </div>
                    ) : solution ? (
                        <div className="prose prose-invert prose-purple max-w-none animate-slide-up">
                            <h3 className="text-xl font-bold text-stone-200 mb-4 border-b border-stone-800 pb-2">
                                Solution / Analysis
                            </h3>
                            <div className="whitespace-pre-wrap text-stone-300 leading-relaxed text-lg">
                                {solution}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-stone-600 opacity-50">
                            <SparklesIcon className="w-16 h-16 mb-4" />
                            <p className="text-center">Upload an image to see the magic.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SnapSolveView;
