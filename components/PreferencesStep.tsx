import React, { useState, FormEvent } from 'react';
import type { Preferences } from '../types';

interface PreferencesStepProps {
  onSubmit: (preferences: Preferences) => void;
  onBack: () => void;
  error: string | null;
}

const PreferencesStep: React.FC<PreferencesStepProps> = ({ onSubmit, onBack, error }) => {
  const [preferences, setPreferences] = useState<Preferences>({
    studyFrequency: '3-4 times a week',
    sessionLength: '45 minutes',
    learningStyle: 'Visual',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(preferences);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-stone-900 rounded-2xl shadow-xl border border-stone-800 animate-fade-in">
      <h2 className="text-2xl font-bold text-stone-100 mb-2">Set Your Preferences</h2>
      <p className="text-stone-400 mb-6">Help the AI tailor the perfect plan for you.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1">How often do you want to study?</label>
          <select value={preferences.studyFrequency} onChange={e => setPreferences({...preferences, studyFrequency: e.target.value})} className="block w-full p-2.5 border border-stone-700 bg-stone-800 text-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none">
            <option>1-2 times a week</option>
            <option>3-4 times a week</option>
            <option>5+ times a week</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1">Preferred session length?</label>
          <select value={preferences.sessionLength} onChange={e => setPreferences({...preferences, sessionLength: e.target.value})} className="block w-full p-2.5 border border-stone-700 bg-stone-800 text-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none">
            <option>25 minutes (Pomodoro)</option>
            <option>45 minutes</option>
            <option>60 minutes</option>
            <option>90 minutes</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1">Primary learning style?</label>
          <select value={preferences.learningStyle} onChange={e => setPreferences({...preferences, learningStyle: e.target.value})} className="block w-full p-2.5 border border-stone-700 bg-stone-800 text-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none">
            <option>Visual (diagrams, charts)</option>
            <option>Auditory (listening, discussing)</option>
            <option>Reading/Writing (notes, articles)</option>
            <option>Kinesthetic (hands-on practice)</option>
          </select>
        </div>
        
        {error && <p className="text-sm text-red-400">{error}</p>}
        
        <div className="flex justify-between items-center pt-4">
          <button type="button" onClick={onBack} className="px-4 py-2 text-sm font-medium text-stone-300 bg-stone-800 rounded-lg hover:bg-stone-700 transition-colors">
            Back
          </button>
          <button type="submit" className="px-6 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 shadow-md transition-colors">
            Generate Plan
          </button>
        </div>
      </form>
    </div>
  );
};

export default PreferencesStep;