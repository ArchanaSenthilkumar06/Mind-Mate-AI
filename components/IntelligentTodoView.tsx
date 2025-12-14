import React, { useState, FormEvent } from 'react';
import { TodoItem } from '../types';
import Loader from './Loader';

const bigTaskKeywords = ['essay', 'research paper', 'study for final', 'project', 'presentation'];

const subTasksForBigTask = [
    "1. Research & Gather Sources (1 hour)",
    "2. Create Outline (30 min)",
    "3. Write First Draft - Intro (45 min)",
    "4. Write Body Paragraphs (2 hours)",
    "5. Write Conclusion & Proofread (45 min)"
];

const IntelligentTodoView: React.FC = () => {
    const [tasks, setTasks] = useState<TodoItem[]>([
        { id: 1, text: 'Read Chapter 4 of History book', isCompleted: true },
        { id: 2, text: 'Complete Calculus problem set', isCompleted: false },
    ]);
    const [newTaskText, setNewTaskText] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    const handleAddTask = (e: FormEvent) => {
        e.preventDefault();
        const taskText = newTaskText.trim();
        if (!taskText) return;

        const isBigTask = bigTaskKeywords.some(keyword => taskText.toLowerCase().includes(keyword));

        if (isBigTask) {
            // AI Simulation
            setIsThinking(true);
            setTimeout(() => {
                const newSubTasks: TodoItem[] = subTasksForBigTask.map((subTask, index) => ({
                    id: Date.now() + index,
                    text: subTask,
                    isCompleted: false,
                }));
                setTasks(prev => [...prev, ...newSubTasks]);
                setIsThinking(false);
            }, 2000); // Simulate AI thinking for 2 seconds
        } else {
            // Simple task
            const newTask: TodoItem = {
                id: Date.now(),
                text: taskText, // Use original casing
                isCompleted: false,
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

    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in">
            <h2 className="text-xl font-bold mb-4 text-stone-100">Intelligent To-Do List ✅</h2>
            <p className="text-stone-400 mb-6">
                Add a simple task like "Read Chapter 4". Then, try adding a big task like "Write History Essay" to see the AI break it down for you.
            </p>

            <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
                <input 
                    type="text"
                    value={newTaskText}
                    onChange={e => setNewTaskText(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-grow w-full text-sm p-3 bg-stone-800 border rounded-lg border-stone-700 text-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder-stone-500 shadow-sm"
                />
                <button type="submit" className="px-6 py-2 font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:bg-stone-700 shadow-md transition-colors">
                    Add Task
                </button>
            </form>
            
            <h3 className="font-semibold text-stone-300 mb-2">Today's Tasks</h3>
            {isThinking && <Loader message="AI is breaking down your task..."/>}
            <ul className="space-y-2">
                {tasks.map(task => (
                    <li key={task.id} onClick={() => toggleTask(task.id)} 
                        className="flex items-center gap-3 p-3 bg-stone-800 border border-stone-700 rounded-lg cursor-pointer hover:bg-stone-750 transition-colors">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            task.isCompleted ? 'bg-green-600 border-green-600' : 'border-stone-500'
                        }`}>
                           {task.isCompleted && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className={`flex-grow text-stone-300 ${task.isCompleted ? 'line-through text-stone-500' : ''}`}>
                            {task.text}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default IntelligentTodoView;