
import React from 'react';
import { Course } from '../types';
import { BookOpenIcon } from './icons/BookOpenIcon';

interface OnlineCoursesViewProps {
    courses: Course[];
    onSelectCourse: (course: Course) => void;
}

const OnlineCoursesView: React.FC<OnlineCoursesViewProps> = ({ courses, onSelectCourse }) => {
    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in min-h-screen">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-emerald-900/30 rounded-xl text-emerald-500">
                    <BookOpenIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-stone-100">Online Courses</h2>
                    <p className="text-stone-400">Expand your knowledge with interactive lessons.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <div key={course.id} className="group bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1">
                        {/* Course Thumbnail */}
                        <div className={`h-40 w-full ${course.thumbnailColor} relative`}>
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                            <div className="absolute bottom-4 left-4">
                                <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded">
                                    {course.totalLessons} Lessons
                                </span>
                            </div>
                        </div>
                        
                        <div className="p-5">
                            <h3 className="text-xl font-bold text-stone-200 mb-1 group-hover:text-emerald-400 transition-colors">{course.title}</h3>
                            <p className="text-sm text-stone-500 mb-4">Instructor: {course.instructor}</p>
                            
                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-stone-400 mb-1">
                                    <span>Progress</span>
                                    <span>{course.progress}%</span>
                                </div>
                                <div className="w-full bg-stone-800 rounded-full h-2">
                                    <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${course.progress}%` }}></div>
                                </div>
                            </div>

                            <button 
                                onClick={() => onSelectCourse(course)}
                                className="w-full py-2 bg-stone-800 hover:bg-emerald-600 hover:text-white text-stone-300 font-semibold rounded-lg transition-colors text-sm"
                            >
                                Continue Learning
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OnlineCoursesView;
