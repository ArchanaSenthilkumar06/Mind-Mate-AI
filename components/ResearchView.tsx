
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SearchIcon } from './icons/SearchIcon';
import { LinkIcon } from './icons/LinkIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface SearchSource {
    title: string;
    uri: string;
}

interface ResearchResult {
    text: string;
    sources: SearchSource[];
}

const ResearchView: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [result, setResult] = useState<ResearchResult | null>(null);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    
    // Auto-focus input on load
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        setResult(null);
        if (!searchHistory.includes(query)) {
            setSearchHistory(prev => [query, ...prev].slice(0, 5));
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Using gemini-3-pro-preview for best reasoning + search capabilities
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: query,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            });

            // Extract Sources from Grounding Metadata
            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            const sources: SearchSource[] = groundingChunks
                .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
                .map((chunk: any) => ({
                    title: chunk.web.title,
                    uri: chunk.web.uri
                }));

            // Deduplicate sources based on URI
            const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

            setResult({
                text: response.text || "I couldn't find a direct answer, but I've processed your request.",
                sources: uniqueSources
            });

        } catch (error) {
            console.error("Search error:", error);
            setResult({
                text: "I encountered an error while searching the knowledge base. Please try again.",
                sources: []
            });
        } finally {
            setIsSearching(false);
        }
    };

    const handleHistoryClick = (hist: string) => {
        setQuery(hist);
        // Optional: Auto-submit? Let's just fill it for now.
    };

    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in min-h-[80vh] flex flex-col">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-900/30 rounded-xl text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <SearchIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-stone-100">Deep Dive</h2>
                    <p className="text-stone-400">AI Research Assistant with real-time web access.</p>
                </div>
            </div>

            {/* Search Input Area */}
            <div className={`transition-all duration-500 ease-in-out ${result ? '' : 'flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full'}`}>
                
                <form onSubmit={handleSearch} className="relative w-full group">
                    <div className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-amber-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity ${isSearching ? 'animate-pulse' : ''}`}></div>
                    <div className="relative bg-stone-950 border border-stone-700 rounded-2xl flex items-center p-2 shadow-2xl">
                        <SearchIcon className={`w-6 h-6 ml-4 ${isSearching ? 'text-amber-500 animate-spin' : 'text-stone-500'}`} />
                        <input 
                            ref={inputRef}
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask anything... e.g., 'Latest discoveries in astrophysics'"
                            className="w-full bg-transparent border-none text-stone-200 text-lg p-4 focus:outline-none placeholder-stone-600"
                            disabled={isSearching}
                        />
                        <button 
                            type="submit" 
                            disabled={!query.trim() || isSearching}
                            className="bg-stone-800 hover:bg-stone-700 text-stone-200 p-3 rounded-xl transition-colors disabled:opacity-50"
                        >
                            <ChevronRightIcon className="w-6 h-6" />
                        </button>
                    </div>
                </form>

                {/* History Chips (Only show if no result yet or sticking to bottom) */}
                {!result && searchHistory.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2 justify-center animate-fade-in">
                        {searchHistory.map((hist, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => handleHistoryClick(hist)}
                                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-full text-sm text-stone-400 transition-colors flex items-center gap-2"
                            >
                                <span className="text-stone-600">↺</span> {hist}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Results Area */}
            {result && (
                <div className="mt-8 animate-slide-up space-y-8">
                    
                    {/* Main Answer */}
                    <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-amber-500"></div>
                        <div className="flex items-center gap-2 mb-4">
                            <SparklesIcon className="w-5 h-5 text-amber-500" />
                            <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">AI Generated Answer</span>
                        </div>
                        <div className="prose prose-invert prose-stone max-w-none">
                            <p className="text-stone-200 leading-relaxed whitespace-pre-wrap text-lg">
                                {result.text}
                            </p>
                        </div>
                    </div>

                    {/* Sources Grid */}
                    {result.sources.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-stone-300 mb-4 flex items-center gap-2">
                                <LinkIcon className="w-5 h-5 text-blue-400" /> Sources & Citations
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {result.sources.map((source, idx) => (
                                    <a 
                                        key={idx} 
                                        href={source.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="group block bg-stone-900 border border-stone-700 hover:border-blue-500/50 rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="text-xs text-stone-500 font-mono mb-1 truncate">
                                                    {new URL(source.uri).hostname.replace('www.', '')}
                                                </p>
                                                <h4 className="text-sm font-bold text-stone-200 group-hover:text-blue-400 transition-colors line-clamp-2">
                                                    {source.title}
                                                </h4>
                                            </div>
                                            <div className="bg-stone-800 p-2 rounded-lg group-hover:bg-blue-900/20 text-stone-500 group-hover:text-blue-400 transition-colors">
                                                <LinkIcon className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ResearchView;
