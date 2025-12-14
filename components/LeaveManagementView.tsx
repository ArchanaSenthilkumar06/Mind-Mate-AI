
import React, { useState } from 'react';
import { LeaveRequest, User } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';
import { CheckSquareIcon } from './icons/CheckSquareIcon';

interface LeaveManagementViewProps {
    requests: LeaveRequest[];
    userRole: 'student' | 'teacher' | 'parent';
    currentUser: User;
    onStatusChange: (id: string, status: 'Approved' | 'Rejected') => void;
    onApplyLeave: (reason: string, dates: string) => void;
}

const LeaveManagementView: React.FC<LeaveManagementViewProps> = ({ requests, userRole, currentUser, onStatusChange, onApplyLeave }) => {
    const [reason, setReason] = useState('');
    const [dates, setDates] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (reason && dates) {
            onApplyLeave(reason, dates);
            setReason('');
            setDates('');
            alert("Leave Request Submitted!");
        }
    };

    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in min-h-screen">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-purple-900/30 rounded-xl text-purple-500">
                    <CalendarIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-stone-100">Leave Management</h2>
                    <p className="text-stone-400">
                        {userRole === 'teacher' ? 'Review student leave requests.' : 'Apply for leave easily.'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Application Form (Parent Only) */}
                {userRole === 'parent' && (
                    <div className="lg:col-span-1 bg-stone-950 p-6 rounded-2xl border border-stone-800 h-fit">
                        <h3 className="text-xl font-bold text-white mb-4">Apply for Leave</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Dates</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g., Oct 24 - Oct 26" 
                                    value={dates}
                                    onChange={(e) => setDates(e.target.value)}
                                    className="w-full bg-stone-900 border border-stone-700 rounded-lg p-3 text-stone-200 focus:border-purple-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Reason</label>
                                <textarea 
                                    rows={4}
                                    placeholder="Why is the student taking leave?" 
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full bg-stone-900 border border-stone-700 rounded-lg p-3 text-stone-200 focus:border-purple-500 outline-none resize-none"
                                />
                            </div>
                            <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors">
                                Submit Request
                            </button>
                        </form>
                    </div>
                )}

                {/* Request List */}
                <div className={`${userRole === 'parent' ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                    <h3 className="text-xl font-bold text-white mb-4">
                        {userRole === 'teacher' ? 'Pending Requests' : 'History'}
                    </h3>
                    
                    <div className="space-y-4">
                        {requests.length === 0 ? (
                            <p className="text-stone-500 italic">No leave requests found.</p>
                        ) : (
                            requests.map(req => (
                                <div key={req.id} className="bg-stone-950 border border-stone-800 p-5 rounded-xl flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-stone-200 text-lg">{req.studentName}</span>
                                            {userRole === 'teacher' && <span className="text-xs text-stone-500">Parent: {req.parentName}</span>}
                                        </div>
                                        <p className="text-purple-400 font-medium text-sm mb-1">{req.dates}</p>
                                        <p className="text-stone-400 text-sm italic">"{req.reason}"</p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {userRole === 'teacher' && req.status === 'Pending' ? (
                                            <>
                                                <button onClick={() => onStatusChange(req.id, 'Rejected')} className="px-4 py-2 bg-stone-800 text-stone-400 hover:text-red-400 hover:bg-red-900/10 font-bold rounded-lg text-sm transition-colors">
                                                    Reject
                                                </button>
                                                <button onClick={() => onStatusChange(req.id, 'Approved')} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-sm transition-colors flex items-center gap-2">
                                                    <CheckSquareIcon className="w-4 h-4" /> Approve
                                                </button>
                                            </>
                                        ) : (
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                                req.status === 'Approved' ? 'bg-green-900/20 text-green-400' :
                                                req.status === 'Rejected' ? 'bg-red-900/20 text-red-400' :
                                                'bg-yellow-900/20 text-yellow-400'
                                            }`}>
                                                {req.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaveManagementView;
