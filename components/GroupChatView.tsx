import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { ChatMessage } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { SendIcon } from './icons/SendIcon';
import { GoogleGenAI, Chat } from "@google/genai";

const initialMessages: ChatMessage[] = [
    { id: 1, sender: 'Peter', text: "I'm having trouble with the 'Estates-General' part of the French Revolution.", isAI: false },
];

const GroupChatView: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const chatSessionRef = useRef<Chat | null>(null);

    useEffect(() => {
        // Initialize Gemini Chat Session with gemini-3-pro-preview
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatSessionRef.current = ai.chats.create({
            model: 'gemini-3-pro-preview',
            config: {
                systemInstruction: "You are Mind Mate AI, a helpful, friendly, and encouraging study companion in a student group chat. You are helping students (like Anika and Peter) study. Keep your answers concise, conversational, and easy to understand. If a user asks a question, answer it clearly. If they seem stuck, offer a hint or a quiz question. Context: The group is discussing history, specifically the French Revolution.",
            },
        });
    }, []);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        // 1. Add User Message to UI
        const userMessage: ChatMessage = {
            id: Date.now(),
            sender: 'Anika (You)',
            text: newMessage,
            isAI: false
        };
        setMessages(prev => [...prev, userMessage]);
        const msgToSend = newMessage;
        setNewMessage('');
        
        // 2. Set Loading State
        setIsAiTyping(true);

        try {
            // 3. Send to Gemini
            if (!chatSessionRef.current) {
                // Fallback initialization if useEffect hasn't run or ref is null
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                chatSessionRef.current = ai.chats.create({
                    model: 'gemini-3-pro-preview',
                });
            }

            const response = await chatSessionRef.current.sendMessage({ message: msgToSend });
            const aiText = response.text || "I'm thinking...";

            // 4. Add AI Response to UI
            const aiMessage: ChatMessage = {
                id: Date.now() + 1,
                sender: 'Mind Mate AI',
                text: aiText,
                isAI: true
            };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error("Error getting AI response:", error);
            const errorMessage: ChatMessage = {
                id: Date.now() + 1,
                sender: 'Mind Mate AI',
                text: "I'm having a little trouble connecting to my knowledge base right now. Could you try asking that again?",
                isAI: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsAiTyping(false);
        }
    };

    useEffect(() => {
        // Auto-scroll to the bottom
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isAiTyping]);

    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in">
            <h2 className="text-xl font-bold mb-4 text-stone-100">Group Chat: History Buffs 🗣️</h2>
            <div className="h-[60vh] flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 bg-stone-950 rounded-xl space-y-4 border border-stone-800">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'Anika (You)' ? 'justify-end' : 'justify-start'}`}>
                            {msg.isAI && <div className="p-1 bg-amber-900/30 rounded-full mb-1"><SparklesIcon className="w-5 h-5 text-amber-500 flex-shrink-0"/></div>}
                            <div className={`max-w-xs md:max-w-md p-3 rounded-lg text-sm ${
                                msg.sender === 'Anika (You)' ? 'chat-bubble-user' : msg.isAI ? 'chat-bubble-ai' : 'chat-bubble-other'
                            }`}>
                                <p className="font-bold mb-1 text-xs opacity-90">{msg.sender}</p>
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                     {isAiTyping && (
                        <div className="flex items-end gap-2 justify-start animate-fade-in">
                            <div className="p-1 bg-amber-900/30 rounded-full mb-1"><SparklesIcon className="w-5 h-5 text-amber-500 flex-shrink-0"/></div>
                            <div className="max-w-xs md:max-w-md p-3 rounded-lg text-sm chat-bubble-ai">
                               <p className="font-bold mb-1 text-xs opacity-90">Mind Mate AI</p>
                               <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 bg-amber-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                    <span className="h-2 w-2 bg-amber-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                    <span className="h-2 w-2 bg-amber-500 rounded-full animate-pulse"></span>
                               </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div className="mt-4 border-t border-stone-800 pt-4">
                   <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-grow w-full text-sm p-3 border rounded-xl bg-stone-800 border-stone-700 text-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder-stone-500 shadow-sm"
                            disabled={isAiTyping}
                        />
                        <button type="submit" className="p-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:bg-stone-700 shadow-md transition-colors" disabled={isAiTyping || !newMessage.trim()}>
                           <SendIcon className="w-5 h-5"/>
                        </button>
                   </form>
                </div>
            </div>
        </div>
    );
};

export default GroupChatView;