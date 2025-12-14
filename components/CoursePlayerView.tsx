
import React, { useState } from 'react';
import { Course, Lesson } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { PlayIcon } from './icons/PlayIcon';
import { CheckSquareIcon } from './icons/CheckSquareIcon';

interface CoursePlayerViewProps {
    course: Course;
    onBack: () => void;
}

const CoursePlayerView: React.FC<CoursePlayerViewProps> = ({ course, onBack }) => {
    const [activeLesson, setActiveLesson] = useState<Lesson>(course.lessons[0]);

    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in min-h-screen flex flex-col">
            <button onClick={onBack} className="flex items-center gap-2 text-stone-400 hover:text-white mb-6 transition-colors w-fit">
                <ChevronLeftIcon className="w-5 h-5" /> Back to Courses
            </button>

            <div className="flex flex-col lg:flex-row gap-8 flex-grow">
                {/* Main Player Area */}
                <div className="flex-grow">
                    <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative group border border-stone-800">
                        {/* Fake Video Player UI */}
                        <div className={`absolute inset-0 ${course.thumbnailColor} opacity-20`}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button className="w-20 h-20 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all transform hover:scale-110 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                                <PlayIcon className="w-8 h-8 text-white ml-1" />
                            </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                            <div className="flex items-center gap-4">
                                <button className="text-white hover:text-amber-500"><PlayIcon className="w-5 h-5" /></button>
                                <div className="h-1 bg-stone-600 flex-grow rounded-full overflow-hidden">
                                    <div className="h-full w-1/3 bg-amber-500"></div>
                                </div>
                                <span className="text-xs text-stone-300">04:20 / {activeLesson.duration}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h1 className="text-2xl font-bold text-stone-100">{activeLesson.title}</h1>
                        <p className="text-stone-400 mt-2">
                            In this lesson, we will explore the core concepts of {course.title}. 
                            Pay close attention to the examples provided by {course.instructor}.
                        </p>
                        <div className="mt-6 flex gap-4">
                            <button className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors">
                                Next Lesson
                            </button>
                            <button className="px-6 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium rounded-lg transition-colors">
                                Download Resources
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Lesson List */}
                <div className="w-full lg:w-80 bg-stone-950 border border-stone-800 rounded-xl p-4 h-fit">
                    <h3 className="font-bold text-stone-200 mb-4 px-2">Course Content</h3>
                    <div className="space-y-1">
                        {course.lessons.map((lesson, idx) => (
                            <button 
                                key={lesson.id} 
                                onClick={() => setActiveLesson(lesson)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                                    activeLesson.id === lesson.id 
                                        ? 'bg-amber-900/20 border border-amber-900/50' 
                                        : 'hover:bg-stone-900 border border-transparent'
                                }`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    activeLesson.id === lesson.id ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-500'
                                }`}>
                                    {lesson.completed ? <CheckSquareIcon className="w-3 h-3"/> : idx + 1}
                                </div>
                                <div className="flex-grow">
                                    <p className={`text-sm font-medium ${activeLesson.id === lesson.id ? 'text-amber-400' : 'text-stone-300'}`}>
                                        {lesson.title}
                                    </p>
                                    <p className="text-xs text-stone-500">{lesson.duration}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoursePlayerView;
