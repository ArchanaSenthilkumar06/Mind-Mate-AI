import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';

interface SyllabusUploadStepProps {
  onSubmit: (text: string) => void;
}

const SyllabusUploadStep: React.FC<SyllabusUploadStepProps> = ({ onSubmit }) => {
  const [text, setText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setText(e.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      setText(`Syllabus uploaded from "${file.name}".\n\n(Note: Automatic text extraction is only supported for .txt files in this demo. For other file types, the AI would process it on the backend.)`);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
    }
  };

  const handlePasteExample = () => {
    setFileName(null);
    setText(`
COURSE: Introduction to Quantum Computing (CS 101)
SEMESTER: Fall 2024

DESCRIPTION:
This course provides a gentle introduction to the fundamental concepts of quantum computing. We will explore qubits, superposition, and entanglement, and learn how they can be used to build quantum algorithms.

TOPICS:
- Week 1: Introduction to Quantum Mechanics & its relevance to computing.
- Week 2-3: Qubits, Superposition, and Entanglement. Quantum gates.
- Week 4: The Deutsch-Jozsa and Simon's algorithms.
- Week 5: Midterm Exam.
- Week 6-7: Shor's Factoring Algorithm.
- Week 8: Grover's Search Algorithm.
- Week 9: Introduction to Quantum Error Correction.
- Week 10: Final Project Presentations.
    `);
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-stone-900 rounded-2xl shadow-xl border border-stone-800 animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-stone-100">Create Your AI Study Plan</h2>
      <p className="mt-2 text-center text-stone-400">
        Upload, paste, or use our example syllabus to get started.
      </p>
      
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={onButtonClick}
          className={`relative w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${dragActive ? 'border-amber-500 bg-stone-800' : 'border-stone-700 hover:border-amber-500 hover:bg-stone-800'}`}>
          <input ref={inputRef} type="file" className="hidden" onChange={handleChange} accept=".txt,.pdf,.docx" />
          <svg className="w-10 h-10 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          <p className="mt-2 text-sm text-stone-400">
            <span className="font-semibold text-amber-500">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-stone-500">TXT, PDF, or DOCX</p>
          {fileName && <p className="mt-2 text-xs font-semibold text-green-500">{fileName} uploaded!</p>}
        </div>

        <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-stone-700" />
            </div>
            <div className="relative flex justify-center">
                <span className="bg-stone-900 px-2 text-sm text-stone-500">OR</span>
            </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setFileName(null); }}
          className="w-full h-48 p-4 border border-stone-700 bg-stone-800 text-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder-stone-500"
          placeholder="Paste syllabus text here..."
        />
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button type="button" onClick={handlePasteExample} className="text-sm text-amber-500 hover:text-amber-400 hover:underline">
                Use an example syllabus
            </button>
            <button 
                type="submit" 
                disabled={!text.trim()}
                className="w-full sm:w-auto px-8 py-3 font-semibold text-white bg-gradient-to-r from-amber-600 to-yellow-600 rounded-lg hover:from-amber-700 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
                Next: Set Preferences
            </button>
        </div>
      </form>
    </div>
  );
};

export default SyllabusUploadStep;