🧠 Mind Mate AI
The Proactive, Adaptive AI Learning Ecosystem
![alt text](https://img.shields.io/badge/React-19.0-blue.svg)

![alt text](https://img.shields.io/badge/Tailwind-3.4-cyan.svg)

![alt text](https://img.shields.io/badge/Google_Gemini-Powered-orange.svg)

![alt text](https://img.shields.io/badge/License-MIT-yellow.svg)
Mind Mate AI is not just another study app; it is a behavioral-science-backed learning companion designed to bridge the gap between academic pressure and student wellbeing. By leveraging the Google Gemini API, Mind Mate AI proactively intervenes when students are frustrated, automates the "busy work" of planning, and provides a safe, collaborative environment for mastery.
✨ Key Features
🎓 For Students (The Learning Lab)
AI Syllabus Architect: Upload a raw syllabus text/PDF and get a structured, multi-week study plan with curated YouTube resources and auto-generated quizzes.
Focus Monitor & Frustration Detection: A smart Pomodoro timer that uses behavioral patterns to detect when a student is stuck or frustrated, triggering a "Wellbeing Intervention."
The Feynman Board: Mastery evaluation tool where you "teach" the AI a concept. It grades you on simplicity and identifies your knowledge gaps.
Live Tutor (Voice API): Real-time, low-latency audio conversations using the Gemini Live API for a natural 1-on-1 tutoring experience.
Snap & Solve: Visual AI that solves math problems or explains complex diagrams from a single photo.
Memory Master: Uses mnemonics, memory palaces, and narrative chaining to help memorize lists and facts.
Career Compass: Analyzes your interests and performance to map out future career paths and "Day in the Life" simulations.
🍎 For Teachers (The Command Center)
Smart Grader: Paste student essays or answers to receive instant suggested scores and constructive, rubric-based feedback.
Class Analytics: Heatmaps of class mood, average focus hours, and real-time alerts for "at-risk" students.
Management Suite: Handle leave requests, track attendance, and assign interactive homework.
🏠 For Parents (The Insight Hub)
Wellbeing Oversight: Monitor your child's stress levels and sleep consistency without overstepping.
Homework Helper: Real-time visibility into deadlines and completion rates.
🛠 Tech Stack
Frontend: React 19 (ESM), Tailwind CSS (Theming engine)
AI Engine: Google Gemini API
gemini-3-pro-preview (Complex reasoning & Chat)
gemini-2.5-flash (Fast task execution & Vision)
gemini-2.5-flash-native-audio (Live Voice API)
veo-3.1-fast-generate (AI relaxation video generation)
State Management: React Hooks & Local Storage (Mock DB)
Speech: Web Speech API (Text-to-Speech) and Speech Recognition (Legacy Support)
🎨 Visual Identity & Theming
Mind Mate AI features a state-of-the-art Theming Engine allowing users to switch environments based on their mood or preference:
🌌 Cosmic Slate: Dark, high-contrast mode for deep focus.
☁️ Porcelain: Clean, light mode for day-time productivity.
🎀 Dreamhouse: High-energy, vibrant aesthetic.
🛡️ Hero Tech: Industrial, sleek "Avengers" inspired UI.
🚀 Getting Started
Prerequisites
Node.js (Latest LTS)
A Google Gemini API Key (Get one here)
Installation
Clone the repository:
code
Bash
git clone https://github.com/yourusername/mind-mate-ai.git
cd mind-mate-ai
Set up environment variables:
Create a .env file in the root directory:
code
Env
API_KEY=your_gemini_api_key_here
Install dependencies:
code
Bash
npm install
Run the development server:
code
Bash
npm run dev
🧠 Behavioral Psychology Integration
Mind Mate AI implements several psychological frameworks:
Feynman Technique: Forcing students to simplify concepts to ensure true cognitive retention.
Method of Loci: Visualizing data in "Memory Palaces" for long-term storage.
Growth Mindset Nudges: AI "Ambient Coach" provides spontaneous affirmations to combat the "Inner Critic."
Pomodoro Technique: Time-boxed focus sessions with automated "Cognitive Breaks."
🤝 Contributing
We welcome contributions! Whether it's adding new AI prompts, improving the UX, or fixing bugs:
Fork the Project.
Create your Feature Branch (git checkout -b feature/AmazingFeature).
Commit your Changes (git commit -m 'Add some AmazingFeature').
Push to the Branch (git push origin feature/AmazingFeature).
Open a Pull Request.
📄 License
Distributed under the MIT License. See LICENSE for more information.
🌟 Acknowledgments
Google GenAI Team for the incredible Gemini SDK.
The EdTech community for insights into student mental health.
