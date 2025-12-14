import React, { useState, useEffect, useRef } from 'react';
import { AppView } from '../types';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { RotateCcwIcon } from './icons/RotateCcwIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CheckSquareIcon } from './icons/CheckSquareIcon';

interface FocusMonitorViewProps {
    onNavigate: (view: AppView) => void;
}

interface SessionGoal {
    id: number;
    text: string;
    completed: boolean;
}

const FocusMonitorView: React.FC<FocusMonitorViewProps> = ({ onNavigate }) => {
    // --- Focus Monitor State ---
    const [text, setText] = useState('');
    const [showInterventionModal, setShowInterventionModal] = useState(false);
    
    // Predictive Logic State
    const deleteCountRef = useRef(0);
    const lastTextRef = useRef('');
    const timerRef = useRef<number | null>(null);
    
    const triggerText = "The quick brown fox";

    // --- Pomodoro Timer State ---
    const [mode, setMode] = useState<'work' | 'break'>('work');
    const [workMinutes, setWorkMinutes] = useState(25);
    const [breakMinutes, setBreakMinutes] = useState(5);
    const [secondsLeft, setSecondsLeft] = useState(25 * 60);
    const [timerActive, setTimerActive] = useState(false);

    // --- Session Goals State ---
    const [goals, setGoals] = useState<SessionGoal[]>([]);
    const [newGoalText, setNewGoalText] = useState('');

    // --- Pomodoro Effects ---
    useEffect(() => {
        let interval: number | null = null;
        if (timerActive && secondsLeft > 0) {
            interval = window.setInterval(() => {
                setSecondsLeft(prev => prev - 1);
            }, 1000);
        } else if (secondsLeft === 0 && timerActive) {
            setTimerActive(false);
            // Switch modes automatically
            if (mode === 'work') {
                const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
                audio.play().catch(e => console.log('Audio play failed', e));
                alert("Work session complete! Time for a break.");
                setMode('break');
                setSecondsLeft(breakMinutes * 60);
            } else {
                const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
                audio.play().catch(e => console.log('Audio play failed', e));
                alert("Break over! Ready to focus again?");
                setMode('work');
                setSecondsLeft(workMinutes * 60);
            }
        }
        return () => { if (interval) clearInterval(interval); };
    }, [timerActive, secondsLeft, mode, breakMinutes, workMinutes]);

    const toggleTimer = () => setTimerActive(!timerActive);

    const resetTimer = () => {
        setTimerActive(false);
        if (mode === 'work') setSecondsLeft(workMinutes * 60);
        else setSecondsLeft(breakMinutes * 60);
    };

    const handleDurationChange = (type: 'work' | 'break', valStr: string) => {
        const val = parseInt(valStr, 10);
        if (isNaN(val) || val < 1) return;
        
        if (type === 'work') {
            setWorkMinutes(val);
            if (mode === 'work' && !timerActive) setSecondsLeft(val * 60);
        } else {
            setBreakMinutes(val);
            if (mode === 'break' && !timerActive) setSecondsLeft(val * 60);
        }
    };

    const switchMode = (newMode: 'work' | 'break') => {
        setTimerActive(false);
        setMode(newMode);
        setSecondsLeft((newMode === 'work' ? workMinutes : breakMinutes) * 60);
    };

    const formatTime = (totalSeconds: number) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const progressPercent = mode === 'work' 
        ? 100 - (secondsLeft / (workMinutes * 60)) * 100
        : 100 - (secondsLeft / (breakMinutes * 60)) * 100;


    // --- Focus Monitor Effects ---
    useEffect(() => {
        // --- Predictive Logic Simulation ---
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        if (text.endsWith(triggerText)) {
            lastTextRef.current = text;
            timerRef.current = window.setTimeout(() => {
                // This timeout is just to ensure we capture the state before a potential quick deletion.
            }, 2000);
        } else if (text !== lastTextRef.current && lastTextRef.current.endsWith(triggerText) && !text.endsWith(triggerText)) {
             // This condition detects if the trigger text was present and is now gone.
             deleteCountRef.current += 1;
             console.log(`Frustration pattern detected. Count: ${deleteCountRef.current}`);
             
             if (deleteCountRef.current >= 3) {
                 console.log("Triggering AI intervention!");
                 setShowInterventionModal(true);
                 deleteCountRef.current = 0;
             }
             lastTextRef.current = text; // Reset after detecting deletion
        } else {
            lastTextRef.current = text;
        }
        
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [text]);

    const handleCloseModal = () => {
        setShowInterventionModal(false);
    };

    const handleGoToWellbeing = () => {
        setShowInterventionModal(false);
        onNavigate(AppView.WellbeingHub);
    }

    // --- Goal Handlers ---
    const handleAddGoal = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGoalText.trim()) return;
        const newGoal: SessionGoal = {
            id: Date.now(),
            text: newGoalText.trim(),
            completed: false
        };
        setGoals([...goals, newGoal]);
        setNewGoalText('');
    };

    const toggleGoal = (id: number) => {
        setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
    };

    const deleteGoal = (id: number) => {
        setGoals(goals.filter(g => g.id !== id));
    };

    const completedGoals = goals.filter(g => g.completed).length;
    const goalProgress = goals.length > 0 ? (completedGoals / goals.length) * 100 : 0;

    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in space-y-8">
            <h2 className="text-xl font-bold mb-4 text-stone-100">Focus Monitor</h2>
            
            {/* Pomodoro Section */}
            <div className="bg-stone-800 rounded-xl p-6 border border-stone-700">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col items-center">
                        <div className="flex gap-2 mb-4 bg-stone-900 p-1 rounded-lg border border-stone-800 shadow-sm">
                            <button 
                                onClick={() => switchMode('work')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === 'work' ? 'bg-amber-900/30 text-amber-500 shadow-sm' : 'text-stone-500 hover:text-stone-300'}`}
                            >
                                Work
                            </button>
                            <button 
                                onClick={() => switchMode('break')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === 'break' ? 'bg-green-900/30 text-green-400 shadow-sm' : 'text-stone-500 hover:text-stone-300'}`}
                            >
                                Break
                            </button>
                        </div>
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            {/* Circular Progress Background */}
                            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#44403c" strokeWidth="8" />
                                <circle 
                                    cx="50" cy="50" r="45" fill="none" 
                                    stroke={mode === 'work' ? '#d97706' : '#10b981'} 
                                    strokeWidth="8" 
                                    strokeDasharray="283" 
                                    strokeDashoffset={283 - (283 * progressPercent) / 100}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-linear"
                                />
                            </svg>
                            <div className="text-4xl font-mono font-bold text-stone-200 z-10">
                                {formatTime(secondsLeft)}
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-6">
                            <button 
                                onClick={toggleTimer}
                                className={`p-3 rounded-full text-white shadow-lg transition-transform hover:scale-105 active:scale-95 bg-gradient-to-r ${mode === 'work' ? 'from-amber-600 to-yellow-600' : 'from-green-600 to-emerald-600'}`}
                            >
                                {timerActive ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                            </button>
                            <button 
                                onClick={resetTimer}
                                className="p-3 rounded-full bg-stone-700 text-stone-300 hover:bg-stone-600 border border-stone-600 shadow-sm transition-transform hover:scale-105 active:scale-95"
                            >
                                <RotateCcwIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col gap-4 p-4 bg-stone-900 rounded-lg border border-stone-700 shadow-sm">
                        <h3 className="font-semibold text-stone-300 border-b border-stone-700 pb-2">Timer Settings</h3>
                        <div className="flex items-center justify-between gap-4">
                            <label className="text-sm text-stone-400">Work Duration (min)</label>
                            <input 
                                type="number" 
                                value={workMinutes} 
                                onChange={(e) => handleDurationChange('work', e.target.value)}
                                className="w-16 p-1.5 text-center bg-stone-800 border border-stone-600 text-stone-200 rounded-md focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                min="1"
                            />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <label className="text-sm text-stone-400">Break Duration (min)</label>
                            <input 
                                type="number" 
                                value={breakMinutes} 
                                onChange={(e) => handleDurationChange('break', e.target.value)}
                                className="w-16 p-1.5 text-center bg-stone-800 border border-stone-600 text-stone-200 rounded-md focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                min="1"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Session Goals Section */}
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-stone-200 flex items-center gap-2">
                        <CheckSquareIcon className="w-5 h-5 text-amber-500"/>
                        Session Goals
                    </h3>
                    {goals.length > 0 && (
                        <span className="text-xs font-medium px-2 py-1 bg-amber-900/30 text-amber-500 rounded-full border border-amber-800">
                            {completedGoals}/{goals.length} Completed
                        </span>
                    )}
                </div>
                
                {goals.length > 0 && (
                    <div className="w-full bg-stone-800 rounded-full h-2 mb-6">
                        <div 
                            className="bg-gradient-to-r from-amber-600 to-yellow-600 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${goalProgress}%` }}
                        ></div>
                    </div>
                )}

                <form onSubmit={handleAddGoal} className="flex gap-2 mb-4">
                    <input 
                        type="text" 
                        value={newGoalText}
                        onChange={(e) => setNewGoalText(e.target.value)}
                        placeholder="E.g., Complete 2 practice problems..."
                        className="flex-grow text-sm p-2 bg-stone-800 border border-stone-700 text-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder-stone-500"
                    />
                    <button type="submit" className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 shadow-md">
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </form>

                <div className="space-y-2">
                    {goals.length === 0 ? (
                        <p className="text-sm text-stone-500 text-center py-2">No goals set for this session yet.</p>
                    ) : (
                        goals.map(goal => (
                            <div key={goal.id} className="flex items-center gap-3 p-2 hover:bg-stone-800 rounded-lg group transition-colors">
                                <button 
                                    onClick={() => toggleGoal(goal.id)}
                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                        goal.completed ? 'bg-green-600 border-green-600 text-white' : 'border-stone-500 text-transparent hover:border-amber-500'
                                    }`}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </button>
                                <span className={`flex-grow text-sm ${goal.completed ? 'line-through text-stone-500' : 'text-stone-300'}`}>
                                    {goal.text}
                                </span>
                                <button 
                                    onClick={() => deleteGoal(goal.id)}
                                    className="text-stone-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <p className="text-stone-500">
                    This is a simulation of an AI that watches for signs of frustration while you work. 
                    To trigger it, type "<strong className="text-amber-500">{triggerText}</strong>" and then delete it. Repeat this three times.
                </p>

                <div className="bg-stone-800 p-4 rounded-xl border border-stone-700">
                    <h3 className="font-semibold text-stone-300">Essay Draft</h3>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Start writing your essay here..."
                        className="w-full h-48 mt-2 p-3 border border-stone-600 bg-stone-900 text-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder-stone-500"
                    />
                </div>
            </div>

            {/* AI Intervention Modal */}
            {showInterventionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={handleCloseModal}>
                    <div className="bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl w-full max-w-md p-6 m-4 animate-fade-in" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">🌿</span>
                            <h3 className="text-lg font-bold text-stone-100">Just checking in...</h3>
                        </div>
                        <p className="mt-2 text-stone-400">
                            Hey, I noticed you might be feeling a bit stuck. That's completely okay!
                            Sometimes a short break can make all the difference. How about we try something relaxing?
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium bg-stone-800 text-stone-300 rounded-lg hover:bg-stone-700">
                                No, I'm fine
                            </button>
                            <button onClick={handleGoToWellbeing} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-emerald-600 rounded-lg hover:from-teal-700 hover:to-emerald-700 shadow-md">
                                Take a Break
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FocusMonitorView;