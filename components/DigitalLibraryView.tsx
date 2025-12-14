
import React, { useState } from 'react';
import { Book } from '../types';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import Loader from './Loader';

interface DigitalLibraryViewProps {
    books: Book[];
}

const DigitalLibraryView: React.FC<DigitalLibraryViewProps> = ({ books }) => {
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [isVisualizing, setIsVisualizing] = useState(false);
    const [visualContent, setVisualContent] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const handleBookClick = (book: Book) => {
        setSelectedBook(book);
        setIsVisualizing(true);
        setVisualContent(null);
        setIsSpeaking(false);
        window.speechSynthesis.cancel();

        // Simulate AI Generation
        setTimeout(() => {
            setIsVisualizing(false);
            setVisualContent("AI has generated a visual summary of this book. Imagine a vivid scene: " + book.summary);
        }, 1500);
    };

    const closeModal = () => {
        setSelectedBook(null);
        setVisualContent(null);
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    const toggleSpeech = () => {
        if (!selectedBook) return;

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            const utterance = new SpeechSynthesisUtterance(`${selectedBook.title}, by ${selectedBook.author}. ${selectedBook.summary}`);
            utterance.rate = 0.9;
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    };

    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in min-h-screen">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-pink-900/30 rounded-xl text-pink-500">
                    <BookOpenIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-stone-100">Digital Library</h2>
                    <p className="text-stone-400">Touch a book to visualize its magic! ✨</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {books.map(book => (
                    <div 
                        key={book.id} 
                        onClick={() => handleBookClick(book)}
                        className={`cursor-pointer group relative perspective-1000`}
                    >
                        <div className={`h-64 w-full rounded-r-lg rounded-l-sm shadow-md transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-xl ${book.coverColor} flex flex-col p-4 border-l-4 border-l-white/20`}>
                            <h3 className="text-white font-bold font-serif text-lg leading-tight mt-4">{book.title}</h3>
                            <p className="text-white/80 text-xs mt-2 italic">{book.author}</p>
                            <div className="mt-auto self-center opacity-50 group-hover:opacity-100 transition-opacity">
                                <SparklesIcon className="w-6 h-6 text-white animate-pulse" />
                            </div>
                        </div>
                        {/* Book Spine Effect */}
                        <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-r from-black/40 to-transparent rounded-l-sm"></div>
                    </div>
                ))}
            </div>

            {/* AI Visualization Modal */}
            {selectedBook && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={closeModal}>
                    <div className="bg-stone-900 border border-stone-700 w-full max-w-2xl rounded-2xl p-8 m-4 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button onClick={closeModal} className="absolute top-4 right-4 text-stone-500 hover:text-white">✕</button>
                        
                        <div className="flex flex-col items-center text-center">
                            {isVisualizing ? (
                                <div className="py-12">
                                    <Loader message={`Visualizing "${selectedBook.title}"...`} />
                                    <p className="text-pink-400 text-sm mt-4 animate-pulse">Generating characters... Building scenes...</p>
                                </div>
                            ) : (
                                <div className="animate-slide-up w-full">
                                    <div className="flex items-center justify-center gap-3 mb-6">
                                        <SparklesIcon className="w-8 h-8 text-pink-500" />
                                        <h2 className="text-2xl font-bold text-white">{selectedBook.title}</h2>
                                    </div>
                                    
                                    <div className="bg-stone-950 rounded-xl overflow-hidden border border-stone-800 mb-6 relative group">
                                        {/* Generated Visual */}
                                        <div className={`h-64 w-full ${selectedBook.coverColor} relative overflow-hidden`}>
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-950/90"></div>
                                            <div className="absolute inset-0 flex items-center justify-center p-8">
                                                <p className="text-white text-lg font-serif italic text-center drop-shadow-lg leading-relaxed">
                                                    "{visualContent}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button className="py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg transition-colors">
                                            Start Reading
                                        </button>
                                        <button 
                                            onClick={toggleSpeech}
                                            className={`py-3 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                                                isSpeaking ? 'bg-red-500 text-white animate-pulse' : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                                            }`}
                                        >
                                            {isSpeaking ? 'Stop Audio' : 'Listen to Audio'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DigitalLibraryView;
