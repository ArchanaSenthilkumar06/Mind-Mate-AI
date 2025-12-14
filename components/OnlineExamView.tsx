
import React from 'react';
import { OnlineExamItem } from '../types';
import { TargetIcon } from './icons/TargetIcon';

interface OnlineExamViewProps {
    exams: OnlineExamItem[];
    onStartExam: (exam: OnlineExamItem) => void;
}

const OnlineExamView: React.FC<OnlineExamViewProps> = ({ exams, onStartExam }) => {
    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in min-h-screen">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-cyan-900/30 rounded-xl text-cyan-500">
                    <TargetIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-stone-100">Online Exams</h2>
                    <p className="text-stone-400">Scheduled assessments and practice tests.</p>
                </div>
            </div>

            <div className="space-y-4">
                {exams.map(exam => (
                    <div key={exam.id} className="flex flex-col md:flex-row items-center justify-between bg-stone-950 border border-stone-800 p-6 rounded-2xl hover:border-cyan-500/30 transition-all">
                        <div className="flex items-start gap-4 mb-4 md:mb-0">
                            <div className="bg-stone-900 p-3 rounded-lg border border-stone-800 text-center min-w-[70px]">
                                <span className="block text-xs text-stone-500 uppercase font-bold">Duration</span>
                                <span className="block text-lg font-bold text-stone-200">{exam.duration}</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{exam.title}</h3>
                                <p className="text-cyan-400 text-sm font-medium">{exam.subject} • {exam.date}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                exam.status === 'Active' ? 'bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse' :
                                exam.status === 'Completed' ? 'bg-stone-800 text-stone-500' :
                                'bg-cyan-900/20 text-cyan-400 border border-cyan-500/30'
                            }`}>
                                {exam.status}
                            </span>
                            <button 
                                disabled={exam.status !== 'Active'}
                                onClick={() => onStartExam(exam)}
                                className={`px-6 py-2 rounded-lg font-bold transition-all ${
                                    exam.status === 'Active' 
                                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20' 
                                    : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                                }`}
                            >
                                {exam.status === 'Completed' ? 'View Results' : 'Start Exam'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OnlineExamView;
