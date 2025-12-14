
import React, { useState, useEffect } from 'react';
import { AppState, AppView, Preferences, StudyPlan, User, StudyGroup, SharedNote, Flashcard, TopicScore, Invitation } from './types';
import SyllabusUploadStep from './components/SyllabusUploadStep';
import PreferencesStep from './components/PreferencesStep';
import StudyPlanView from './components/StudyPlanView';
import { generateStudyPlan } from './services/geminiService';
import Loader from './components/Loader';
import AuthPage from './components/AuthPage';
import ProfileModal from './components/ProfileModal';
import FocusMonitorView from './components/FocusMonitorView';
import GroupChatView from './components/GroupChatView';
import AmbientVoiceView from './components/AmbientVoiceView';
import IntelligentTodoView from './components/IntelligentTodoView';
import WellbeingHubView from './components/WellbeingHubView';
import GamingView from './components/GamingView';
import FeynmanBoardView from './components/FeynmanBoardView';
import DebateArenaView from './components/DebateArenaView'; // Import DebateArenaView
import LandingPage from './components/LandingPage';

import { BookOpenIcon } from './components/icons/BookOpenIcon';
import { UserIcon } from './components/icons/UserIcon';
import { LogOutIcon } from './components/icons/LogOutIcon';
import { BellIcon } from './components/icons/BellIcon';
import { LayoutDashboardIcon } from './components/icons/LayoutDashboardIcon';
import { TargetIcon } from './components/icons/TargetIcon';
import { MessageCircleIcon } from './components/icons/MessageCircleIcon';
import { MicIcon } from './components/icons/MicIcon';
import { CheckSquareIcon } from './components/icons/CheckSquareIcon';
import { WindIcon } from './components/icons/WindIcon';
import { Gamepad2Icon } from './components/icons/Gamepad2Icon';
import { PresentationIcon } from './components/icons/PresentationIcon';
import { SwordsIcon } from './components/icons/SwordsIcon'; // Import SwordsIcon


// Mock Database Initialization
const initializeMockData = () => {
    // In a real app, this data would come from a database.
    const initialUsers: User[] = [
        { id: 'user-1', name: 'Archana', email: 'archana@example.com', password: 'password123', groups: ['group-1'] },
        { id: 'user-2', name: 'Lavanya', email: 'lavanya@example.com', password: 'password123', groups: ['group-1'] },
        { id: 'user-3', name: 'Dhivya Prabha', email: 'dhivya@example.com', password: 'password123', groups: ['group-1'] },
        { id: 'user-4', name: 'Maithraye', email: 'maithraye@example.com', password: 'password123', groups: ['group-2'] },
        { id: 'user-5', name: 'Divya', email: 'divya@example.com', password: 'password123', groups: [] },
        { id: 'user-6', name: 'Afraah', email: 'afraah@example.com', password: 'password123', groups: [] },
        { id: 'user-7', name: 'Gopika', email: 'gopika@example.com', password: 'password123', groups: ['group-2'] },
        { id: 'user-anika', name: 'Anika (You)', email: 'anika@example.com', password: 'password123', groups: ['group-3'] },
        { id: 'user-peter', name: 'Peter', email: 'peter@example.com', password: 'password123', groups: ['group-3'] },
    ];
    const initialGroups: StudyGroup[] = [
        { id: 'group-1', name: 'Quantum Physics Crew', subject: 'Quantum Computing', members: ['Archana', 'Lavanya', 'Dhivya Prabha'] },
        { id: 'group-2', name: 'Algorithms & Data Structures', subject: 'Computer Science', members: ['Maithraye', 'Gopika'] },
        { id: 'group-3', name: 'History Buffs', subject: 'History', members: ['Anika (You)', 'Peter', 'Mind Mate AI'] },
    ];
    const initialNotes: SharedNote[] = [
        { id: 'note-1', groupId: 'group-1', topicName: 'Introduction to Quantum Computing', author: 'Lavanya', content: "Don't forget to review the double-slit experiment. It's key to understanding superposition!", createdAt: new Date().toISOString() },
        { id: 'note-2', groupId: 'group-1', topicName: 'Qubits, Superposition, and Entanglement', author: 'Dhivya Prabha', content: "Found a great visualization for entanglement: https://example.com", createdAt: new Date().toISOString() },
    ];
    const initialFlashcards: Flashcard[] = [
        { id: 'fc-1', groupId: 'group-1', topicName: 'Qubits, Superposition, and Entanglement', author: 'Archana', front: 'What is a Qubit?', back: 'A basic unit of quantum information, the quantum analogue of a classical bit.' },
        { id: 'fc-2', groupId: 'group-1', topicName: 'Qubits, Superposition, and Entanglement', author: 'Lavanya', front: 'What is a superposition?', back: 'The ability of a quantum system to be in multiple states at the same time until it is measured.' },
    ];
    const initialScores: TopicScore[] = [
        { userId: 'user-1', groupId: 'group-1', topicName: 'Qubits, Superposition, and Entanglement', score: 1 },
        { userId: 'user-2', groupId: 'group-1', topicName: 'Qubits, Superposition, and Entanglement', score: 2 },
        { userId: 'user-3', groupId: 'group-1', topicName: 'Qubits, Superposition, and Entanglement', score: 1 },
        { userId: 'user-1', groupId: 'group-1', topicName: 'Introduction to Quantum Computing', score: 2 },
    ];
    const initialInvitations: Invitation[] = [
        { id: 'inv-1', groupId: 'group-2', groupName: 'Algorithms & Data Structures', fromUserName: 'Maithraye', toUserId: 'user-5', status: 'pending' },
    ];
    return { initialUsers, initialGroups, initialNotes, initialFlashcards, initialScores, initialInvitations };
};


