
import React from 'react';
import { ActivityIcon } from './icons/ActivityIcon';
import { TargetIcon } from './icons/TargetIcon';
import ExamTimetable from './ExamTimetable';

const ParentDashboardView: React.FC = () => {
    // Mock data for the child
    const childName = "Anika";
    
    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in min-h-screen">
             <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-green-900/30 rounded-xl text-green-500">
                    <ActivityIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-stone-100">Parent Insight Hub</h2>
                    <p className="text-stone-400">Supporting {childName}'s journey.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Wellbeing Card */}
                <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ActivityIcon className="w-24 h-24 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-stone-200 mb-4">Weekly Wellbeing</h3>
                    
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-3xl border-2 border-green-500">
                            😊
                        </div>
                        <div>
                            <p className="text-stone-400 text-sm">Average Mood</p>
                            <p className="text-2xl font-bold text-green-400">Confident</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                         <div className="bg-stone-900 p-3 rounded-lg border border-stone-800 flex justify-between">
                            <span className="text-stone-400">Stress Level</span>
                            <span className="text-stone-200 font-bold">Low (3/10)</span>
                         </div>
                         <div className="bg-stone-900 p-3 rounded-lg border border-stone-800 flex justify-between">
                            <span className="text-stone-400">Sleep Schedule</span>
                            <span className="text-stone-200 font-bold">Consistent</span>
                         </div>
                    </div>
                </div>

                 {/* Focus & Effort Card */}
                 <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 shadow-lg">
                    <h3 className="text-xl font-bold text-stone-200 mb-4 flex items-center gap-2">
                         <TargetIcon className="w-5 h-5 text-amber-500"/> Effort Tracking
                    </h3>
                    
                    <div className="mb-4">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-stone-400">Study Goal (10 hrs/week)</span>
                            <span className="text-sm font-bold text-amber-500">8.5 hrs</span>
                        </div>
                        <div className="w-full bg-stone-900 rounded-full h-2.5">
                            <div className="bg-amber-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                    </div>

                    <ul className="space-y-3 mt-6">
                        <li className="flex items-start gap-3">
                            <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                            <div>
                                <p className="text-stone-200 text-sm font-medium">Completed "History Essay Outline"</p>
                                <p className="text-stone-500 text-xs">2 hours ago</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                            <div>
                                <p className="text-stone-200 text-sm font-medium">Joined "Quantum Physics Crew" Group</p>
                                <p className="text-stone-500 text-xs">Yesterday</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            
            {/* Exam Timetable Section */}
            <div className="mb-8">
                 <ExamTimetable />
            </div>
        </div>
    );
};

export default ParentDashboardView;
