
import React from 'react';
import { AttendanceRecord } from '../types';
import { CalendarCheckIcon } from './icons/CalendarCheckIcon';

interface AttendanceViewProps {
    records: AttendanceRecord[];
}

const AttendanceView: React.FC<AttendanceViewProps> = ({ records }) => {
    // Calculate Stats
    const totalDays = 30; // Assuming a 30-day view for demo
    const presentCount = records.filter(r => r.status === 'Present').length;
    const absentCount = records.filter(r => r.status === 'Absent').length;
    const lateCount = records.filter(r => r.status === 'Late').length;
    const attendancePercentage = Math.round((presentCount / (presentCount + absentCount + lateCount)) * 100) || 100;

    // Generate last 30 days for calendar visual
    const generateCalendarDays = () => {
        const days = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const record = records.find(r => r.date === dateStr);
            days.push({ date: d, record });
        }
        return days;
    };

    const calendarDays = generateCalendarDays();

    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in min-h-screen">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-teal-900/30 rounded-xl text-teal-500">
                    <CalendarCheckIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-stone-100">Attendance Tracker</h2>
                    <p className="text-stone-400">Your presence matters. Keep that streak alive!</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="md:col-span-2 bg-gradient-to-br from-teal-900/20 to-emerald-900/20 p-6 rounded-2xl border border-teal-500/30 flex items-center justify-between">
                    <div>
                        <p className="text-stone-400 font-bold uppercase text-xs tracking-wider mb-1">Overall Attendance</p>
                        <h3 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                            {attendancePercentage}%
                        </h3>
                        <p className="text-teal-500/80 text-sm mt-2 font-medium">You're doing great!</p>
                    </div>
                    <div className="h-24 w-24 rounded-full border-8 border-stone-800 border-t-teal-500 border-r-emerald-500 shadow-lg flex items-center justify-center bg-stone-900">
                        <span className="text-2xl">🎓</span>
                    </div>
                </div>

                <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 flex flex-col justify-center items-center">
                    <span className="text-3xl mb-2">✅</span>
                    <span className="text-2xl font-bold text-white">{presentCount}</span>
                    <span className="text-xs text-stone-500 font-bold uppercase">Days Present</span>
                </div>

                <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 flex flex-col justify-center items-center">
                    <span className="text-3xl mb-2">❌</span>
                    <span className="text-2xl font-bold text-white">{absentCount}</span>
                    <span className="text-xs text-stone-500 font-bold uppercase">Days Absent</span>
                </div>
            </div>

            {/* Visual Calendar */}
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-stone-200 mb-6 flex items-center gap-2">
                    Monthly Overview 📅
                </h3>
                
                <div className="grid grid-cols-7 gap-3 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="text-center text-xs font-bold text-stone-500 uppercase">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-3">
                    {calendarDays.map((day, idx) => {
                        const isToday = new Date().toDateString() === day.date.toDateString();
                        const status = day.record?.status;
                        
                        let bgClass = 'bg-stone-900 border-stone-800 text-stone-600';
                        if (status === 'Present') bgClass = 'bg-teal-900/30 border-teal-700 text-teal-400';
                        if (status === 'Absent') bgClass = 'bg-red-900/30 border-red-700 text-red-400';
                        if (status === 'Late') bgClass = 'bg-yellow-900/30 border-yellow-700 text-yellow-400';
                        if (isToday && !status) bgClass = 'bg-stone-800 border-stone-600 text-white animate-pulse';

                        return (
                            <div key={idx} className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative group transition-all hover:scale-105 ${bgClass}`}>
                                <span className="text-sm font-bold">{day.date.getDate()}</span>
                                {status && (
                                    <span className="text-[10px] uppercase font-bold mt-1 opacity-80">{status}</span>
                                )}
                                {isToday && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                <div className="mt-6 flex gap-6 justify-center text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-teal-500"></div> <span className="text-stone-400">Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div> <span className="text-stone-400">Absent</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div> <span className="text-stone-400">Late</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceView;
