import React from 'react';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { TargetIcon } from './icons/TargetIcon';
import { MessageCircleIcon } from './icons/MessageCircleIcon';
import { MicIcon } from './icons/MicIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const MindMateMascot: React.FC = () => (
    <div className="relative w-32 h-32 md:w-48 md:h-48 animate-float">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
            {/* Body Gradient */}
            <rect x="40" y="40" width="120" height="120" rx="30" fill="url(#bodyGrad)" />
            
            {/* Screen Face */}
            <rect x="55" y="60" width="90" height="70" rx="15" fill="#1c1917" />
            
            {/* Eyes */}
            <circle cx="80" cy="90" r="8" fill="#f59e0b" className="animate-pulse" />
            <circle cx="120" cy="90" r="8" fill="#f59e0b" className="animate-pulse delay-100" />
            
            {/* Mouth */}
            <path d="M85 110 Q100 120 115 110" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
            
            {/* Antenna */}
            <line x1="100" y1="40" x2="100" y2="20" stroke="url(#bodyGrad)" strokeWidth="6" />
            <circle cx="100" cy="15" r="8" fill="#fbbf24" className="animate-pulse" />

            {/* Arms */}
            <path d="M30 110 Q10 110 30 130" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
            <path d="M170 110 Q190 110 170 130" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />

            <defs>
                <linearGradient id="bodyGrad" x1="40" y1="40" x2="160" y2="160" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#d97706" />
                    <stop offset="1" stopColor="#b45309" />
                </linearGradient>
            </defs>
        </svg>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-stone-950 overflow-hidden text-stone-200">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10 animate-fade-in">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg text-white shadow-lg">
                <BookOpenIcon className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-200">Mind Mate AI</h1>
        </div>
        <button onClick={onLogin} className="text-stone-400 font-medium hover:text-amber-400 transition-colors">
            Log In
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-r from-amber-900/20 via-yellow-900/20 to-orange-900/20 rounded-full blur-3xl animate-gradient-x -z-10 opacity-70"></div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          
          <div className="flex justify-center mb-6">
              <MindMateMascot />
          </div>

          <div className="inline-block mb-4 px-4 py-1.5 bg-amber-900/30 text-amber-400 rounded-full text-sm font-semibold shadow-sm animate-slide-up border border-amber-900/50">
             ✨ Your Personal AI Study Companion
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-stone-100 mb-6 leading-tight animate-slide-up delay-100">
            Study Smarter,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">Not Harder.</span>
          </h1>
          <p className="text-xl text-stone-400 mb-10 max-w-2xl mx-auto animate-slide-up delay-200 leading-relaxed">
            Mind Mate AI organizes your syllabus, monitors your focus, and adapts to your mood. Experience the future of personalized learning today.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up delay-300">
            <button 
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-amber-600 to-yellow-600 text-white text-lg font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
                Get Started Free
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
          </div>

          {/* Floating UI Elements Mockup */}
          <div className="mt-8 relative max-w-4xl mx-auto hidden md:block">
            <div className="absolute -left-12 top-0 bg-stone-900 p-4 rounded-xl shadow-xl border border-stone-800 animate-float" style={{ animationDelay: '0s' }}>
                <div className="flex items-center gap-3">
                    <div className="bg-green-900/30 p-2 rounded-full text-green-400"><TargetIcon className="w-6 h-6"/></div>
                    <div>
                        <p className="text-xs text-stone-500 font-semibold">Focus Score</p>
                        <p className="text-lg font-bold text-stone-200">92%</p>
                    </div>
                </div>
            </div>
            
            <div className="absolute -right-8 top-12 bg-stone-900 p-4 rounded-xl shadow-xl border border-stone-800 animate-float" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-3">
                    <div className="bg-amber-900/30 p-2 rounded-full text-amber-500"><MicIcon className="w-6 h-6"/></div>
                    <div>
                        <p className="text-xs text-stone-500 font-semibold">Ambient Coach</p>
                        <p className="text-sm font-bold text-stone-200">"You're doing great!"</p>
                    </div>
                </div>
            </div>

             <div className="bg-stone-900/60 backdrop-blur-sm border border-stone-800 rounded-2xl shadow-2xl p-2 animate-slide-up delay-300 transform rotate-1">
                {/* Visual Mock Dashboard */}
                <div className="bg-stone-900 rounded-xl overflow-hidden h-[360px] border border-stone-800 flex shadow-inner relative">
                     {/* Mock Sidebar */}
                    <div className="w-20 bg-stone-950 border-r border-stone-800 flex flex-col items-center py-6 gap-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 shadow-sm flex items-center justify-center">
                            <BookOpenIcon className="w-6 h-6 text-white"/>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-amber-900/30 flex items-center justify-center text-amber-500"><TargetIcon className="w-5 h-5"/></div>
                        <div className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 transition-colors"></div>
                        <div className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 transition-colors"></div>
                        <div className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 transition-colors"></div>
                        <div className="mt-auto w-8 h-8 rounded-full bg-stone-800/50"></div>
                    </div>
                    {/* Mock Main Content */}
                    <div className="flex-1 p-6 flex flex-col gap-6">
                        {/* Mock Header - Populated with Companion */}
                        <div className="flex justify-between items-center mb-2">
                             {/* The Companion in the 'Space' */}
                            <div className="flex items-center gap-4 flex-1">
                                <div className="flex items-center gap-3 p-2 pr-4 bg-gradient-to-r from-stone-800 to-stone-800/50 rounded-full border border-stone-700 shadow-sm">
                                    <div className="relative">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white shadow-sm animate-pulse-subtle">
                                            <SparklesIcon className="w-4 h-4" />
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-stone-800 rounded-full"></div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-amber-500">Mind Mate</p>
                                        <p className="text-[10px] text-stone-400 font-medium">Ready to focus?</p>
                                    </div>
                                </div>
                                <div className="h-2 w-24 bg-stone-800 rounded-full"></div>
                            </div>
                            
                            <div className="flex gap-3 items-center">
                                {/* Search Bar Mock */}
                                <div className="hidden sm:block h-9 w-32 bg-stone-950 rounded-full border border-stone-800"></div>
                                {/* Filled Buttons */}
                                <div className="h-9 w-9 rounded-full bg-stone-800 border border-stone-700 shadow-sm flex items-center justify-center">
                                    <div className="w-2 h-2 bg-red-500 rounded-full absolute top-1 right-1"></div>
                                </div>
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 shadow-md"></div>
                            </div>
                        </div>

                        {/* Mock Progress Card */}
                        <div className="p-5 border border-stone-800 rounded-xl bg-stone-800 shadow-sm relative overflow-hidden">
                             {/* Decorative sparkle */}
                             <div className="absolute top-0 right-0 p-4 opacity-10">
                                 <SparklesIcon className="w-20 h-20 text-amber-500" />
                             </div>
                            <div className="flex justify-between mb-3 relative z-10">
                                <div className="h-4 w-24 bg-stone-700 rounded"></div>
                                <div className="h-4 w-12 bg-amber-900/30 rounded text-amber-500 text-xs flex items-center justify-center font-bold">75%</div>
                            </div>
                            <div className="h-3 w-full bg-stone-900 rounded-full overflow-hidden relative z-10">
                                <div className="h-full w-3/4 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-full"></div>
                            </div>
                        </div>
                        {/* Mock Grid */}
                        <div className="grid grid-cols-3 gap-4 flex-1">
                            <div className="border border-stone-800 rounded-xl p-4 bg-stone-800/50 flex flex-col gap-3">
                                <div className="h-8 w-8 bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-400">
                                    <BookOpenIcon className="w-4 h-4"/>
                                </div>
                                <div className="h-4 w-24 bg-stone-700 rounded"></div>
                                <div className="h-2 w-full bg-stone-700 rounded mt-auto"></div>
                                <div className="h-2 w-2/3 bg-stone-700 rounded"></div>
                            </div>
                             <div className="border border-stone-800 rounded-xl p-4 bg-stone-800/50 flex flex-col gap-3">
                                <div className="h-8 w-8 bg-red-900/30 rounded-lg flex items-center justify-center text-red-400">
                                    <TargetIcon className="w-4 h-4"/>
                                </div>
                                <div className="h-4 w-24 bg-stone-700 rounded"></div>
                                <div className="h-10 w-full bg-stone-700 rounded mt-auto flex items-center justify-center text-stone-500 text-xs font-mono bg-stone-900 border border-stone-800">25:00</div>
                            </div>
                             <div className="border border-stone-800 rounded-xl p-4 bg-stone-800/50 flex flex-col gap-3 relative overflow-hidden">
                                <div className="h-8 w-8 bg-green-900/30 rounded-lg flex items-center justify-center text-green-400 relative z-10">
                                    <MessageCircleIcon className="w-4 h-4"/>
                                </div>
                                <div className="h-4 w-24 bg-stone-700 rounded relative z-10"></div>
                                <div className="flex gap-2 mt-auto relative z-10">
                                     <div className="h-6 w-6 rounded-full bg-stone-700 border-2 border-stone-800"></div>
                                     <div className="h-6 w-6 rounded-full bg-stone-700 border-2 border-stone-800 -ml-3"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-stone-900">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-stone-100 mb-4">Everything you need to excel</h2>
                <p className="text-stone-400 max-w-xl mx-auto">Our multi-modal AI combines planning, monitoring, and wellbeing into one seamless experience.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { title: 'Smart Plans', desc: 'Upload your syllabus and get a tailored schedule instantly.', icon: BookOpenIcon, color: 'text-blue-400', bg: 'bg-blue-900/20' },
                    { title: 'Focus Monitor', desc: 'Real-time distraction tracking with Pomodoro timers.', icon: TargetIcon, color: 'text-red-400', bg: 'bg-red-900/20' },
                    { title: 'Group Chat', desc: 'Study with friends and our AI tutor in the same room.', icon: MessageCircleIcon, color: 'text-green-400', bg: 'bg-green-900/20' },
                    { title: 'Wellbeing Hub', desc: 'AI-generated relaxation videos and mood tracking.', icon: SparklesIcon, color: 'text-amber-500', bg: 'bg-amber-900/20' },
                ].map((feature, idx) => (
                    <div key={idx} className="p-6 rounded-2xl bg-stone-950 hover:bg-stone-800 hover:shadow-xl border border-stone-800 hover:border-stone-700 transition-all duration-300 group cursor-default">
                        <div className={`w-12 h-12 ${feature.bg} ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <feature.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-stone-200 mb-2">{feature.title}</h3>
                        <p className="text-stone-500 leading-relaxed">
                            {feature.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-stone-950 text-stone-500 py-12 border-t border-stone-900">
        <div className="container mx-auto px-6 text-center">
            <div className="flex justify-center items-center gap-2 mb-6 text-stone-300 opacity-80">
                <BookOpenIcon className="h-6 w-6 text-amber-500" />
                <span className="text-xl font-bold">Mind Mate AI</span>
            </div>
            <p className="mb-8">Empowering students with proactive AI technology.</p>
            <p className="text-sm">© 2024 Mind Mate AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;