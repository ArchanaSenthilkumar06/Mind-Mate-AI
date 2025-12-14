
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { StudyTopic } from '../types';
import { SwordsIcon } from './icons/SwordsIcon';
import { SendIcon } from './icons/SendIcon';
import Loader from './Loader';

interface DebateArenaViewProps {
    topics: StudyTopic[];
}

interface Message {
    id: number;
    sender: 'User' | 'Opponent' | 'Judge';
    text: string;
}

interface DebateScore {
    winner: 'User' | 'AI' | 'Tie';
    logicScore: number;
    evidenceScore: number;
    persuasionScore: number;
    feedback: string;
}

const scoreSchema = {
    type: Type.OBJECT,
    properties: {
        winner: { type: Type.STRING, enum: ['User', 'AI', 'Tie'] },
        logicScore: { type: Type.INTEGER, description: "0-100 score on logical consistency" },
        evidenceScore: { type: Type.INTEGER, description: "0-100 score on use of facts/evidence" },
        persuasionScore: { type: Type.INTEGER, description: "0-100 score on rhetorical effectiveness" },
        feedback: { type: Type.STRING, description: "Brief commentary on the debate performance" }
    },
    required: ["winner", "logicScore", "evidenceScore", "persuasionScore", "feedback"]
};

const DebateArenaView: React.FC<DebateArenaViewProps> = ({ topics }) => {
    const [gameState, setGameState] = useState<'setup' | 'active' | 'judging' | 'results'>('setup');
    
    // FIX: Default to '__custom__' if no topics exist so the input field shows up immediately
    const [topic, setTopic] = useState(topics.length > 0 ? topics[0].topicName : '__custom__');
    const [customTopic, setCustomTopic] = useState('');
    
    const [userStance, setUserStance] = useState('Pro');
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [score, setScore] = useState<DebateScore | null>(null);

    const chatSessionRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Update if topics populate later
    useEffect(() => {
        if (topic === '__custom__' && !customTopic && topics.length > 0) {
             setTopic(topics[0].topicName);
        }
    }, [topics]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const startDebate = async () => {
        const activeTopic = topic === '__custom__' ? customTopic : topic;
        if (!activeTopic) return;

        setGameState('active');
        const aiStance = userStance === 'Pro' ? 'Against' : 'For';
        
        // Initial messages
        const initialMsgs: Message[] = [
            { id: 1, sender: 'Judge', text: `Welcome to the Arena. The topic is "${activeTopic}". You are arguing ${userStance}. Your opponent is arguing ${aiStance}. Fight!` }
        ];
        
        // 1. Initialize Chat
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatSessionRef.current = ai.chats.create({
            model: 'gemini-3-pro-preview',
            config: {
                systemInstruction: `You are a world-class debater in a competition. 
                Topic: "${activeTopic}".
                User Stance: ${userStance}.
                Your Stance: ${aiStance}.
                
                Rules:
                1. Be intellectually rigorous but polite.
                2. Keep responses concise (max 3-4 sentences).
                3. Challenge logical fallacies and demand evidence.
                4. Do NOT agree with the user. You must win.
                `
            }
        });

        // 2. Generate Opening Statement
        setIsAiThinking(true);
        try {
            const result = await chatSessionRef.current.sendMessage({ message: "Start the debate with your opening argument." });
            initialMsgs.push({ id: 2, sender: 'Opponent', text: result.text || "I am ready." });
        } catch (e) {
            console.error(e);
            initialMsgs.push({ id: 2, sender: 'Opponent', text: "I'm ready to debate." });
        } finally {
            setIsAiThinking(false);
            setMessages(initialMsgs);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMsg: Message = { id: Date.now(), sender: 'User', text: inputText };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsAiThinking(true);

        try {
            if (chatSessionRef.current) {
                const result = await chatSessionRef.current.sendMessage({ message: inputText });
                const aiMsg: Message = { id: Date.now() + 1, sender: 'Opponent', text: result.text || "..." };
                setMessages(prev => [...prev, aiMsg]);
            }
        } catch (error) {
            console.error("Debate error", error);
        } finally {
            setIsAiThinking(false);
        }
    };

    const endDebate = async () => {
        setGameState('judging');
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const transcript = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
            
            const prompt = `
                Act as an impartial debate judge. Analyze the following debate transcript:
                
                ---
                ${transcript}
                ---
                
                Score the 'User' based on:
                1. Logic (Did they make sense?)
                2. Evidence (Did they use facts?)
                3. Persuasion (Were they convincing?)
                
                Declare a winner ('User', 'AI', or 'Tie'). Provide brief feedback.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: scoreSchema
                }
            });

            const result = JSON.parse(response.text);
            setScore(result);
            setGameState('results');

        } catch (error) {
            console.error("Judging error", error);
            setGameState('active'); // Go back if error
            alert("The judge is out to lunch. Try again.");
        }
    };

    const reset = () => {
        setGameState('setup');
        setMessages([]);
        setScore(null);
    };

    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in min-h-[80vh] flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-900/30 rounded-lg text-red-500">
                    <SwordsIcon className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-stone-100">The Debate Arena</h2>
                    <p className="text-stone-400 text-sm">Challenge your understanding. Defend your ideas.</p>
                </div>
            </div>

            {/* SETUP STATE */}
            {gameState === 'setup' && (
                <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full space-y-8">
                    <div className="w-full space-y-4">
                        <label className="block text-sm font-medium text-stone-300">1. Choose your Battlefield (Topic)</label>
                        {topics.length > 0 && (
                            <select 
                                value={topic} 
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full p-4 bg-stone-800 border border-stone-700 rounded-xl text-stone-200 focus:ring-2 focus:ring-red-500 outline-none"
                            >
                                {topics.map(t => (
                                    <option key={t.topicName} value={t.topicName}>{t.topicName}</option>
                                ))}
                                <option value="__custom__">+ Custom Topic</option>
                            </select>
                        )}
                        {(topic === '__custom__' || topics.length === 0) && (
                            <input 
                                type="text"
                                value={customTopic}
                                onChange={(e) => setCustomTopic(e.target.value)}
                                placeholder="e.g., Is AI dangerous?"
                                className="w-full p-4 bg-stone-800 border border-stone-700 rounded-xl text-stone-200 focus:ring-2 focus:ring-red-500 outline-none"
                            />
                        )}
                    </div>

                    <div className="w-full space-y-4">
                        <label className="block text-sm font-medium text-stone-300">2. Choose your Stance</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setUserStance('Pro')}
                                className={`p-6 rounded-xl border-2 transition-all ${userStance === 'Pro' ? 'border-green-600 bg-green-900/20 text-green-400' : 'border-stone-700 bg-stone-800 text-stone-400 hover:border-stone-600'}`}
                            >
                                <span className="block text-2xl mb-2">👍</span>
                                <span className="font-bold">I Agree</span>
                                <span className="block text-xs opacity-70 mt-1">Defend the statement</span>
                            </button>
                            <button 
                                onClick={() => setUserStance('Against')}
                                className={`p-6 rounded-xl border-2 transition-all ${userStance === 'Against' ? 'border-red-600 bg-red-900/20 text-red-400' : 'border-stone-700 bg-stone-800 text-stone-400 hover:border-stone-600'}`}
                            >
                                <span className="block text-2xl mb-2">👎</span>
                                <span className="font-bold">I Disagree</span>
                                <span className="block text-xs opacity-70 mt-1">Challenge the statement</span>
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={startDebate}
                        disabled={(!topic || (topic === '__custom__' && !customTopic))}
                        className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <SwordsIcon className="w-5 h-5" /> Enter the Arena
                    </button>
                </div>
            )}

            {/* ACTIVE STATE */}
            {gameState === 'active' && (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin scrollbar-thumb-stone-700">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-xl text-sm ${
                                    msg.sender === 'User' 
                                        ? 'bg-stone-700 text-white rounded-br-none' 
                                        : msg.sender === 'Judge' 
                                            ? 'bg-stone-800 border border-stone-600 text-stone-400 text-center w-full max-w-full italic'
                                            : 'bg-red-900/20 border border-red-900/50 text-red-100 rounded-bl-none'
                                }`}>
                                    {msg.sender !== 'Judge' && <p className="text-xs font-bold mb-1 opacity-50 uppercase">{msg.sender === 'Opponent' ? 'The Challenger' : 'You'}</p>}
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isAiThinking && (
                            <div className="flex justify-start">
                                <div className="bg-red-900/10 border border-red-900/30 p-4 rounded-xl rounded-bl-none">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="border-t border-stone-800 pt-4">
                        <form onSubmit={handleSendMessage} className="flex gap-3">
                            <input 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Make your argument..."
                                className="flex-grow bg-stone-950 border border-stone-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-red-500 outline-none placeholder-stone-600"
                                autoFocus
                            />
                            <button 
                                type="submit" 
                                disabled={!inputText.trim() || isAiThinking}
                                className="p-4 bg-stone-800 text-white rounded-xl hover:bg-stone-700 disabled:opacity-50 transition-colors"
                            >
                                <SendIcon className="w-6 h-6" />
                            </button>
                        </form>
                        <div className="flex justify-between items-center mt-3">
                            <p className="text-xs text-stone-500">The AI Judge is watching...</p>
                            <button 
                                onClick={endDebate}
                                className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-wide px-3 py-1 rounded hover:bg-red-900/10 transition-colors"
                            >
                                End Debate & Score
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* JUDGING STATE */}
            {gameState === 'judging' && (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Loader message="The Judge is deliberating..." />
                </div>
            )}

            {/* RESULTS STATE */}
            {gameState === 'results' && score && (
                <div className="flex-1 animate-slide-up">
                    <div className="text-center mb-8">
                        <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-2">The Verdict</h3>
                        <h1 className={`text-5xl font-extrabold mb-4 ${
                            score.winner === 'User' ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600' : 
                            score.winner === 'AI' ? 'text-red-500' : 'text-stone-300'
                        }`}>
                            {score.winner === 'User' ? 'VICTORY' : score.winner === 'AI' ? 'DEFEAT' : 'DRAW'}
                        </h1>
                        <p className="text-stone-400 max-w-md mx-auto italic">"{score.feedback}"</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-center">
                            <div className="text-2xl font-bold text-blue-400 mb-1">{score.logicScore}</div>
                            <div className="text-xs text-stone-500 uppercase">Logic</div>
                        </div>
                        <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-center">
                            <div className="text-2xl font-bold text-amber-400 mb-1">{score.evidenceScore}</div>
                            <div className="text-xs text-stone-500 uppercase">Evidence</div>
                        </div>
                        <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-center">
                            <div className="text-2xl font-bold text-purple-400 mb-1">{score.persuasionScore}</div>
                            <div className="text-xs text-stone-500 uppercase">Rhetoric</div>
                        </div>
                    </div>

                    <button 
                        onClick={reset}
                        className="w-full py-4 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-xl transition-colors border border-stone-700"
                    >
                        Debate Again
                    </button>
                </div>
            )}
        </div>
    );
};

export default DebateArenaView;
