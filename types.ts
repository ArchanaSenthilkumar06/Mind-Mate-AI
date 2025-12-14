
export enum AppState {
  Syllabus = 'Syllabus',
  Preferences = 'Preferences',
  Generating = 'Generating',
  Plan = 'Plan',
}

export enum AppView {
    StudyPlan = 'StudyPlan',
    FocusMonitor = 'FocusMonitor',
    GroupChat = 'GroupChat',
    AmbientVoice = 'AmbientVoice',
    IntelligentTodo = 'IntelligentTodo',
    WellbeingHub = 'WellbeingHub',
    Gaming = 'Gaming',
    FeynmanBoard = 'FeynmanBoard',
    DebateArena = 'DebateArena',
}

export interface Preferences {
  studyFrequency: string;
  sessionLength: string;
  learningStyle: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface StudyTopic {
  topicName: string;
  description: string;
  subTopics: string[];
  youtubeLinks: { title: string; url: string; }[];
  quiz: QuizQuestion[];
}

export interface StudyScheduleItem {
  day: string;
  activities: string[];
}

export interface StudyPlan {
  id: string;
  userId: string;
  courseName: string;
  difficulty: string;
  topics: StudyTopic[];
  schedule: StudyScheduleItem[];
  completedTopics: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Should not be stored in frontend state long-term
  groups: string[];
}

export interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  members: string[];
}

export interface SharedNote {
  id: string;
  groupId: string;
  topicName: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface Flashcard {
  id:string;
  groupId: string;
  topicName: string;
  author: string;
  front: string;
  back: string;
}

export interface TopicScore {
    userId: string;
    groupId: string;
    topicName: string;
    score: number;
}

export interface Invitation {
    id: string;
    groupId: string;
    groupName: string;
    fromUserName: string;
    toUserId: string;
    status: 'pending' | 'accepted' | 'declined';
}

export interface ChatMessage {
    id: number;
    sender: string;
    text: string;
    isAI: boolean;
}

export interface TodoItem {
    id: number;
    text: string;
    isCompleted: boolean;
}

export interface MoodEntry {
    date: string;
    timestamp: number;
    mood: 'Happy' | 'Neutral' | 'Stressed';
    intensity: number;
    tags: string[];
}
