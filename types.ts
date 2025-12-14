
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
    StudentAnalytics = 'StudentAnalytics',
    TeacherDashboard = 'TeacherDashboard',
    ParentDashboard = 'ParentDashboard',
    // New Views
    MyProfile = 'MyProfile',
    OnlineCourses = 'OnlineCourses',
    CoursePlayer = 'CoursePlayer', // NEW
    Homework = 'Homework',
    DigitalLibrary = 'DigitalLibrary',
    OnlineExams = 'OnlineExams',
    ExamTaking = 'ExamTaking', // NEW
    LeaveManagement = 'LeaveManagement',
    Attendance = 'Attendance',
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
  password?: string; 
  groups: string[];
  role: 'student' | 'teacher' | 'parent';
  avatar?: string;
  bio?: string;
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
    date?: string; 
    color?: string; 
}

export interface MoodEntry {
    date: string;
    timestamp: number;
    mood: 'Happy' | 'Neutral' | 'Stressed';
    intensity: number;
    tags: string[];
}

export interface Exam {
    id: string;
    subject: string;
    date: string;
    time: string;
    location: string;
    color: string;
}

// --- NEW INTERFACES ---

export interface Lesson {
    id: string;
    title: string;
    duration: string;
    completed: boolean;
}

export interface Course {
    id: string;
    title: string;
    instructor: string;
    progress: number;
    totalLessons: number;
    thumbnailColor: string;
    lessons: Lesson[]; // Added lessons
}

export interface Assignment {
    id: string;
    subject: string;
    title: string;
    description: string;
    dueDate: string;
    status: 'Pending' | 'Completed' | 'Late';
    assignedBy: string;
}

export interface Book {
    id: string;
    title: string;
    author: string;
    coverColor: string;
    summary: string;
}

export interface LeaveRequest {
    id: string;
    studentId: string;
    studentName: string;
    reason: string;
    dates: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    parentName: string;
}

export interface ExamQuestion {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
}

export interface OnlineExamItem {
    id: string;
    title: string;
    subject: string;
    duration: string;
    status: 'Upcoming' | 'Active' | 'Completed';
    date: string;
    questions: ExamQuestion[]; // Added questions
}

export interface AttendanceRecord {
    id: string;
    date: string;
    status: 'Present' | 'Absent' | 'Late';
    remarks?: string;
}
