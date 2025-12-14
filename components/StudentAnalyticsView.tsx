
import React from 'react';
import { StudyPlan } from '../types';
import { BarChartIcon } from './icons/BarChartIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { TargetIcon } from './icons/TargetIcon';
import { ActivityIcon } from './icons/ActivityIcon';

interface StudentAnalyticsViewProps {
    plan: StudyPlan | null;
}

const StudentAnalyticsView: React.FC<StudentAnalyticsViewProps> = ({ plan }) => {
    // Mock Data Generator
    const generateWeeklyData = () => [
        { day: 'Mon', hours: 3.5, color: 'bg-pink-500' },
        { day: 'Tue', hours: 5.2, color: 'bg-purple-500' },
        { day: 'Wed', hours: 2.0, color: 'bg-indigo-500' },
        { day: 'Thu', hours: 4.5, color: 'bg-blue-500' },
        { day: 'Fri', hours: 6.0, color: 'bg-cyan-500' },
        { day: 'Sat', hours: 3.0, color: 'bg-teal-500' },
        { day: 'Sun', hours: 1.5, color: 'bg-emerald-500' },
    ];
    
    const weeklyData = generateWeeklyData();
    const maxHours = 7; // Chart scaling

    const subjectData = [
        { name: plan?.courseName || 'General Studies', percent: 45, color: 'bg-amber-500', text: 'text-amber-500' },
        { name: 'History', percent: 30, color: 'bg-orange-500', text: 'text-orange-500' },
        { name: 'Physics', percent: 15, color: 'bg-red-500', text: 'text-red-500' },
        { name: 'Other', percent: 10, color: 'bg-stone-600', text: 'text-stone-400' },
    ];

    const badges = [
        { id: 1, name: 'Early Bird', icon: '🌅', desc: 'Studied before 8 AM', unlocked: true, color: 'from-orange-400 to-pink-500' },
        { id: 2, name: 'Deep Focus', icon: '🧠', desc: '2 hours uninterrupted', unlocked: true, color: 'from-blue-400 to-indigo-600' },
        { id: 3, name: 'Streak Master', icon: '🔥', desc: '7 day streak', unlocked: true, color: 'from-red-500 to-orange-500' },
        { id: 4, name: 'Quiz Whiz', icon: '✨', desc: 'Scored 100% on a quiz', unlocked: false, color: 'from-stone-700 to-stone-600' },
    ];

    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in min-h-[80vh]">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-900/30 rounded-xl text-indigo-400">
                    <BarChartIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-stone-100">My Study Analytics</h2>
                    <p className="text-stone-400">Track your growth, focus, and achievements.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* 1. Study Hours (Weekly Bar Chart) */}
                <div className="lg:col-span-2 bg-stone-950 p-6 rounded-2xl border border-stone-800 shadow-lg relative overflow-hidden">
                    <h3 className="text-lg font-bold text-stone-200 mb-6 flex items-center gap-2">
                        <ActivityIcon className="w-5 h-5 text-pink-500"/> Study Activity (Hours)
                    </h3>
                    
                    <div className="flex items-end justify-between h-48 gap-2 sm:gap-4 px-2">
                        {weeklyData.map((d) => (
                            <div key={d.day} className="flex flex-col items-center gap-2 w-full group">
                                <div className="relative w-full flex justify-center">
                                    <div 
                                        className={`w-full max-w-[40px] rounded-t-lg opacity-80 group-hover:opacity-100 transition-all duration-500 ease-out ${d.color} shadow-[0_0_15px_rgba(0,0,0,0.3)]`} 
                                        style={{ height: `${(d.hours / maxHours) * 160}px` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-stone-700">
                                            {d.hours} hrs
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-stone-500">{d.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Focus Score Card (Radial or Big Number) */}
                <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 p-6 rounded-2xl border border-indigo-500/30 shadow-lg flex flex-col justify-center items-center text-center relative">
                    <div className="absolute top-4 right-4">
                        <TargetIcon className="w-6 h-6 text-indigo-400 opacity-50"/>
                    </div>
                    <h3 className="text-stone-300 font-bold mb-4 uppercase tracking-widest text-sm">Focus Quality</h3>
                    
                    <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#333" strokeWidth="10" />
                            <circle 
                                cx="50%" cy="50%" r="45%" 
                                fill="none" 
                                stroke="url(#gradientFocus)" 
                                strokeWidth="10" 
                                strokeDasharray="283" 
                                strokeDashoffset="40" 
                                strokeLinecap="round"
                            />
                            <defs>
                                <linearGradient id="gradientFocus" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#818cf8" />
                                    <stop offset="100%" stopColor="#c084fc" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-extrabold text-white">88%</span>
                            <span className="text-xs text-indigo-300">High Focus</span>
                        </div>
                    </div>
                    <p className="text-sm text-stone-400">
                        You're most productive between <span className="text-indigo-400 font-bold">9 AM - 11 AM</span>.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* 3. Subject Distribution */}
                 <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800">
                    <h3 className="text-lg font-bold text-stone-200 mb-4">Topic Breakdown</h3>
                    <div className="space-y-4">
                        {subjectData.map((subj) => (
                            <div key={subj.name}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-stone-300 font-medium">{subj.name}</span>
                                    <span className={`font-bold ${subj.text}`}>{subj.percent}%</span>
                                </div>
                                <div className="w-full bg-stone-800 rounded-full h-3 overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${subj.color} relative overflow-hidden`} 
                                        style={{ width: `${subj.percent}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>

                 {/* 4. Gamification / Badges */}
                 <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800">
                    <h3 className="text-lg font-bold text-stone-200 mb-4 flex items-center gap-2">
                        <TrophyIcon className="w-5 h-5 text-yellow-500"/> Achievements
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {badges.map((badge) => (
                            <div 
                                key={badge.id} 
                                className={`p-3 rounded-xl border flex items-center gap-3 transition-all hover:scale-105 cursor-default ${
                                    badge.unlocked 
                                        ? 'bg-stone-900 border-stone-700 opacity-100' 
                                        : 'bg-stone-900/50 border-stone-800 opacity-50 grayscale'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gradient-to-br ${badge.color} shadow-lg`}>
                                    {badge.icon}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-stone-200">{badge.name}</p>
                                    <p className="text-[10px] text-stone-500">{badge.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default StudentAnalyticsView;
