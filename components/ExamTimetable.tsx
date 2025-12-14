
import React from 'react';
import { Exam } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';

const ExamTimetable: React.FC = () => {
    // Mock Data
    const exams: Exam[] = [
        { id: '1', subject: 'Calculus Midterm', date: '2024-10-24', time: '09:00 AM', location: 'Hall A', color: 'border-l-red-500' },
        { id: '2', subject: 'History Final', date: '2024-10-28', time: '01:00 PM', location: 'Room 304', color: 'border-l-amber-500' },
        { id: '3', subject: 'Physics Lab', date: '2024-11-02', time: '10:00 AM', location: 'Lab 2', color: 'border-l-blue-500' },
        { id: '4', subject: 'English Lit Essay', date: '2024-11-05', time: '11:30 AM', location: 'Room 101', color: 'border-l-purple-500' },
    ];

    return (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-stone-100 mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-amber-500" /> Upcoming Exams
            </h3>
            <div className="space-y-3">
                {exams.map((exam) => (
                    <div key={exam.id} className={`bg-stone-950 p-4 rounded-xl border border-stone-800 ${exam.color} border-l-4 shadow-sm hover:translate-x-1 transition-transform`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-stone-200 text-lg">{exam.subject}</h4>
                                <p className="text-sm text-stone-400 flex items-center gap-2 mt-1">
                                    <span>📅 {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    <span className="w-1 h-1 rounded-full bg-stone-600"></span>
                                    <span>⏰ {exam.time}</span>
                                </p>
                            </div>
                            <span className="text-xs font-semibold bg-stone-800 text-stone-300 px-2 py-1 rounded border border-stone-700">
                                {exam.location}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExamTimetable;
