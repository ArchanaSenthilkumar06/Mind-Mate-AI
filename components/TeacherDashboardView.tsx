
import React, { useState } from 'react';
import { User, StudyGroup } from '../types';
import { UsersIcon } from './icons/UsersIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ActivityIcon } from './icons/ActivityIcon';
import { MessageCircleIcon } from './icons/MessageCircleIcon';

interface TeacherDashboardProps {
    students: User[];
    groups: StudyGroup[];
}

const TeacherDashboardView: React.FC<TeacherDashboardProps> = ({ students, groups }) => {
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [messageModalOpen, setMessageModalOpen] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

    // Mock Data for Analytics
    const studentPerformance = students.filter(u => u.role === 'student').map(s => ({
        ...s,
        avgScore: Math.floor(Math.random() * 30) + 70, // 70-100
        focusHours: Math.floor(Math.random() * 10) + 2,
        mood: Math.random() > 0.3 ? 'Happy' : 'Stressed',
        attendance: Math.floor(Math.random() * 20) + 80 + '%',
        completedTasks: Math.floor(Math.random() * 50) + 10
    }));

    const handleDownloadReport = () => {
        // Create CSV Content
        const headers = ["Name", "Email", "Avg Score", "Focus Hours", "Mood", "Attendance"];
        const rows = studentPerformance.map(s => [s.name, s.email, s.avgScore, s.focusHours, s.mood, s.attendance]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "class_performance_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const openMessageModal = (student: any) => {
        setSelectedStudent(student);
        setMessageModalOpen(true);
    };

    const openDetailsModal = (student: any) => {
        setSelectedStudent(student);
        setDetailsModalOpen(true);
    }

    const sendMessage = () => {
        alert(`Message sent to ${selectedStudent.name}: "${messageText}"`);
        setMessageModalOpen(false);
        setMessageText('');
        setSelectedStudent(null);
    };

    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in min-h-screen relative">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-900/30 rounded-xl text-blue-500">
                    <BookOpenIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-stone-100">Teacher Command Center</h2>
                    <p className="text-stone-400">Monitor student progress and class wellbeing.</p>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-stone-950 p-6 rounded-xl border border-stone-800 shadow-md">
                    <h3 className="text-stone-400 text-sm font-bold uppercase tracking-wide mb-2">Total Students</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-stone-100">{studentPerformance.length}</span>
                        <span className="text-green-500 text-sm mb-1">Active</span>
                    </div>
                </div>
                <div className="bg-stone-950 p-6 rounded-xl border border-stone-800 shadow-md">
                    <h3 className="text-stone-400 text-sm font-bold uppercase tracking-wide mb-2">Class Mood</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-stone-100">Positive</span>
                        <span className="text-stone-500 text-sm mb-1">Mostly Happy</span>
                    </div>
                </div>
                <div className="bg-stone-950 p-6 rounded-xl border border-stone-800 shadow-md">
                    <h3 className="text-stone-400 text-sm font-bold uppercase tracking-wide mb-2">Avg. Quiz Score</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-amber-500">85%</span>
                        <span className="text-green-500 text-sm mb-1">↑ 2% this week</span>
                    </div>
                </div>
            </div>

            {/* At Risk Section */}
            <div className="mb-8">
                <h3 className="text-xl font-bold text-stone-200 mb-4 flex items-center gap-2">
                    <ActivityIcon className="w-5 h-5 text-red-500" /> Needs Attention
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {studentPerformance.filter(s => s.avgScore < 75 || s.mood === 'Stressed').map(student => (
                        <div key={student.id} className="bg-red-900/10 border border-red-900/30 p-4 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-stone-300 font-bold">
                                    {student.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-stone-200">{student.name}</p>
                                    <p className="text-xs text-red-400">
                                        {student.mood === 'Stressed' ? 'Reports High Stress' : 'Low Quiz Scores'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => openMessageModal(student)} className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-xs text-stone-300 rounded-md border border-stone-700">
                                Message
                            </button>
                        </div>
                    ))}
                    {studentPerformance.filter(s => s.avgScore < 75 || s.mood === 'Stressed').length === 0 && (
                        <p className="text-stone-500 italic">No students currently flagged as at-risk.</p>
                    )}
                </div>
            </div>

            {/* Class Roster / Leaderboard */}
            <div className="bg-stone-950 rounded-xl border border-stone-800 overflow-hidden">
                <div className="p-4 border-b border-stone-800 bg-stone-900/50 flex justify-between items-center">
                    <h3 className="font-bold text-stone-200">Class Performance</h3>
                    <button onClick={handleDownloadReport} className="text-xs font-bold text-amber-500 hover:text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg hover:bg-amber-900/20 transition-colors">
                        Download Report (CSV)
                    </button>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-stone-900 text-xs text-stone-500 uppercase">
                        <tr>
                            <th className="p-4">Student</th>
                            <th className="p-4">Focus Hours</th>
                            <th className="p-4">Current Mood</th>
                            <th className="p-4">Avg Grade</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800">
                        {studentPerformance.map(student => (
                            <tr key={student.id} className="hover:bg-stone-900/50 transition-colors">
                                <td className="p-4 font-medium text-stone-300 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-xs">
                                        {student.name.charAt(0)}
                                    </div>
                                    {student.name}
                                </td>
                                <td className="p-4 text-stone-400">{student.focusHours}h</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                        student.mood === 'Happy' ? 'bg-green-900/20 text-green-400 border-green-900/30' : 
                                        'bg-red-900/20 text-red-400 border-red-900/30'
                                    }`}>
                                        {student.mood}
                                    </span>
                                </td>
                                <td className="p-4 text-stone-300 font-bold">{student.avgScore}%</td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                    <button onClick={() => openMessageModal(student)} className="p-2 text-stone-500 hover:text-stone-300 hover:bg-stone-800 rounded">
                                        <MessageCircleIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => openDetailsModal(student)} className="text-xs text-amber-500 hover:text-amber-400 font-medium px-2 py-1">View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* View Details Modal */}
            {detailsModalOpen && selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={() => setDetailsModalOpen(false)}>
                    <div className="bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl w-full max-w-lg p-6 m-4 animate-fade-in" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-4 mb-6 border-b border-stone-800 pb-4">
                            <div className="w-16 h-16 rounded-full bg-stone-800 border-2 border-amber-500 flex items-center justify-center text-2xl font-bold text-stone-200">
                                {selectedStudent.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-stone-100">{selectedStudent.name}</h3>
                                <p className="text-stone-400">{selectedStudent.email}</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
                                <p className="text-xs text-stone-500 uppercase">Attendance</p>
                                <p className="text-xl font-bold text-green-400">{selectedStudent.attendance}</p>
                            </div>
                            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
                                <p className="text-xs text-stone-500 uppercase">Tasks Done</p>
                                <p className="text-xl font-bold text-blue-400">{selectedStudent.completedTasks}</p>
                            </div>
                            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
                                <p className="text-xs text-stone-500 uppercase">Avg Score</p>
                                <p className="text-xl font-bold text-amber-400">{selectedStudent.avgScore}%</p>
                            </div>
                            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
                                <p className="text-xs text-stone-500 uppercase">Focus Time</p>
                                <p className="text-xl font-bold text-purple-400">{selectedStudent.focusHours}h</p>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button onClick={() => setDetailsModalOpen(false)} className="px-4 py-2 bg-stone-800 text-stone-200 rounded-lg hover:bg-stone-700">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Message Modal */}
            {messageModalOpen && selectedStudent && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={() => setMessageModalOpen(false)}>
                    <div className="bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl w-full max-w-md p-6 m-4 animate-fade-in" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-stone-100 mb-4">Message {selectedStudent.name}</h3>
                        <textarea 
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Type your message here..."
                            className="w-full h-32 p-3 bg-stone-950 border border-stone-700 rounded-xl text-stone-200 focus:outline-none focus:border-amber-500 resize-none mb-4"
                        />
                        <div className="flex justify-end gap-2">
                             <button onClick={() => setMessageModalOpen(false)} className="px-4 py-2 bg-stone-800 text-stone-400 rounded-lg hover:bg-stone-700">Cancel</button>
                             <button onClick={sendMessage} className="px-4 py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700">Send</button>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default TeacherDashboardView;
