
import React, { useState, useEffect } from 'react';
import { OnlineExamItem } from '../types';
import { TargetIcon } from './icons/TargetIcon';

interface ExamTakingViewProps {
    exam: OnlineExamItem;
    onBack: () => void;
    onSubmit: () => void;
}

const ExamTakingView: React.FC<ExamTakingViewProps> = ({ exam, onBack, onSubmit }) => {
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState<{ [key: number]: number }>({});
    const [timeLeft, setTimeLeft] = useState(30 * 60); // Default 30 mins
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(); // Auto submit
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleOptionSelect = (optionIdx: number) => {
        if (isSubmitted) return;
        setAnswers(prev => ({ ...prev, [currentQuestionIdx]: optionIdx }));
    };

    const handleSubmit = () => {
        let correct = 0;
        exam.questions.forEach((q, idx) => {
            if (answers[idx] === q.correctIndex) correct++;
        });
        setScore(correct);
        setIsSubmitted(true);
        // We don't call parent onSubmit immediately so user can see result
    };

    const handleFinish = () => {
        onSubmit(); // Call parent to update global state and go back
    };

    const currentQ = exam.questions[currentQuestionIdx];

    if (isSubmitted) {
        return (
            <div className="bg-stone-900 border border-stone-800 p-8 rounded-2xl shadow-xl animate-fade-in min-h-screen flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-900/50">
                    <TargetIcon className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-stone-100 mb-2">Exam Completed!</h2>
                <p className="text-stone-400 mb-8">You have successfully submitted {exam.title}.</p>
                
                <div className="bg-stone-950 border border-stone-800 p-6 rounded-xl w-full max-w-sm mb-8">
                    <p className="text-sm font-bold text-stone-500 uppercase tracking-wide">Your Score</p>
                    <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 my-2">
                        {Math.round((score / exam.questions.length) * 100)}%
                    </div>
                    <p className="text-stone-400">{score} out of {exam.questions.length} correct</p>
                </div>

                <button onClick={handleFinish} className="px-8 py-3 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-lg transition-colors">
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl shadow-xl animate-fade-in min-h-screen flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-stone-950 border-b border-stone-800 p-4 flex justify-between items-center sticky top-0 z-10">
                <div>
                    <h2 className="text-lg font-bold text-stone-100">{exam.title}</h2>
                    <p className="text-xs text-stone-500">Question {currentQuestionIdx + 1} of {exam.questions.length}</p>
                </div>
                <div className={`text-xl font-mono font-bold ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-grow p-6 md:p-12 flex flex-col justify-center max-w-4xl mx-auto w-full">
                <h3 className="text-2xl font-medium text-stone-200 mb-8 leading-relaxed">
                    {currentQ.question}
                </h3>

                <div className="space-y-3">
                    {currentQ.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleOptionSelect(idx)}
                            className={`w-full p-4 rounded-xl text-left border transition-all duration-200 group ${
                                answers[currentQuestionIdx] === idx
                                    ? 'bg-cyan-900/30 border-cyan-500 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                    : 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-750 hover:border-stone-600'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    answers[currentQuestionIdx] === idx ? 'border-cyan-500 bg-cyan-500' : 'border-stone-600 group-hover:border-stone-500'
                                }`}>
                                    {answers[currentQuestionIdx] === idx && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </div>
                                <span className="text-lg">{option}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Footer Navigation */}
            <div className="bg-stone-950 border-t border-stone-800 p-4 flex justify-between items-center">
                <button 
                    onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIdx === 0}
                    className="px-6 py-2 rounded-lg font-medium text-stone-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    Previous
                </button>

                {currentQuestionIdx === exam.questions.length - 1 ? (
                    <button 
                        onClick={handleSubmit}
                        className="px-8 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-lg shadow-lg transition-transform active:scale-95"
                    >
                        Submit Exam
                    </button>
                ) : (
                    <button 
                        onClick={() => setCurrentQuestionIdx(prev => Math.min(exam.questions.length - 1, prev + 1))}
                        className="px-8 py-2 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-lg transition-colors"
                    >
                        Next Question
                    </button>
                )}
            </div>
        </div>
    );
};

export default ExamTakingView;
