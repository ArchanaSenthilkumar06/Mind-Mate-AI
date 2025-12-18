
import React, { useState, FormEvent, useEffect } from 'react';
import { StudyPlan, User, StudyGroup, SharedNote, Flashcard, TopicScore, QuizQuestion, MoodEntry } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { PlusIcon } from './icons/PlusIcon';
import { UsersIcon } from './icons/UsersIcon';
import { MessageSquareIcon } from './icons/MessageSquareIcon';
import { ClipboardCheckIcon } from './icons/ClipboardCheckIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ActivityIcon } from './icons/ActivityIcon';
import ExamTimetable from './ExamTimetable';
import { GoogleGenAI, Type } from "@google/genai";

// --- Local Icon Components ---
const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const VideoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const HelpCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const TrophyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21A2.5 2.5 0 0 1 8 21.5a2.5 2.5 0 0 1-1-4.79V14.66" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21A2.5 2.5 0 0 0 16 21.5a2.5 2.5 0 0 0 1-4.79V14.66" />
    <path d="M18 9a6 6 0 0 0-12 0" />
    <path d="M12 15v-6" />
  </svg>
);


// --- Local Components for StudyPlanView ---

const FlashcardItem: React.FC<{ card: Flashcard }> = ({ card }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    return (
        <div className={`flashcard-container h-32 cursor-pointer ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
            <div className="flashcard-inner">
                <div className="flashcard-front bg-stone-800 text-stone-100 text-center border border-stone-700 shadow-sm rounded-lg">
                    <p className="font-semibold">{card.front}</p>
                </div>
                <div className="flashcard-back bg-amber-900/30 text-amber-100 text-center border border-amber-800 shadow-sm rounded-lg">
                    <p>{card.back}</p>
                </div>
            </div>
        </div>
    );
};

const QuizComponent: React.FC<{
    quiz: QuizQuestion[];
    onAnswerQuestion: (isCorrect: boolean) => void;
}> = ({ quiz, onAnswerQuestion }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);

    const currentQuestion = quiz[currentQuestionIndex];

    const handleSubmit = () => {
        if (selectedOption === null) return;
        const isCorrect = selectedOption === currentQuestion.correctAnswerIndex;
        if (isCorrect) {
            setScore(prev => prev + 1);
        }
        onAnswerQuestion(isCorrect);
        setSubmitted(true);
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setSubmitted(false);
        } else {
            setQuizFinished(true);
        }
    };
    
    const handleRestart = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setSubmitted(false);
        setScore(0);
        setQuizFinished(false);
    };

    if (quizFinished) {
        return (
            <div className="text-center p-4">
                <h4 className="text-lg font-bold text-stone-100">Quiz Complete!</h4>
                <p className="text-stone-400 mt-2">You scored {score} out of {quiz.length}.</p>
                <button onClick={handleRestart} className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-md hover:bg-amber-700">
                    Try Again
                </button>
            </div>
        );
    }
    
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-stone-100">Pop Quiz!</h4>
                <p className="text-sm font-medium text-stone-400">Question {currentQuestionIndex + 1}/{quiz.length}</p>
            </div>
            <p className="text-stone-300 mb-4">{currentQuestion.question}</p>
            <div className="space-y-2">
                {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedOption === index;
                    const isCorrect = currentQuestion.correctAnswerIndex === index;
                    let buttonClass = 'w-full text-left p-2.5 text-sm border rounded-md transition-colors ';
                    if (submitted) {
                        if (isCorrect) {
                           buttonClass += 'bg-green-900/30 border-green-800 text-green-300';
                        } else if (isSelected) {
                           buttonClass += 'bg-red-900/30 border-red-800 text-red-300';
                        } else {
                           buttonClass += 'bg-stone-800 border-stone-700 text-stone-500';
                        }
                    } else {
                         buttonClass += isSelected ? 'bg-amber-900/40 border-amber-700 text-amber-200' : 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700';
                    }

                    return (
                        <button key={index} onClick={() => !submitted && setSelectedOption(index)} disabled={submitted} className={buttonClass}>
                            {option}
                        </button>
                    );
                })}
            </div>
            {submitted && (
                <div className="mt-4 p-3 bg-blue-900/30 border border-blue-800 rounded-lg text-sm text-blue-300">
                    <p><span className="font-bold">Explanation:</span> {currentQuestion.explanation}</p>
                </div>
            )}
            <div className="mt-4 flex justify-end">
                {submitted ? (
                    <button onClick={handleNext} className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-md hover:bg-amber-700">
                        {currentQuestionIndex < quiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </button>
                ) : (
                    <button onClick={handleSubmit} disabled={selectedOption === null} className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-md hover:bg-amber-700 disabled:bg-stone-700 disabled:text-stone-500 disabled:cursor-not-allowed">
                        Submit Answer
                    </button>
                )}
            </div>
        </div>
    );
}

const TopicDetails: React.FC<{
    topic: StudyPlan['topics'][0];
    notes: SharedNote[];
    flashcards: Flashcard[];
    leaderboard: { userId: string; userName: string; score: number }[];
    currentGroup: StudyGroup | undefined;
    onAddNote: (content: string) => void;
    onAddFlashcard: (front: string, back: string) => void;
    onAnswerQuestion: (isCorrect: boolean) => void;
}> = ({ topic, notes, flashcards, leaderboard, currentGroup, onAddNote, onAddFlashcard, onAnswerQuestion }) => {
    const [activeTab, setActiveTab] = useState('summary');
    const [noteContent, setNoteContent] = useState('');
    const [flashcardFront, setFlashcardFront] = useState('');
    const [flashcardBack, setFlashcardBack] = useState('');
    const [isGeneratingCards, setIsGeneratingCards] = useState(false);

    const handleAddNoteSubmit = () => {
        if (noteContent.trim()) {
            onAddNote(noteContent);
            setNoteContent('');
        }
    };

    const handleAddFlashcardSubmit = () => {
        if (flashcardFront.trim() && flashcardBack.trim()) {
            onAddFlashcard(flashcardFront, flashcardBack);
            setFlashcardFront('');
            setFlashcardBack('');
        }
    };

    const handleAutoGenerateFlashcards = async () => {
        setIsGeneratingCards(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Generate 3 high-quality flashcards for the topic "${topic.topicName}". 
            Subtopics include: ${topic.subTopics.join(', ')}.
            Return ONLY a JSON array of objects with "front" and "back" string properties.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                front: { type: Type.STRING },
                                back: { type: Type.STRING },
                            },
                            required: ['front', 'back']
                        }
                    }
                }
            });

            const cards = JSON.parse(response.text);
            if (Array.isArray(cards)) {
                cards.forEach((card: any) => {
                    onAddFlashcard(card.front, card.back);
                });
            }
        } catch (e) {
            console.error("Failed to generate cards", e);
            alert("Could not auto-generate cards right now.");
        } finally {
            setIsGeneratingCards(false);
        }
    }
    
    const tabs = [
        { id: 'summary', label: 'Summary', icon: FileTextIcon },
        { id: 'videos', label: 'Videos', icon: VideoIcon },
        { id: 'notes', label: 'Group Notes', icon: MessageSquareIcon },
        { id: 'flashcards', label: 'Flashcards', icon: SparklesIcon },
        { id: 'practice', label: 'Practice', icon: HelpCircleIcon },
        { id: 'leaderboard', label: 'Leaderboard', icon: TrophyIcon },
    ];

    return (
        <div className="mt-4">
            <div className="border-b border-stone-700">
                <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`${activeTab === tab.id ? 'border-amber-500 text-amber-500' : 'border-transparent text-stone-400 hover:text-stone-200 hover:border-stone-600'} flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}>
                            <tab.icon className="w-4 h-4"/> {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="pt-4 min-h-[250px]">
                {activeTab === 'summary' && (
                    <div className="space-y-2">
                        <h4 className="font-semibold text-stone-200">Key Concepts</h4>
                        <div className="flex flex-wrap gap-2">
                            {topic.subTopics.map(sub => (
                                <span key={sub} className="px-2 py-1 text-xs bg-stone-800 text-stone-300 rounded-md border border-stone-700">{sub}</span>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'videos' && (
                    <div className="space-y-3">
                         <h4 className="font-semibold text-stone-200">Recommended Videos</h4>
                         {topic.youtubeLinks.length > 0 ? topic.youtubeLinks.map(link => (
                            <a href={link.url} target="_blank" rel="noopener noreferrer" key={link.url} className="block p-3 bg-stone-800 border border-stone-700 rounded-lg hover:bg-stone-750 transition-colors shadow-sm">
                                <p className="font-semibold text-sm text-amber-500">{link.title}</p>
                                <p className="text-xs text-stone-500 truncate">{link.url}</p>
                            </a>
                         )) : <p className="text-sm text-stone-500">No videos available for this topic.</p>}
                    </div>
                )}
                {activeTab === 'notes' && (
                    <div>
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 mb-4">
                            {notes.length > 0 ? notes.map(note => (
                                <div key={note.id} className="bg-stone-800 border border-stone-700 p-3 rounded-md text-sm">
                                    <p className="text-stone-300">{note.content}</p>
                                    <p className="text-xs text-stone-500 mt-1 text-right">- {note.author}</p>
                                </div>
                            )) : <p className="text-sm text-stone-500">No notes for this topic yet. Be the first!</p>}
                        </div>
                        <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder="Add a shared note..." className="w-full text-sm p-2 border rounded-md bg-stone-800 border-stone-600 text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"></textarea>
                        <button onClick={handleAddNoteSubmit} className="mt-2 px-3 py-1 text-xs font-semibold text-white bg-amber-600 rounded-md hover:bg-amber-700">Add Note</button>
                    </div>
                )}
                {activeTab === 'flashcards' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-stone-200">Deck</h4>
                            <button 
                                onClick={handleAutoGenerateFlashcards} 
                                disabled={isGeneratingCards}
                                className="px-3 py-1 text-xs font-bold text-white bg-purple-600 rounded-full hover:bg-purple-700 flex items-center gap-1 shadow-md disabled:opacity-50"
                            >
                                {isGeneratingCards ? 'Generating...' : <><SparklesIcon className="w-3 h-3"/> Auto-Gen with AI</>}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-48 overflow-y-auto pr-2 mb-4">
                            {flashcards.length > 0 ? flashcards.map(card => (
                                <FlashcardItem key={card.id} card={card} />
                            )) : <p className="text-sm text-stone-500 sm:col-span-2">No flashcards yet. Create one or ask AI!</p>}
                        </div>
                        <div className="border-t border-stone-700 pt-4">
                            <input value={flashcardFront} onChange={e => setFlashcardFront(e.target.value)} placeholder="Front of card" className="w-full text-sm p-2 mb-2 border rounded-md bg-stone-800 border-stone-600 text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                            <input value={flashcardBack} onChange={e => setFlashcardBack(e.target.value)} placeholder="Back of card" className="w-full text-sm p-2 mb-2 border rounded-md bg-stone-800 border-stone-600 text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                            <button onClick={handleAddFlashcardSubmit} className="px-3 py-1 text-xs font-semibold text-white bg-amber-600 rounded-md hover:bg-amber-700">Add Flashcard</button>
                        </div>
                    </div>
                )}
                 {activeTab === 'practice' && (
                     <div>
                        {currentGroup ? (
                           (topic.quiz && topic.quiz.length > 0) ? (
                                <QuizComponent quiz={topic.quiz} onAnswerQuestion={onAnswerQuestion} />
                            ) : (
                                <p className="text-sm text-stone-500">No quiz available for this topic yet.</p>
                            )
                        ) : <p className="text-sm text-stone-500">Join a group to participate in quizzes.</p>}
                    </div>
                 )}
                 {activeTab === 'leaderboard' && (
                     <div>
                        {currentGroup ? (
                            <div>
                                <h5 className="font-semibold mb-2 text-stone-300">Topic Leaderboard</h5>
                                {leaderboard.length > 0 ? (
                                <ul className="space-y-1 text-sm">
                                    {leaderboard.map((s, index) => (
                                        <li key={s.userId} className="flex justify-between items-center p-2 bg-stone-800 rounded-md border border-stone-700">
                                            <span className="flex items-center gap-2 text-stone-300">
                                               <span className="font-bold w-5 text-center text-amber-500">{index + 1}</span>
                                               {s.userName}
                                            </span>
                                            <span className="font-bold text-amber-500">{s.score} pts</span>
                                        </li>
                                    ))}
                                </ul>
                                ) : <p className="text-sm text-stone-500">No scores yet. Be the first to answer!</p>}
                            </div>
                        ) : <p className="text-sm text-stone-500">Leaderboards are available within a group.</p>}
                    </div>
                 )}
            </div>
        </div>
    );
};

const TopicAccordion: React.FC<{
    topic: StudyPlan['topics'][0];
    isCompleted: boolean;
    onToggleComplete: () => void;
    children: React.ReactNode;
}> = ({ topic, isCompleted, onToggleComplete, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-stone-800 rounded-lg overflow-hidden transition-all duration-300 shadow-sm bg-stone-900">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 bg-stone-900 hover:bg-stone-800 transition-colors">
                <div className="flex-grow">
                    <h3 className={`text-lg font-semibold text-left transition-colors ${isCompleted ? 'text-stone-500 line-through' : 'text-stone-200'}`}>{topic.topicName}</h3>
                    <p className={`text-sm text-stone-500 mt-1 text-left ${isCompleted ? 'line-through' : ''}`}>{topic.description}</p>
                </div>
                 <div className="flex items-center gap-4 pl-4">
                     <button onClick={(e) => { e.stopPropagation(); onToggleComplete(); }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-colors ${isCompleted ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-stone-800 text-stone-400 border border-stone-700 hover:bg-stone-700'}`}>
                        {isCompleted ? '✓ Done' : 'Mark Complete'}
                    </button>
                    <ChevronDownIcon className={`w-5 h-5 text-stone-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                 </div>
            </button>
            {isOpen && (
                <div className="p-4 bg-stone-950 border-t border-stone-800">
                    {children}
                </div>
            )}
        </div>
    );
};

// --- Helper for Mock Data ---
const generateMockMoodHistory = (): MoodEntry[] => {
    const history: MoodEntry[] = [];
    const today = new Date();
    for (let i = 6; i >= 1; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        history.push({
            date: dateStr,
            timestamp: d.getTime(),
            mood: Math.random() > 0.6 ? 'Happy' : Math.random() > 0.5 ? 'Neutral' : 'Stressed',
            intensity: Math.floor(Math.random() * 4) + 6, // 6-10
            tags: ['Mock Entry']
        });
    }
    return history;
};

interface StudyPlanViewProps {
    plan: StudyPlan;
    onReset: () => void;
    user: User;
    users: User[];
    allGroups: StudyGroup[];
    groups: StudyGroup[];
    notes: SharedNote[];
    flashcards: Flashcard[];
    topicScores: TopicScore[];
    onAddNote: (topicName: string, content: string) => void;
    onAddFlashcard: (topicName: string, front: string, back: string) => void;
    onCreateGroup: (name: string, subject: string) => void;
    onJoinGroup: (groupId: string) => void;
    onLeaveGroup: (groupId: string) => void;
    onAnswerQuestion: (groupId: string, topicName: string, isCorrect: boolean) => void;
    onToggleTopicComplete: (topicName: string) => void;
    onSendInvitation: (toUserId: string, groupId: string) => void;
    syllabusText: string;
}

const StudyPlanView: React.FC<StudyPlanViewProps> = (props) => {
    const { 
        plan, onReset, user, users, allGroups, groups, notes, flashcards, topicScores,
        onAddNote, onAddFlashcard, onCreateGroup, onJoinGroup, onLeaveGroup, 
        onAnswerQuestion, onToggleTopicComplete, onSendInvitation 
    } = props;
    
    const [newGroupName, setNewGroupName] = useState('');
    const [inviteUser, setInviteUser] = useState('');
    const [inviteGroup, setInviteGroup] = useState('');
    
    // --- Mood State ---
    const [moodLoggedToday, setMoodLoggedToday] = useState(false);
    const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
    const [selectedMood, setSelectedMood] = useState<'Happy' | 'Neutral' | 'Stressed' | null>(null);
    const [intensity, setIntensity] = useState(5);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    useEffect(() => {
        const storedHistory = localStorage.getItem('moodHistory');
        let history: MoodEntry[] = [];
        
        if (storedHistory) {
            history = JSON.parse(storedHistory);
        } else {
            // Seed with mock data for demo purposes if empty
            history = generateMockMoodHistory();
            localStorage.setItem('moodHistory', JSON.stringify(history));
        }
        
        setMoodHistory(history);

        const currentDate = new Date().toISOString().split('T')[0];
        if (history.some(entry => entry.date === currentDate)) {
            setMoodLoggedToday(true);
        }
    }, []);

    const handleCreateGroupSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (newGroupName.trim()) {
            onCreateGroup(newGroupName, plan.courseName);
            setNewGroupName('');
        }
    };

    const handleSendInviteSubmit = (e: FormEvent) => {
        e.preventDefault();
        if(inviteUser && inviteGroup) {
            onSendInvitation(inviteUser, inviteGroup);
            setInviteUser('');
            setInviteGroup('');
        }
    }

    // Mood Logic
    const availableTags = {
        'Happy': ['Motivated', 'Confident', 'Excited', 'Relaxed', 'Productive'],
        'Neutral': ['Focused', 'Tired', 'Bored', 'Distracted', 'Okay'],
        'Stressed': ['Anxious', 'Overwhelmed', 'Frustrated', 'Sad', 'Confused'],
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const handleSaveMood = () => {
        if (!selectedMood) return;
        const newEntry: MoodEntry = {
            date: new Date().toISOString().split('T')[0],
            timestamp: Date.now(),
            mood: selectedMood,
            intensity,
            tags: selectedTags
        };
        const newHistory = [...moodHistory, newEntry];
        localStorage.setItem('moodHistory', JSON.stringify(newHistory));
        setMoodHistory(newHistory);
        setMoodLoggedToday(true);
    };
    
    // Chart Logic
    const renderMoodChart = () => {
        const data = moodHistory.slice(-7); // Last 7 entries
        if (data.length < 2) return <p className="text-sm text-stone-500 text-center py-8">Not enough data to show trends yet.</p>;

        const width = 100; // percent
        const height = 100; // px
        const points = data.map((entry, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - (entry.intensity * 10); // Scale 1-10 to 0-100 height (inverted)
            return `${x},${y}`;
        }).join(' ');

        return (
            <div className="w-full h-32 relative mt-4">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="overflow-visible">
                     {/* Grid lines */}
                    <line x1="0" y1="0" x2="100" y2="0" stroke="#44403c" strokeWidth="1" vectorEffect="non-scaling-stroke"/>
                    <line x1="0" y1="50" x2="100" y2="50" stroke="#44403c" strokeWidth="1" vectorEffect="non-scaling-stroke"/>
                    <line x1="0" y1="100" x2="100" y2="100" stroke="#44403c" strokeWidth="1" vectorEffect="non-scaling-stroke"/>
                    
                    {/* Line */}
                    <polyline points={points} fill="none" stroke="#d97706" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                    
                    {/* Points */}
                    {data.map((entry, index) => {
                        const x = (index / (data.length - 1)) * 100;
                        const y = 100 - (entry.intensity * 10);
                        let color = '#a8a29e'; // stone-400
                        if (entry.mood === 'Happy') color = '#10b981'; // green
                        if (entry.mood === 'Stressed') color = '#ef4444'; // red
                        
                        return (
                            <circle key={index} cx={`${x}%`} cy={`${y}%`} r="4" fill={color} stroke="#1c1917" strokeWidth="2" />
                        );
                    })}
                </svg>
                <div className="flex justify-between text-xs text-stone-500 mt-2">
                    {data.map((entry, i) => (
                        <span key={i}>{entry.date.slice(5)}</span>
                    ))}
                </div>
            </div>
        );
    };

    
    const completionPercentage = plan.topics.length > 0 ? Math.round((plan.completedTopics.length / plan.topics.length) * 100) : 0;
    const difficultyColor: { [key: string]: string } = {
        'Beginner': 'bg-green-900/30 text-green-400 border border-green-800',
        'Medium': 'bg-yellow-900/30 text-yellow-400 border border-yellow-800',
        'Advanced': 'bg-red-900/30 text-red-400 border border-red-800',
    };


    const availableGroups = allGroups.filter(g => !user.groups.includes(g.id));
    const potentialInvitees = users.filter(u => u.id !== user.id);

    return (
    <div className="animate-fade-in">
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl mb-8">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-medium text-stone-400">Welcome back, {user.name}! 👋</h2>
                    <h1 className="text-3xl font-bold text-stone-100">{plan.courseName}</h1>
                    {plan.difficulty && (
                        <span className={`mt-2 inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${difficultyColor[plan.difficulty] || 'bg-stone-800 text-stone-400'}`}>
                            {plan.difficulty}
                        </span>
                    )}
                </div>
                <button onClick={onReset} className="px-4 py-2 text-sm font-medium text-stone-300 bg-stone-800 rounded-lg hover:bg-stone-700 flex-shrink-0 transition-colors">
                    Start Over
                </button>
            </div>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-stone-400">Overall Progress</span>
                    <span className="text-sm font-bold text-amber-500">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-stone-800 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-amber-600 to-yellow-600 h-2.5 rounded-full transition-all duration-500 shadow-sm" style={{ width: `${completionPercentage}%` }}></div>
                </div>
            </div>

            {/* Mood Tracker Section */}
            <div className="mt-8 pt-6 border-t border-stone-800">
                <h3 className="text-lg font-bold text-stone-100 mb-4 flex items-center gap-2">
                    <ActivityIcon className="w-5 h-5 text-amber-500" /> Daily Mood Check-In
                </h3>

                {moodLoggedToday ? (
                    <div className="animate-fade-in">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-stone-400">Thanks for checking in today! Here is your mood trend over the last week.</p>
                            <span className="text-xs font-medium px-2 py-1 bg-amber-900/30 text-amber-500 rounded-full border border-amber-800">Intensity (1-10)</span>
                        </div>
                        {renderMoodChart()}
                    </div>
                ) : (
                    <div className="space-y-6 animate-fade-in">
                        {/* Step 1: Select Mood */}
                        <div>
                            <p className="text-sm font-medium text-stone-300 mb-3">How are you feeling right now?</p>
                            <div className="grid grid-cols-3 gap-4">
                                <button 
                                    onClick={() => { setSelectedMood('Happy'); setSelectedTags([]); }}
                                    className={`p-4 rounded-xl border-2 transition-all ${selectedMood === 'Happy' ? 'border-green-600 bg-green-900/20 shadow-md transform scale-105' : 'border-stone-700 bg-stone-800 hover:border-green-800'}`}
                                >
                                    <div className="text-3xl mb-1">😊</div>
                                    <div className="text-sm font-semibold text-stone-200">Happy</div>
                                </button>
                                <button 
                                    onClick={() => { setSelectedMood('Neutral'); setSelectedTags([]); }}
                                    className={`p-4 rounded-xl border-2 transition-all ${selectedMood === 'Neutral' ? 'border-stone-500 bg-stone-800 shadow-md transform scale-105' : 'border-stone-700 bg-stone-800 hover:border-stone-600'}`}
                                >
                                    <div className="text-3xl mb-1">😐</div>
                                    <div className="text-sm font-semibold text-stone-200">Neutral</div>
                                </button>
                                <button 
                                    onClick={() => { setSelectedMood('Stressed'); setSelectedTags([]); }}
                                    className={`p-4 rounded-xl border-2 transition-all ${selectedMood === 'Stressed' ? 'border-red-600 bg-red-900/20 shadow-md transform scale-105' : 'border-stone-700 bg-stone-800 hover:border-red-800'}`}
                                >
                                    <div className="text-3xl mb-1">😟</div>
                                    <div className="text-sm font-semibold text-stone-200">Stressed</div>
                                </button>
                            </div>
                        </div>

                        {/* Step 2 & 3: Details (Only if mood selected) */}
                        {selectedMood && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-medium text-stone-300">Intensity: {intensity}/10</label>
                                        <span className="text-xs text-stone-500">How strong is this feeling?</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="1" max="10" 
                                        value={intensity} 
                                        onChange={(e) => setIntensity(parseInt(e.target.value))} 
                                        className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                    />
                                    <div className="flex justify-between text-xs text-stone-500 mt-1">
                                        <span>Mild</span>
                                        <span>Strong</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-stone-300 mb-2 block">What best describes it?</label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableTags[selectedMood].map(tag => (
                                            <button 
                                                key={tag}
                                                onClick={() => toggleTag(tag)}
                                                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                                                    selectedTags.includes(tag) 
                                                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                                                        : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700'
                                                }`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    onClick={handleSaveMood}
                                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-semibold rounded-lg shadow-md transition-all"
                                >
                                    Log Mood
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
                 {/* Exam Timetable (Added) */}
                 <ExamTimetable />

                <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-stone-100"><ClipboardCheckIcon className="w-6 h-6 text-amber-500"/> Course Topics 📚</h2>
                    <div className="space-y-3">
                        {plan.topics.map(topic => {
                            const topicNotes = notes.filter(n => n.topicName === topic.topicName);
                            const topicFlashcards = flashcards.filter(f => f.topicName === topic.topicName);
                            const currentGroup = groups[0];
                            const topicLeaderboard = topicScores
                                .filter(s => s.topicName === topic.topicName && s.groupId === currentGroup?.id)
                                .sort((a, b) => b.score - a.score)
                                .map(score => ({
                                    ...score,
                                    userName: users.find(u => u.id === score.userId)?.name || 'Unknown'
                                }));

                            return (
                                <TopicAccordion 
                                    key={topic.topicName} 
                                    topic={topic}
                                    isCompleted={plan.completedTopics.includes(topic.topicName)}
                                    onToggleComplete={() => onToggleTopicComplete(topic.topicName)}
                                >
                                    <TopicDetails
                                        topic={topic}
                                        notes={topicNotes}
                                        flashcards={topicFlashcards}
                                        leaderboard={topicLeaderboard}
                                        currentGroup={currentGroup}
                                        onAddNote={(content) => onAddNote(topic.topicName, content)}
                                        onAddFlashcard={(front, back) => onAddFlashcard(topic.topicName, front, back)}
                                        onAnswerQuestion={(isCorrect) => currentGroup && onAnswerQuestion(currentGroup.id, topic.topicName, isCorrect)}
                                    />
                                </TopicAccordion>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4 text-stone-100">Your Schedule 🗓️</h2>
                    <ul className="space-y-4">
                        {plan.schedule.map(item => (
                            <li key={item.day}>
                                <h4 className="font-semibold text-stone-300">{item.day}</h4>
                                <ul className="list-disc list-inside mt-1 space-y-1 pl-2">
                                    {item.activities.map(activity => (
                                        <li key={activity} className="text-sm text-stone-500">{activity}</li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="space-y-6 lg:sticky lg:top-24">
                <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-stone-100"><UsersIcon className="w-6 h-6 text-amber-500"/> Collaboration Hub 👥</h2>
                    
                    <div className="mb-4">
                        <h3 className="font-semibold mb-2 text-stone-400">My Groups</h3>
                        <ul className="space-y-2">
                            {groups.map(g => (
                                <li key={g.id} className="p-3 bg-stone-800 rounded-lg border border-stone-700">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-stone-200">{g.name}</p>
                                            <p className="text-xs text-stone-500">{g.members.join(', ')}</p>
                                        </div>
                                        <button onClick={() => onLeaveGroup(g.id)} className="text-xs text-red-400 hover:underline font-medium">Leave</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {availableGroups.length > 0 && <div className="mb-4">
                        <h3 className="font-semibold mb-2 text-stone-400">Available Groups</h3>
                        <ul className="space-y-2">
                            {availableGroups.map(g => (
                                <li key={g.id} className="flex justify-between items-center p-3 bg-stone-800 rounded-lg border border-stone-700">
                                    <div>
                                        <p className="font-semibold text-stone-200">{g.name}</p>
                                        <p className="text-xs text-stone-500">{g.members.length} member(s)</p>
                                    </div>
                                    <button onClick={() => onJoinGroup(g.id)} className="px-2 py-1 text-xs font-semibold text-white bg-amber-600 rounded-md hover:bg-amber-700">Join</button>
                                </li>
                            ))}
                        </ul>
                    </div>}

                    <div className="mb-4">
                        <h3 className="font-semibold mb-2 text-stone-400">Create New Group</h3>
                        <form onSubmit={handleCreateGroupSubmit} className="flex gap-2">
                            <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Group name..." className="flex-grow w-full text-sm p-2 border rounded-md bg-stone-800 border-stone-600 text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                            <button type="submit" className="p-2 text-white bg-amber-600 rounded-md hover:bg-amber-700"><PlusIcon className="w-5 h-5"/></button>
                        </form>
                    </div>

                    {groups.length > 0 && potentialInvitees.length > 0 && <div>
                        <h3 className="font-semibold mb-2 text-stone-400">Invite to Group</h3>
                        <form onSubmit={handleSendInviteSubmit} className="space-y-2">
                            <select value={inviteUser} onChange={e => setInviteUser(e.target.value)} className="w-full text-sm p-2 border rounded-md bg-stone-800 border-stone-600 text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500">
                                <option value="">Select User</option>
                                {potentialInvitees.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                            <select value={inviteGroup} onChange={e => setInviteGroup(e.target.value)} className="w-full text-sm p-2 border rounded-md bg-stone-800 border-stone-600 text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500">
                                <option value="">Select Group</option>
                                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                            <button type="submit" className="w-full p-2 text-sm font-semibold text-white bg-stone-700 rounded-md hover:bg-stone-600">Send Invite</button>
                        </form>
                    </div>}
                </div>
            </div>
        </div>
    </div>
  );
};

export default StudyPlanView;