const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.Syllabus);
  const [currentView, setCurrentView] = useState<AppView>(AppView.StudyPlan);
  const [syllabusText, setSyllabusText] = useState<string>('');
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userPreferences, setUserPreferences] = useState<Preferences | null>(null);
  const [showLanding, setShowLanding] = useState(true);

  // --- Mock Database State ---
  const [users, setUsers] = useState<User[]>(() => initializeMockData().initialUsers);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>(() => initializeMockData().initialGroups);
  const [sharedNotes, setSharedNotes] = useState<SharedNote[]>(() => initializeMockData().initialNotes);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => initializeMockData().initialFlashcards);
  const [topicScores, setTopicScores] = useState<TopicScore[]>(() => initializeMockData().initialScores);
  const [invitations, setInvitations] = useState<Invitation[]>(() => initializeMockData().initialInvitations);
  
  // --- UI State ---
  const [isInvitePopoverOpen, setIsInvitePopoverOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Gamification: Streak
  const [streakDays, setStreakDays] = useState(12); // Mocked start streak
  
  // Session management
  useEffect(() => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (loggedInUserId) {
      const user = users.find(u => u.id === loggedInUserId);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        setCurrentUser(userWithoutPassword);
        setShowLanding(false); // Skip landing if logged in
      }
    }
    setAuthLoading(false);
  }, [users]);


  const handleSyllabusSubmit = (text: string) => {
    setSyllabusText(text);
    setAppState(AppState.Preferences);
  };

  const handlePreferencesSubmit = async (preferences: Preferences) => {
    if (!currentUser) {
        setError("You must be logged in to generate a plan.");
        return;
    }
    setUserPreferences(preferences);
    setAppState(AppState.Generating);
    setError(null);
    try {
      const planData = await generateStudyPlan(syllabusText, preferences);
      const newPlan: StudyPlan = {
          ...planData,
          id: `plan-${Date.now()}`,
          userId: currentUser.id,
          completedTopics: [],
      };
      setStudyPlan(newPlan);
      setAppState(AppState.Plan);
    } catch (err) {
      console.error(err);
      setError('Failed to generate study plan. Please check your input or try again later.');
      setAppState(AppState.Preferences);
    }
  };
  
  const handleToggleTopicComplete = (topicName: string) => {
      setStudyPlan(prev => {
          if (!prev) return null;
          const completed = prev.completedTopics.includes(topicName);
          const newCompleted = completed
              ? prev.completedTopics.filter(t => t !== topicName)
              : [...prev.completedTopics, topicName];
          return { ...prev, completedTopics: newCompleted };
      });
  };

  const handleReset = () => {
    setSyllabusText('');
    setStudyPlan(null);
    setUserPreferences(null);
    setError(null);
    setAppState(AppState.Syllabus);
    setCurrentView(AppView.StudyPlan);
  };
  
  const handleAddNote = (topicName: string, content: string) => {
    if (!currentUser || currentUser.groups.length === 0) return;
    const newNote: SharedNote = {
        id: `note-${Date.now()}`,
        groupId: currentUser.groups[0], // Assume note is for the first group
        topicName,
        content,
        author: currentUser.name,
        createdAt: new Date().toISOString(),
    };
    setSharedNotes(prev => [newNote, ...prev]);
  };

  const handleAddFlashcard = (topicName: string, front: string, back: string) => {
      if (!currentUser || currentUser.groups.length === 0) return;
      const newFlashcard: Flashcard = {
          id: `fc-${Date.now()}`,
          groupId: currentUser.groups[0], // Assume flashcard is for the first group
          topicName,
          front,
          back,
          author: currentUser.name,
      };
      setFlashcards(prev => [newFlashcard, ...prev]);
  };

  const handleCreateGroup = (name: string, subject: string) => {
    if (!currentUser) return;
    const newGroup: StudyGroup = {
      id: `group-${Date.now()}`,
      name,
      subject,
      members: [currentUser.name],
    };
    setStudyGroups(prev => [...prev, newGroup]);
    setCurrentUser(prev => ({
      ...prev!,
      groups: [...prev!.groups, newGroup.id]
    }));
  };
  
  const handleJoinGroup = (groupId: string) => {
      if (!currentUser || currentUser.groups.includes(groupId)) return;
      
      // Add user to group
      setStudyGroups(prev => prev.map(g => {
          if (g.id === groupId) {
              return { ...g, members: [...g.members, currentUser.name] };
          }
          return g;
      }));

      // Add group to user
      setCurrentUser(prev => ({
          ...prev!,
          groups: [...prev!.groups, groupId]
      }));
  };

  const handleLeaveGroup = (groupId: string) => {
    if (!currentUser) return;

    setStudyGroups(prev => prev.map(g => {
        if (g.id === groupId) {
            return { ...g, members: g.members.filter(name => name !== currentUser.name) };
        }
        return g;
    }).filter(g => g.members.length > 0)); 

    setCurrentUser(prev => ({
        ...prev!,
        groups: prev!.groups.filter(id => id !== groupId)
    }));
  };

  const handleSendInvitation = (toUserId: string, groupId: string) => {
      if (!currentUser) return;
      const group = studyGroups.find(g => g.id === groupId);
      if (!group) return;
      
      const newInvitation: Invitation = {
          id: `inv-${Date.now()}`,
          groupId,
          groupName: group.name,
          fromUserName: currentUser.name,
          toUserId,
          status: 'pending',
      };
      setInvitations(prev => [...prev, newInvitation]);
      alert("Invitation sent!");
  };

  const handleAcceptInvitation = (invitationId: string) => {
      const invitation = invitations.find(i => i.id === invitationId);
      if (!invitation || !currentUser) return;

      handleJoinGroup(invitation.groupId);
      setInvitations(prev => prev.map(i => i.id === invitationId ? { ...i, status: 'accepted' } : i));
  };
  
  const handleDeclineInvitation = (invitationId: string) => {
      setInvitations(prev => prev.map(i => i.id === invitationId ? { ...i, status: 'declined' } : i));
  };


  const handleAnswerQuestion = (groupId: string, topicName: string, isCorrect: boolean) => {
    if (!currentUser || !isCorrect) return;

    setTopicScores(prevScores => {
        const userScoreIndex = prevScores.findIndex(s => s.userId === currentUser.id && s.groupId === groupId && s.topicName === topicName);
        if (userScoreIndex > -1) {
            const updatedScores = [...prevScores];
            updatedScores[userScoreIndex] = { ...updatedScores[userScoreIndex], score: updatedScores[userScoreIndex].score + 1 };
            return updatedScores;
        } else {
            return [ ...prevScores, { userId: currentUser.id, groupId, topicName, score: 1 } ];
        }
    });
  };

  // --- Auth Handlers ---
  const handleSignUp = (name: string, email: string, password_raw: string): Promise<void> => {
      return new Promise((resolve, reject) => {
          if (users.some(u => u.email === email)) {
              reject(new Error("An account with this email already exists."));
              return;
          }
          const newUser: User = { id: `user-${Date.now()}`, name, email, password: password_raw, groups: [] };
          setUsers(prev => [...prev, newUser]);
          const { password, ...userForState } = newUser;
          setCurrentUser(userForState);
          localStorage.setItem('loggedInUserId', newUser.id);
          resolve();
      });
  };

  const handleLogin = (email: string, password_raw: string): Promise<void> => {
      return new Promise((resolve, reject) => {
          const user = users.find(u => u.email === email && u.password === password_raw);
          if (user) {
              const { password, ...userForState } = user;
              setCurrentUser(userForState);
              localStorage.setItem('loggedInUserId', user.id);
              resolve();
          } else {
              reject(new Error("Invalid email or password."));
          }
      });
  };

  const handleLogout = () => {
      setCurrentUser(null);
      localStorage.removeItem('loggedInUserId');
      handleReset(); // Also reset plan state on logout
      setShowLanding(true); // Go back to landing page
  };

  const handleUpdateUserName = (newName: string) => {
    if (!currentUser) return;

    const oldName = currentUser.name;
    const updatedUser = { ...currentUser, name: newName };
    
    // Update current user state
    setCurrentUser(updatedUser);

    // Update user in the main users list
    setUsers(prevUsers => prevUsers.map(u => u.id === currentUser.id ? { ...u, name: newName } : u));
    
    // Update user's name in all their groups
    setStudyGroups(prevGroups => prevGroups.map(g => {
        if (g.members.includes(oldName)) {
            return {
                ...g,
                members: g.members.map(m => m === oldName ? newName : m)
            };
        }
        return g;
    }));
  };

  const renderStudyPlanContent = () => {
    switch (appState) {
      case AppState.Syllabus:
        return <SyllabusUploadStep onSubmit={handleSyllabusSubmit} />;
      case AppState.Preferences:
        return <PreferencesStep onSubmit={handlePreferencesSubmit} onBack={() => setAppState(AppState.Syllabus)} error={error} />;
      case AppState.Generating:
        return <Loader message="Our AI is crafting your personalized study plan... This may take a moment." />;
      case AppState.Plan:
        return studyPlan && currentUser ? <StudyPlanView 
            plan={studyPlan} 
            syllabusText={syllabusText}
            onReset={handleReset} 
            user={currentUser}
            users={users}
            allGroups={studyGroups}
            groups={studyGroups.filter(g => currentUser.groups.includes(g.id))}
            notes={sharedNotes}
            flashcards={flashcards}
            topicScores={topicScores}
            onAddNote={handleAddNote}
            onAddFlashcard={handleAddFlashcard}
            onCreateGroup={handleCreateGroup}
            onJoinGroup={handleJoinGroup}
            onLeaveGroup={handleLeaveGroup}
            onAnswerQuestion={handleAnswerQuestion}
            onToggleTopicComplete={handleToggleTopicComplete}
            onSendInvitation={handleSendInvitation}
            /> : null;
      default:
        return null;
    }
  };

  const renderAppContent = () => {
      switch(currentView) {
          case AppView.StudyPlan: return renderStudyPlanContent();
          case AppView.FocusMonitor: return <FocusMonitorView onNavigate={setCurrentView} />;
          case AppView.GroupChat: return <GroupChatView />;
          case AppView.AmbientVoice: return <AmbientVoiceView 
              preferences={userPreferences} 
              plan={studyPlan} 
              userName={currentUser?.name || 'Student'} 
          />;
          case AppView.IntelligentTodo: return <IntelligentTodoView />;
          case AppView.WellbeingHub: return <WellbeingHubView />;
          case AppView.Gaming: return <GamingView />;
          case AppView.FeynmanBoard: return <FeynmanBoardView topics={studyPlan?.topics || []} />;
          case AppView.DebateArena: return <DebateArenaView topics={studyPlan?.topics || []} />; // Render DebateArenaView
          default: return renderStudyPlanContent();
      }
  }
  
  if (authLoading) {
      return <div className="min-h-screen flex items-center justify-center bg-stone-950"><Loader message="Loading your session..."/></div>
  }

  // --- Render Logic ---

  // 1. Landing Page
  if (!currentUser && showLanding) {
      return <LandingPage onGetStarted={() => setShowLanding(false)} onLogin={() => setShowLanding(false)} />;
  }

  // 2. Authentication Page (if not logged in and not on landing)
  if (!currentUser) {
      return (
        <div className="min-h-screen bg-stone-950 text-stone-200">
             <header className="bg-stone-900/90 backdrop-blur-sm shadow-md border-b border-stone-800 sticky top-0 z-30">
                <div className="container mx-auto px-6 py-3 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg text-white shadow-md">
                            <BookOpenIcon className="h-6 w-6" />
                        </div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-200">Mind Mate AI</h1>
                     </div>
                     <button onClick={() => setShowLanding(true)} className="text-sm text-stone-400 hover:text-amber-400 transition-colors">Back to Home</button>
                </div>
            </header>
            <main className="container mx-auto px-6 py-8">
                 <div className="max-w-md mx-auto">
                    <AuthPage onLogin={handleLogin} onSignUp={handleSignUp} />
                 </div>
            </main>
        </div>
      );
  }

  // 3. Main Application
  const pendingInvites = invitations.filter(i => i.toUserId === currentUser.id && i.status === 'pending');

  const NavLink: React.FC<{
      view: AppView;
      label: string;
      icon: React.FC<React.SVGProps<SVGSVGElement>>;
    }> = ({ view, label, icon: Icon }) => {
        const isActive = currentView === view;
        return (
            <button 
                onClick={() => setCurrentView(view)} 
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive 
                        ? 'bg-amber-500/10 text-amber-400 shadow-sm border border-amber-500/20' 
                        : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                }`}
            >
                <Icon className={`h-5 w-5 ${isActive ? 'text-amber-400' : 'text-stone-500'}`} />
                {label}
            </button>
        );
    };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 transition-colors duration-300">
      <header className="bg-stone-900/90 backdrop-blur-sm shadow-md border-b border-stone-800 sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg text-white shadow-md">
                    <BookOpenIcon className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-200 hidden md:block">Mind Mate AI</h1>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4">
                   {/* Streak Counter - Gamification */}
                   <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 rounded-full border border-stone-700" title={`${streakDays} Day Streak!`}>
                        <span className="text-lg">🔥</span>
                        <span className="text-sm font-bold text-orange-500">{streakDays}</span>
                   </div>

                   <div className="relative">
                     <button onClick={() => setIsInvitePopoverOpen(prev => !prev)} className="relative p-2 rounded-full hover:bg-stone-800 transition-colors">
                        <BellIcon className="h-5 w-5 text-stone-400" />
                        {pendingInvites.length > 0 && <span className="absolute top-0.5 right-0.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-stone-900" />}
                     </button>
                     {isInvitePopoverOpen && (
                        <div className="absolute right-0 mt-2 w-72 bg-stone-900 rounded-lg shadow-xl border border-stone-700 animate-fade-in z-40">
                          <div className="p-3 border-b border-stone-700 bg-stone-800 rounded-t-lg">
                            <h3 className="font-semibold text-sm text-stone-200">Group Invitations</h3>
                          </div>
                          {pendingInvites.length > 0 ? (
                            <ul className="py-1 max-h-64 overflow-y-auto">
                              {pendingInvites.map(invite => (
                                <li key={invite.id} className="p-3 text-sm hover:bg-stone-800 border-b border-stone-800 last:border-0">
                                  <p className="text-stone-400">
                                    <span className="font-semibold text-stone-200">{invite.fromUserName}</span> invited you to join <span className="font-semibold text-stone-200">{invite.groupName}</span>.
                                  </p>
                                  <div className="flex items-center justify-end gap-2 mt-2">
                                    <button onClick={() => { handleDeclineInvitation(invite.id); setIsInvitePopoverOpen(false); }} className="px-2 py-1 bg-stone-700 text-stone-300 text-xs font-semibold rounded hover:bg-stone-600">Decline</button>
                                    <button onClick={() => { handleAcceptInvitation(invite.id); setIsInvitePopoverOpen(false); }} className="px-2 py-1 bg-amber-600 text-white text-xs font-semibold rounded hover:bg-amber-700">Accept</button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-stone-500 p-4 text-center">No pending invitations.</p>
                          )}
                        </div>
                     )}
                   </div>
                  <div className="h-6 w-px bg-stone-800 hidden sm:block" />
                  <button onClick={() => setIsProfileModalOpen(true)} className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-stone-800 transition-colors group">
                    <UserIcon className="h-5 w-5 text-stone-400 group-hover:text-amber-400" />
                    <span className="font-medium text-stone-300 hidden sm:inline">{currentUser.name}</span>
                  </button>
                  <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 bg-stone-800 text-stone-400 text-sm font-semibold rounded-md hover:bg-stone-700 hover:text-stone-200 transition-colors" title="Logout">
                      <LogOutIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
            </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64 lg:flex-shrink-0 py-8">
                <div className="bg-stone-900 rounded-xl shadow-md border border-stone-800 p-4 sticky top-24">
                    <nav className="space-y-2">
                    <NavLink view={AppView.StudyPlan} label="Study Plan" icon={LayoutDashboardIcon} />
                    <NavLink view={AppView.FeynmanBoard} label="Feynman Board" icon={PresentationIcon} />
                    <NavLink view={AppView.DebateArena} label="Debate Arena" icon={SwordsIcon} />
                    <NavLink view={AppView.IntelligentTodo} label="Smart To-Do" icon={CheckSquareIcon} />
                    <NavLink view={AppView.FocusMonitor} label="Focus Monitor" icon={TargetIcon} />
                    <NavLink view={AppView.GroupChat} label="Group Chat" icon={MessageCircleIcon} />
                    <NavLink view={AppView.AmbientVoice} label="Ambient Coach" icon={MicIcon} />
                    <NavLink view={AppView.WellbeingHub} label="Wellbeing Hub" icon={WindIcon} />
                    <NavLink view={AppView.Gaming} label="Game Zone" icon={Gamepad2Icon} />
                    </nav>
                </div>
            </aside>
            <main className="flex-1 py-8">
                {renderAppContent()}
            </main>
        </div>
      </div>
      
      {isProfileModalOpen && (
        <ProfileModal 
            user={currentUser}
            userGroups={studyGroups.filter(g => currentUser.groups.includes(g.id))}
            onClose={() => setIsProfileModalOpen(false)}
            onUpdateUser={handleUpdateUserName}
        />
      )}
    </div>
  );
};

export default App;
