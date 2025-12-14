
import React from 'react';
import { Assignment } from '../types';
import { ClipboardCheckIcon } from './icons/ClipboardCheckIcon';

interface HomeworkViewProps {
    assignments: Assignment[];
    userRole: 'student' | 'teacher' | 'parent';
    onToggleStatus: (id: string) => void;
}

const HomeworkView: React.FC<HomeworkViewProps> = ({ assignments, userRole, onToggleStatus }) => {
    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in min-h-screen">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-orange-900/30 rounded-xl text-orange-500">
                    <ClipboardCheckIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-stone-100">Homework Plan</h2>
                    <p className="text-stone-400">
                        {userRole === 'teacher' ? 'Assignments you have distributed.' : 'Keep track of your tasks and deadlines.'}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {assignments.map(assignment => (
                    <div key={assignment.id} className="flex flex-col md:flex-row md:items-center bg-stone-950 border border-stone-800 p-5 rounded-xl hover:border-orange-500/30 transition-colors">
                        
                        {/* Status Indicator */}
                        <div className={`w-2 h-full absolute left-0 top-0 rounded-l-xl ${
                            assignment.status === 'Completed' ? 'bg-green-500' :
                            assignment.status === 'Late' ? 'bg-red-500' : 'bg-orange-500'
                        }`}></div>

                        <div className="flex-grow pl-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-xs font-bold text-orange-400 uppercase tracking-wide">{assignment.subject}</span>
                                    <h3 className={`text-lg font-bold text-stone-200 mt-1 ${assignment.status === 'Completed' ? 'line-through opacity-60' : ''}`}>{assignment.title}</h3>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                                    assignment.status === 'Completed' ? 'bg-green-900/30 text-green-400' :
                                    assignment.status === 'Late' ? 'bg-red-900/30 text-red-400' :
                                    'bg-orange-900/30 text-orange-400'
                                }`}>
                                    {assignment.status}
                                </span>
                            </div>
                            <p className="text-sm text-stone-500 mt-2">{assignment.description}</p>
                            
                            <div className="flex items-center gap-4 mt-4 text-xs text-stone-400">
                                <span className="flex items-center gap-1">
                                    📅 Due: <span className="text-stone-300">{assignment.dueDate}</span>
                                </span>
                                <span>•</span>
                                <span>Assigned by: {assignment.assignedBy}</span>
                            </div>
                        </div>

                        {userRole === 'student' && (
                            <button 
                                onClick={() => onToggleStatus(assignment.id)}
                                className={`mt-4 md:mt-0 md:ml-6 px-4 py-2 text-sm font-bold rounded-lg transition-colors flex-shrink-0 ${
                                    assignment.status === 'Completed' 
                                    ? 'bg-stone-800 text-stone-500 hover:text-stone-300' 
                                    : 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                                }`}
                            >
                                {assignment.status === 'Completed' ? 'Undo' : 'Mark Done'}
                            </button>
                        )}
                        
                        {userRole === 'parent' && (
                            <div className="mt-4 md:mt-0 md:ml-6 text-sm text-stone-500 italic">
                                Ready for review
                            </div>
                        )}
                    </div>
                ))}
                
                {assignments.length === 0 && (
                    <div className="text-center p-12 bg-stone-950 rounded-xl border border-stone-800 border-dashed">
                        <p className="text-stone-500">No homework assigned yet! 🎉</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeworkView;
