
import React, { useState, FormEvent, useEffect } from 'react';
import { TodoItem } from '../types';
import Loader from './Loader';
import { CalendarIcon } from './icons/CalendarIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

const bigTaskKeywords = ['essay', 'research paper', 'study for final', 'project', 'presentation'];

const subTasksForBigTask = [
    "1. Research & Gather Sources (1 hour)",
    "2. Create Outline (30 min)",
    "3. Write First Draft - Intro (45 min)",
    "4. Write Body Paragraphs (2 hours)",
    "5. Write Conclusion & Proofread (45 min)"
];

const TASK_COLORS = [
    'bg-pink-500', 'bg-purple-500', 'bg-indigo-500', 'bg-blue-500', 
    'bg-cyan-500', 'bg-teal-500', 'bg-emerald-500', 'bg-green-500', 
    'bg-lime-500', 'bg-yellow-500', 'bg-amber-500', 'bg-orange-500', 'bg-red-500'
];

const getRandomColor = () => TASK_COLORS[Math.floor(Math.random() * TASK_COLORS.length)];

const IntelligentTodoView: React.FC = () => {
    // Helper to format date as YYYY-MM-DD
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const todayStr = formatDate(new Date());

    const [tasks, setTasks] = useState<TodoItem[]>([
        { id: 1, text: 'Read Chapter 4 of History book', isCompleted: true, date: todayStr, color: 'bg-blue-500' },
        { id: 2, text: 'Complete Calculus problem set', isCompleted: false, date: todayStr, color: 'bg-purple-500' },
        { id: 3, text: 'Review Notes', isCompleted: false, date: formatDate(new Date(Date.now() + 86400000)), color: 'bg-green-500' }, 
    ]);
    const [newTaskText, setNewTaskText] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [viewMode, setViewMode] = useState<'calendar' | 'weekly'>('calendar');
    
    // Calendar State
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const handleAddTask = (e: FormEvent, specificDate?: Date) => {
        e.preventDefault();
        const taskText = newTaskText.trim();
        if (!taskText) return;

        const isBigTask = bigTaskKeywords.some(keyword => taskText.toLowerCase().includes(keyword));
        const dateStr = specificDate ? formatDate(specificDate) : formatDate(selectedDate);

        if (isBigTask) {
            // AI Simulation
            setIsThinking(true);
            setTimeout(() => {
                const newSubTasks: TodoItem[] = subTasksForBigTask.map((subTask, index) => ({
                    id: Date.now() + index,
                    text: subTask,
                    isCompleted: false,
                    date: dateStr,
                    color: getRandomColor()
                }));
                setTasks(prev => [...prev, ...newSubTasks]);
                setIsThinking(false);
            }, 2000); 
        } else {
            // Simple task
            const newTask: TodoItem = {
                id: Date.now(),
                text: taskText,
                isCompleted: false,
                date: dateStr,
                color: getRandomColor()
            };
            setTasks(prev => [...prev, newTask]);
        }

        setNewTaskText('');
    };

    const toggleTask = (id: number) => {
        setTasks(tasks.map(task => 
            task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
        ));
    };

    const deleteTask = (id: number) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    // --- Calendar Logic ---
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const changeMonth = (offset: number) => {
        const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
        setCurrentMonth(newMonth);
    };

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        
        const days = [];
        // Empty slots for days before the 1st
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(year, month, day);
            const dateStr = formatDate(dateObj);
            const isSelected = formatDate(selectedDate) === dateStr;
            const isToday = dateStr === todayStr;
            
            // Check for tasks on this day
            const dayTasks = tasks.filter(t => t.date === dateStr);
            const hasTasks = dayTasks.length > 0;

            days.push(
                <button 
                    key={day} 
                    onClick={() => setSelectedDate(dateObj)}
                    className={`h-10 w-10 rounded-lg flex flex-col items-center justify-center relative transition-all duration-200 
                        ${isSelected 
                            ? 'bg-amber-600 text-white shadow-lg ring-2 ring-amber-400' 
                            : isToday 
                                ? 'bg-stone-700 text-amber-400 border border-amber-500/50' 
                                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                        }
                    `}
                >
                    <span className="text-sm font-medium z-10">{day}</span>
                    
                    {/* Tiny colored dots for tasks */}
                    {hasTasks && (
                        <div className="flex gap-0.5 mt-0.5 max-w-[80%] justify-center overflow-hidden h-1.5">
                            {dayTasks.slice(0, 3).map((t, idx) => (
                                <div key={idx} className={`w-1.5 h-1.5 rounded-full ${t.color || 'bg-stone-500'}`}></div>
                            ))}
                            {dayTasks.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-stone-500">+</div>}
                        </div>
                    )}
                </button>
            );
        }
        return days;
    };

    // --- Weekly View Logic ---
    const getWeekDays = () => {
        const curr = new Date(); // get current date
        const first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week + 1 (Monday)
        const week = [];
        for(let i = 0; i < 7; i++) {
            const day = new Date(curr.setDate(first + i));
            week.push(day);
        }
        return week;
    }
    
    const weekDays = getWeekDays();

    const selectedDateStr = formatDate(selectedDate);
    const displayedTasks = tasks.filter(t => t.date === selectedDateStr);

    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in min-h-[600px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                 <div className="flex items-center gap-3">
                     <div className="p-2 bg-purple-900/30 rounded-lg text-purple-500">
                        <CalendarIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-stone-100">Intelligent Planner</h2>
                        <p className="text-stone-400 text-sm">Organize your tasks by date.</p>
                    </div>
                </div>
                <div className="flex bg-stone-800 p-1 rounded-lg border border-stone-700">
                    <button 
                        onClick={() => setViewMode('calendar')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'calendar' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'}`}
                    >
                        Calendar
                    </button>
                    <button 
                        onClick={() => setViewMode('weekly')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'weekly' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'}`}
                    >
                        Weekly Board
                    </button>
                </div>
            </div>

            {viewMode === 'weekly' ? (
                <div className="overflow-x-auto pb-4">
                     <div className="flex gap-4 min-w-[1000px]">
                        {weekDays.map((date, idx) => {
                            const dateStr = formatDate(date);
                            const dayTasks = tasks.filter(t => t.date === dateStr);
                            const isToday = dateStr === todayStr;

                            return (
                                <div key={idx} className={`flex-1 min-w-[200px] bg-stone-950 rounded-xl border ${isToday ? 'border-amber-500/50' : 'border-stone-800'} flex flex-col`}>
                                    <div className={`p-3 border-b ${isToday ? 'bg-amber-900/10 border-amber-500/30' : 'bg-stone-900 border-stone-800'} rounded-t-xl text-center`}>
                                        <p className="text-sm font-bold text-stone-300">{date.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                                        <p className={`text-xs ${isToday ? 'text-amber-500 font-bold' : 'text-stone-500'}`}>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                    </div>
                                    <div className="p-2 flex-grow space-y-2 min-h-[300px]">
                                        {dayTasks.map(task => (
                                            <div key={task.id} className={`p-2 rounded-lg border border-stone-800 bg-stone-900 hover:bg-stone-800 transition-colors group relative ${task.isCompleted ? 'opacity-60' : ''}`}>
                                                <div className={`w-1 h-full absolute left-0 top-0 rounded-l-lg ${task.color || 'bg-stone-500'}`}></div>
                                                <div className="pl-3">
                                                    <p className={`text-sm ${task.isCompleted ? 'line-through text-stone-500' : 'text-stone-200'}`}>{task.text}</p>
                                                </div>
                                                <div className="flex justify-end mt-2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                     <button onClick={() => toggleTask(task.id)} className={`text-xs px-2 py-0.5 rounded ${task.isCompleted ? 'bg-green-900/30 text-green-400' : 'bg-stone-700 text-stone-300'}`}>
                                                        {task.isCompleted ? 'Undo' : 'Done'}
                                                     </button>
                                                     <button onClick={() => deleteTask(task.id)} className="text-xs text-red-400 hover:bg-stone-700 px-1 rounded">Del</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-2 border-t border-stone-800">
                                         <form onSubmit={(e) => handleAddTask(e, date)} className="flex gap-1">
                                            <input 
                                                type="text" 
                                                value={selectedDateStr === dateStr ? newTaskText : ''}
                                                onChange={(e) => { 
                                                    setSelectedDate(date); // focus on this col
                                                    setNewTaskText(e.target.value); 
                                                }}
                                                placeholder="+"
                                                className="w-full text-xs p-1.5 bg-stone-900 border border-stone-700 rounded text-stone-200 focus:outline-none focus:border-amber-500"
                                            />
                                         </form>
                                    </div>
                                </div>
                            );
                        })}
                     </div>
                </div>
            ) : (
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Calendar Section */}
                <div className="lg:w-1/2">
                    <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 shadow-inner">
                        <div className="flex justify-between items-center mb-6">
                            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-stone-800 rounded-full text-stone-400 hover:text-white transition-colors">
                                <ChevronLeftIcon className="w-5 h-5"/>
                            </button>
                            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-pink-500">
                                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </h3>
                            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-stone-800 rounded-full text-stone-400 hover:text-white transition-colors">
                                <ChevronRightIcon className="w-5 h-5"/>
                            </button>
                        </div>

                        {/* Days Header */}
                        <div className="grid grid-cols-7 mb-2 text-center">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="text-xs font-bold text-stone-500 uppercase tracking-wide">{d}</div>
                            ))}
                        </div>
                        
                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-2 place-items-center">
                            {renderCalendar()}
                        </div>

                         <div className="mt-6 pt-4 border-t border-stone-800">
                             <p className="text-xs text-stone-500 text-center">
                                 Tip: Add big tasks like "Write Essay" and let AI break them down!
                             </p>
                         </div>
                    </div>
                </div>

                {/* Task List Section */}
                <div className="lg:w-1/2 flex flex-col">
                    <div className="bg-stone-800 rounded-t-xl p-4 border-b border-stone-700 flex justify-between items-center">
                        <h3 className="font-bold text-stone-200">
                            Tasks for {selectedDate.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </h3>
                        <span className="text-xs font-medium px-2 py-1 bg-stone-700 rounded-full text-stone-300">
                            {displayedTasks.filter(t => t.isCompleted).length} / {displayedTasks.length} Done
                        </span>
                    </div>
                    
                    <div className="bg-stone-900 border border-stone-800 border-t-0 rounded-b-xl p-4 flex-grow flex flex-col min-h-[300px]">
                        <ul className="space-y-3 flex-grow">
                            {displayedTasks.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-stone-500 opacity-50">
                                    <CalendarIcon className="w-12 h-12 mb-2"/>
                                    <p>No tasks for this day.</p>
                                </div>
                            ) : (
                                displayedTasks.map(task => (
                                    <li key={task.id} className="group flex items-center gap-3 p-3 bg-stone-950 border border-stone-800 rounded-xl hover:bg-stone-900 transition-all shadow-sm">
                                        
                                        {/* Color Indicator */}
                                        <div className={`w-1.5 h-10 rounded-full ${task.color || 'bg-stone-600'}`}></div>

                                        <button 
                                            onClick={() => toggleTask(task.id)}
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                                task.isCompleted ? 'bg-green-500 border-green-500' : 'border-stone-600 hover:border-amber-500'
                                            }`}
                                        >
                                           {task.isCompleted && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                        </button>
                                        
                                        <span className={`flex-grow text-sm ${task.isCompleted ? 'line-through text-stone-500' : 'text-stone-200'}`}>
                                            {task.text}
                                        </span>

                                        <button 
                                            onClick={() => deleteTask(task.id)}
                                            className="text-stone-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>
                        
                        {isThinking && <div className="py-4"><Loader message="AI is planning your steps..."/></div>}

                        <form onSubmit={(e) => handleAddTask(e)} className="mt-4 flex gap-2">
                            <input 
                                type="text"
                                value={newTaskText}
                                onChange={e => setNewTaskText(e.target.value)}
                                placeholder="Add a new task..."
                                className="flex-grow text-sm p-3 bg-stone-800 border rounded-xl border-stone-700 text-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder-stone-500"
                            />
                            <button type="submit" className="p-3 font-semibold text-white bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl hover:from-amber-700 hover:to-orange-700 shadow-lg transition-transform active:scale-95">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
};

export default IntelligentTodoView;
