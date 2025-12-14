
import React from 'react';
import { User } from '../types';
import { UserIcon } from './icons/UserIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface MyProfileViewProps {
    user: User;
}

const MyProfileView: React.FC<MyProfileViewProps> = ({ user }) => {
    return (
        <div className="bg-stone-900 border border-stone-800 p-8 rounded-3xl shadow-2xl animate-fade-in min-h-screen relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1 mb-4 shadow-lg">
                    <div className="w-full h-full rounded-full bg-stone-900 flex items-center justify-center">
                        <UserIcon className="w-16 h-16 text-indigo-400" />
                    </div>
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-1">{user.name}</h2>
                <p className="text-indigo-400 font-medium bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-500/30 uppercase text-xs tracking-wider">
                    {user.role}
                </p>
                
                <p className="mt-4 text-stone-400 text-center max-w-md">
                    {user.bio || "Passionate learner exploring the universe of knowledge. 🚀"}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full">
                    {/* Stat 1 */}
                    <div className="bg-stone-950 border border-indigo-500/30 p-6 rounded-2xl flex flex-col items-center">
                        <span className="text-4xl font-bold text-indigo-400 mb-2">12</span>
                        <span className="text-stone-500 text-sm font-semibold uppercase">Courses Active</span>
                    </div>
                    {/* Stat 2 */}
                    <div className="bg-stone-950 border border-purple-500/30 p-6 rounded-2xl flex flex-col items-center">
                        <span className="text-4xl font-bold text-purple-400 mb-2">85%</span>
                        <span className="text-stone-500 text-sm font-semibold uppercase">Avg. Score</span>
                    </div>
                    {/* Stat 3 */}
                    <div className="bg-stone-950 border border-pink-500/30 p-6 rounded-2xl flex flex-col items-center">
                        <span className="text-4xl font-bold text-pink-400 mb-2">42</span>
                        <span className="text-stone-500 text-sm font-semibold uppercase">Badges Earned</span>
                    </div>
                </div>

                <div className="mt-12 w-full bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-2xl p-6 border border-indigo-500/20">
                    <h3 className="text-xl font-bold text-indigo-200 mb-4 flex items-center gap-2">
                        <TrophyIcon className="w-6 h-6 text-yellow-500" /> Recent Achievements
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {['Math Whiz', 'Early Bird', 'Bookworm', 'Helper'].map((badge, idx) => (
                            <div key={idx} className="flex-shrink-0 bg-stone-900 p-4 rounded-xl border border-stone-700 flex flex-col items-center min-w-[120px]">
                                <SparklesIcon className="w-8 h-8 text-yellow-400 mb-2" />
                                <span className="text-sm font-bold text-stone-300">{badge}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfileView;
