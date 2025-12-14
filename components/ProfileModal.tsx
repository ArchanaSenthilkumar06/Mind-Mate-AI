import React, { useState } from 'react';
import { User, StudyGroup } from '../types';
import { UserIcon } from './icons/UserIcon';

interface ProfileModalProps {
    user: User;
    userGroups: StudyGroup[];
    onClose: () => void;
    onUpdateUser: (newName: string) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, userGroups, onClose, onUpdateUser }) => {
    const [name, setName] = useState(user.name);
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = () => {
        onUpdateUser(name);
        setIsEditing(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={onClose}>
            <div className="bg-stone-900 rounded-2xl shadow-2xl w-full max-w-md p-6 m-4 animate-fade-in border border-stone-800" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b border-stone-800 pb-3">
                    <h2 className="text-lg font-semibold text-stone-100">Profile</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-stone-800 transition-colors">
                        <svg className="w-6 h-6 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="py-6 text-center">
                    <div className="w-24 h-24 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-stone-700">
                        <UserIcon className="w-12 h-12 text-amber-500" />
                    </div>
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            className="mt-2 text-center text-2xl font-bold bg-stone-800 text-stone-100 rounded-md p-1 border border-stone-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" 
                        />
                    ) : (
                        <h3 className="mt-2 text-2xl font-bold text-stone-100">{user.name}</h3>
                    )}
                    <p className="text-stone-400">{user.email}</p>
                </div>

                <div className="space-y-4">
                    <h4 className="font-semibold text-stone-300">My Study Groups</h4>
                    <ul className="space-y-2">
                        {userGroups.length > 0 ? userGroups.map(group => (
                            <li key={group.id} className="text-stone-300 p-3 bg-stone-800 rounded-lg border border-stone-700">{group.name}</li>
                        )) : (
                            <li className="text-stone-500 text-sm italic">You haven't joined any groups yet.</li>
                        )}
                    </ul>
                </div>
                
                <div className="mt-8 flex justify-end gap-3">
                    {isEditing ? (
                         <>
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium bg-stone-800 text-stone-400 rounded-lg hover:bg-stone-700">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700">Save</button>
                         </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 shadow-md">Edit Profile</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;