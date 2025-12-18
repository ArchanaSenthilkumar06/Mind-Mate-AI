
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { GraduationCapIcon } from './icons/GraduationCapIcon';
import { CheckSquareIcon } from './icons/CheckSquareIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import Loader from './Loader';

// Grading Result Interface
interface GradeResult {
    score: number;
    letterGrade: string;
    feedback: string;
    corrections: string[];
}

const SmartGraderView: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [studentWork, setStudentWork] = useState('');
    const [criteria, setCriteria] = useState('');
    const [isGrading, setIsGrading] = useState(false);
    const [result, setResult] = useState<GradeResult | null>(null);

    const handleGrade = async () => {
        if (!topic.trim() || !studentWork.trim()) return;
        setIsGrading(true);
        setResult(null);

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `
            Act as an experienced, encouraging, but fair teacher. 
            Grade the following student submission.
            
            **Topic/Question:** ${topic}
            **Specific Criteria (if any):** ${criteria || "General accuracy, grammar, and clarity."}
            
            **Student Submission:**
            "${studentWork}"
            
            Provide the output in strict JSON format with the following fields:
            - score (number 0-100)
            - letterGrade (string, e.g., 'A', 'B-', 'C+')
            - feedback (string, a paragraph of constructive feedback highlighting strengths and areas for improvement)
            - corrections (array of strings, listing specific errors found or suggestions for improvement)
        `;

        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                score: { type: Type.NUMBER },
                                letterGrade: { type: Type.STRING },
                                feedback: { type: Type.STRING },
                                corrections: { type: Type.ARRAY, items: { type: Type.STRING } }
                            },
                            required: ['score', 'letterGrade', 'feedback', 'corrections']
                        }
                    }
                });

                if (response.text) {
                    const gradeData = JSON.parse(response.text);
                    setResult(gradeData);
                    break; // Success, exit loop
                } else {
                    throw new Error("Empty response from AI");
                }

            } catch (error: any) {
                console.error(`Grading attempt ${attempts + 1} failed:`, error);
                attempts++;
                
                if (attempts >= maxAttempts) {
                    let errorMessage = "The AI grader encountered an issue. Please try again.";
                    // Check for specific 500 error structure from user report
                    if (error.message && error.message.includes("500") && error.message.includes("Rpc failed")) {
                        errorMessage = "Server error (500). The AI service is currently experiencing high traffic. Please try again in a moment.";
                    }
                    alert(errorMessage);
                } else {
                    // Exponential backoff: 1s, 2s, 4s...
                    const delay = 1000 * Math.pow(2, attempts - 1);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        setIsGrading(false);
    };

    const getGradeColor = (grade: string) => {
        if (grade.startsWith('A')) return 'text-green-400';
        if (grade.startsWith('B')) return 'text-blue-400';
        if (grade.startsWith('C')) return 'text-yellow-400';
        if (grade.startsWith('D')) return 'text-orange-400';
        return 'text-red-400';
    };

    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in min-h-[80vh] flex flex-col">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-amber-900/30 rounded-xl text-amber-500">
                    <GraduationCapIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-stone-100">Smart Grader</h2>
                    <p className="text-stone-400">Instant, AI-powered assessment assistance.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
                {/* Input Section */}
                <div className="flex flex-col gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-stone-400 mb-1">Topic / Question</label>
                            <input 
                                type="text" 
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., Explain the causes of the French Revolution"
                                className="w-full p-3 bg-stone-950 border border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-stone-400 mb-1">Grading Criteria (Optional)</label>
                            <input 
                                type="text" 
                                value={criteria}
                                onChange={(e) => setCriteria(e.target.value)}
                                placeholder="e.g., Focus on grammar and historical dates"
                                className="w-full p-3 bg-stone-950 border border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none"
                            />
                        </div>
                        <div className="flex-grow flex flex-col">
                            <label className="block text-sm font-bold text-stone-400 mb-1">Student Submission</label>
                            <textarea 
                                value={studentWork}
                                onChange={(e) => setStudentWork(e.target.value)}
                                placeholder="Paste student essay or answer here..."
                                className="w-full h-64 p-4 bg-stone-950 border border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none resize-none font-sans leading-relaxed"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleGrade}
                        disabled={isGrading || !topic || !studentWork}
                        className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isGrading ? 'Grading...' : <><SparklesIcon className="w-5 h-5"/> Analyze & Grade</>}
                    </button>
                </div>

                {/* Result Section */}
                <div className="bg-stone-950 border border-stone-800 rounded-xl p-6 relative flex flex-col">
                    {isGrading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader message="Evaluating work..." />
                        </div>
                    ) : result ? (
                        <div className="animate-slide-up h-full flex flex-col">
                            <div className="flex justify-between items-center border-b border-stone-800 pb-4 mb-6">
                                <h3 className="text-xl font-bold text-stone-200">Grading Report</h3>
                                <div className="text-right">
                                    <div className={`text-4xl font-extrabold ${getGradeColor(result.letterGrade)}`}>
                                        {result.letterGrade}
                                    </div>
                                    <p className="text-stone-500 text-xs font-bold uppercase">{result.score} / 100</p>
                                </div>
                            </div>

                            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                                <div>
                                    <h4 className="text-sm font-bold text-stone-300 mb-2 uppercase tracking-wide">Feedback</h4>
                                    <p className="text-stone-400 leading-relaxed text-sm bg-stone-900 p-4 rounded-lg border border-stone-800">
                                        {result.feedback}
                                    </p>
                                </div>

                                {result.corrections.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-bold text-amber-500 mb-2 uppercase tracking-wide flex items-center gap-2">
                                            <CheckSquareIcon className="w-4 h-4" /> Suggestions & Fixes
                                        </h4>
                                        <ul className="space-y-2">
                                            {result.corrections.map((correction, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-sm text-stone-300 bg-stone-900/50 p-3 rounded-lg border border-stone-800/50">
                                                    <span className="text-amber-500 mt-1">•</span>
                                                    <span>{correction}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-stone-600 opacity-50">
                            <GraduationCapIcon className="w-16 h-16 mb-4" />
                            <p className="text-center max-w-xs">Enter topic and student work to receive a detailed assessment.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SmartGraderView;
