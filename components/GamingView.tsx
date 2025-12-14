
import React, { useState, useEffect, useCallback } from 'react';
import { Gamepad2Icon } from './icons/Gamepad2Icon';
import { TrophyIcon } from './icons/TrophyIcon';
import { TargetIcon } from './icons/TargetIcon';

// --- 2048 Logic Helpers ---
const TILE_COLORS: { [key: number]: string } = {
    0: 'bg-stone-700',
    2: 'bg-stone-200 text-stone-800',
    4: 'bg-amber-100 text-amber-900',
    8: 'bg-amber-200 text-amber-900',
    16: 'bg-orange-200 text-orange-900',
    32: 'bg-orange-300 text-white',
    64: 'bg-orange-500 text-white',
    128: 'bg-red-300 text-white',
    256: 'bg-red-500 text-white',
    512: 'bg-yellow-400 text-white',
    1024: 'bg-yellow-500 text-white',
    2048: 'bg-amber-500 text-white',
};

const getEmptyCells = (grid: number[][]): [number, number][] => {
    const emptyCells: [number, number][] = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (grid[r][c] === 0) emptyCells.push([r, c]);
        }
    }
    return emptyCells;
};

const isGameOverCheck = (grid: number[][]): boolean => {
    if (getEmptyCells(grid).length > 0) return false;
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            const val = grid[r][c];
            if (r < 3 && grid[r + 1][c] === val) return false;
            if (c < 3 && grid[r][c + 1] === val) return false;
        }
    }
    return true;
};

const rotateGrid = (grid: number[][]): number[][] => {
    const newGrid = Array(4).fill(null).map(() => Array(4).fill(0));
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            newGrid[c][3 - r] = grid[r][c];
        }
    }
    return newGrid;
};

const slideAndMergeRow = (row: number[]): [number[], number] => {
    const filteredRow = row.filter(val => val !== 0);
    const newRow: number[] = [];
    let scoreToAdd = 0;
    for (let i = 0; i < filteredRow.length; i++) {
        if (i < filteredRow.length - 1 && filteredRow[i] === filteredRow[i + 1]) {
            const newValue = filteredRow[i] * 2;
            newRow.push(newValue);
            scoreToAdd += newValue;
            i++;
        } else {
            newRow.push(filteredRow[i]);
        }
    }
    while (newRow.length < 4) newRow.push(0);
    return [newRow, scoreToAdd];
};

// --- Memory Match Logic Helpers ---
const MEMORY_EMOJIS = ['🧠', '⚡', '📚', '🎨', '🚀', '🌟', '🎮', '🧩'];
interface MemoryCard {
    id: number;
    emoji: string;
    isFlipped: boolean;
    isMatched: boolean;
}

// --- Component ---
const GamingView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'2048' | 'memory' | 'store'>('2048');

    // --- 2048 State ---
    const [grid, setGrid] = useState<number[][]>([]);
    const [score2048, setScore2048] = useState(0);
    const [gameOver2048, setGameOver2048] = useState(false);

    // --- Memory State ---
    const [cards, setCards] = useState<MemoryCard[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]); // Store indices
    const [movesMemory, setMovesMemory] = useState(0);
    const [gameOverMemory, setGameOverMemory] = useState(false);

    // --- 2048 Functions ---
    const addRandomTile = useCallback((currentGrid: number[][]): number[][] => {
        const emptyCells = getEmptyCells(currentGrid);
        if (emptyCells.length > 0) {
            const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const newGrid = currentGrid.map(row => [...row]);
            newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
            return newGrid;
        }
        return currentGrid;
    }, []);

    const reset2048 = useCallback(() => {
        let newGrid = Array(4).fill(null).map(() => Array(4).fill(0));
        newGrid = addRandomTile(newGrid);
        newGrid = addRandomTile(newGrid);
        setGrid(newGrid);
        setScore2048(0);
        setGameOver2048(false);
    }, [addRandomTile]);

    // Initial load for 2048
    useEffect(() => {
        reset2048();
    }, []); // eslint-disable-line

    const handleKeyDown2048 = useCallback((e: KeyboardEvent) => {
        if (activeTab !== '2048' || gameOver2048) return;
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

        e.preventDefault();
        let moved = false;
        let newGrid = grid.map(row => [...row]);
        let currentScore = score2048;
        let rotations = 0;

        if (e.key === 'ArrowLeft') rotations = 0;
        if (e.key === 'ArrowUp') rotations = 1;
        if (e.key === 'ArrowRight') rotations = 2;
        if (e.key === 'ArrowDown') rotations = 3;

        for(let i=0; i < rotations; i++) newGrid = rotateGrid(newGrid);

        for (let r = 0; r < 4; r++) {
            const [newRow, scoreToAdd] = slideAndMergeRow(newGrid[r]);
            if (JSON.stringify(newGrid[r]) !== JSON.stringify(newRow)) moved = true;
            currentScore += scoreToAdd;
            newGrid[r] = newRow;
        }

        const reverseRotations = (4 - rotations) % 4;
        for(let i=0; i < reverseRotations; i++) newGrid = rotateGrid(newGrid);

        if (moved) {
            const gridWithNewTile = addRandomTile(newGrid);
            setGrid(gridWithNewTile);
            setScore2048(currentScore);
            if (isGameOverCheck(gridWithNewTile)) setGameOver2048(true);
        }
    }, [grid, score2048, gameOver2048, addRandomTile, activeTab]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown2048);
        return () => window.removeEventListener('keydown', handleKeyDown2048);
    }, [handleKeyDown2048]);


    // --- Memory Game Functions ---
    const initializeMemoryGame = () => {
        const shuffled = [...MEMORY_EMOJIS, ...MEMORY_EMOJIS]
            .sort(() => Math.random() - 0.5)
            .map((emoji, index) => ({
                id: index,
                emoji,
                isFlipped: false,
                isMatched: false
            }));
        setCards(shuffled);
        setFlippedCards([]);
        setMovesMemory(0);
        setGameOverMemory(false);
    };

    const handleCardClick = (index: number) => {
        if (flippedCards.length >= 2 || cards[index].isFlipped || cards[index].isMatched) return;

        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);
        
        const newFlipped = [...flippedCards, index];
        setFlippedCards(newFlipped);

        if (newFlipped.length === 2) {
            setMovesMemory(prev => prev + 1);
            const [firstIndex, secondIndex] = newFlipped;
            if (cards[firstIndex].emoji === cards[secondIndex].emoji) {
                // Match!
                newCards[firstIndex].isMatched = true;
                newCards[secondIndex].isMatched = true;
                setCards(newCards);
                setFlippedCards([]);
                
                // Check Win
                if (newCards.every(c => c.isMatched)) {
                    setGameOverMemory(true);
                }
            } else {
                // No Match - Flip back after delay
                setTimeout(() => {
                    const resetCards = [...cards];
                    resetCards[firstIndex].isFlipped = false;
                    resetCards[secondIndex].isFlipped = false;
                    setCards(resetCards);
                    setFlippedCards([]);
                }, 1000);
            }
        }
    };

    // --- Game Store Data ---
    const GAMES = [
        { id: 1, name: 'Minecraft: Education', category: 'Creative', rating: 4.8, icon: '🧱', url: 'https://play.google.com/store/apps/details?id=com.mojang.minecraftpe' },
        { id: 2, name: 'Duolingo', category: 'Language', rating: 4.7, icon: '🦉', url: 'https://play.google.com/store/apps/details?id=com.duolingo' },
        { id: 3, name: 'Lumosity', category: 'Brain Training', rating: 4.5, icon: '🧠', url: 'https://play.google.com/store/apps/details?id=com.lumoslabs.lumosity' },
        { id: 4, name: 'Kahoot!', category: 'Quiz', rating: 4.6, icon: '🟣', url: 'https://play.google.com/store/apps/details?id=no.mobitroll.kahoot.android' },
        { id: 5, name: 'Chess.com', category: 'Strategy', rating: 4.8, icon: '♟️', url: 'https://play.google.com/store/apps/details?id=com.chess' },
        { id: 6, name: 'Khan Academy Kids', category: 'Learning', rating: 4.8, icon: '🐻', url: 'https://play.google.com/store/apps/details?id=org.khankids.android' },
        { id: 7, name: 'Forest', category: 'Focus', rating: 4.9, icon: '🌲', url: 'https://play.google.com/store/apps/details?id=cc.forestapp' },
        { id: 8, name: 'Wordscapes', category: 'Puzzle', rating: 4.6, icon: '🔠', url: 'https://play.google.com/store/apps/details?id=com.peoplefun.wordcross' },
    ];

    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in min-h-[80vh]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg text-white shadow-lg">
                        <Gamepad2Icon className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-stone-100">Game Zone</h2>
                        <p className="text-stone-400 text-sm">Relax, recharge, and train your brain.</p>
                    </div>
                </div>
                
                <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800">
                    <button 
                        onClick={() => setActiveTab('2048')}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === '2048' ? 'bg-stone-800 text-amber-500 shadow-sm' : 'text-stone-500 hover:text-stone-300'}`}
                    >
                        2048 Classic
                    </button>
                    <button 
                        onClick={() => { setActiveTab('memory'); if(cards.length === 0) initializeMemoryGame(); }}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'memory' ? 'bg-stone-800 text-purple-500 shadow-sm' : 'text-stone-500 hover:text-stone-300'}`}
                    >
                        Brain Match
                    </button>
                    <button 
                        onClick={() => setActiveTab('store')}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'store' ? 'bg-stone-800 text-green-500 shadow-sm' : 'text-stone-500 hover:text-stone-300'}`}
                    >
                        Game Library
                    </button>
                </div>
            </div>

            <div className="bg-stone-950/50 rounded-2xl border border-stone-800 p-4 md:p-8 min-h-[500px] flex justify-center items-start">
                
                {/* 2048 GAME TAB */}
                {activeTab === '2048' && (
                    <div className="flex flex-col items-center w-full max-w-md animate-fade-in">
                        <div className="flex justify-between items-center w-full mb-6">
                            <div className="bg-stone-800 px-4 py-2 rounded-lg text-center border border-stone-700">
                                <span className="block text-xs font-bold text-stone-500">SCORE</span>
                                <span className="text-2xl font-bold text-amber-500">{score2048}</span>
                            </div>
                            <button onClick={reset2048} className="px-4 py-2 font-bold text-stone-900 bg-amber-500 rounded-lg hover:bg-amber-400 shadow-lg transition-transform active:scale-95">
                                New Game
                            </button>
                        </div>

                        <div className="relative bg-stone-700 p-2 rounded-xl w-full aspect-square grid grid-cols-4 grid-rows-4 gap-2 shadow-inner border-4 border-stone-600">
                            {grid.map((row, r) =>
                                row.map((val, c) => (
                                    <div key={`${r}-${c}`} className={`flex items-center justify-center rounded-lg text-2xl md:text-4xl font-bold transition-all duration-200 transform hover:scale-[1.02] shadow-sm ${TILE_COLORS[val] || 'bg-stone-600'}`}>
                                        {val > 0 && val}
                                    </div>
                                ))
                            )}
                            {gameOver2048 && (
                                <div className="absolute inset-0 bg-stone-900/90 rounded-lg flex flex-col items-center justify-center z-10 backdrop-blur-sm animate-fade-in">
                                    <p className="text-5xl font-extrabold text-white mb-2">Game Over</p>
                                    <p className="text-stone-400 mb-6">Final Score: {score2048}</p>
                                    <button onClick={reset2048} className="px-8 py-3 font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 rounded-full hover:shadow-lg transition-all">
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                        <p className="mt-6 text-stone-500 text-sm text-center">Use <span className="font-bold text-stone-300">Arrow Keys</span> to merge matching numbers.</p>
                    </div>
                )}

                {/* MEMORY MATCH TAB */}
                {activeTab === 'memory' && (
                    <div className="flex flex-col items-center w-full max-w-2xl animate-fade-in">
                        <div className="flex justify-between items-center w-full mb-6">
                            <div className="flex gap-4">
                                <div className="bg-stone-800 px-4 py-2 rounded-lg text-center border border-stone-700">
                                    <span className="block text-xs font-bold text-stone-500">MOVES</span>
                                    <span className="text-2xl font-bold text-purple-500">{movesMemory}</span>
                                </div>
                            </div>
                            <button onClick={initializeMemoryGame} className="px-4 py-2 font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 shadow-lg transition-transform active:scale-95">
                                Restart
                            </button>
                        </div>

                        <div className="grid grid-cols-4 gap-3 md:gap-4 w-full aspect-square md:aspect-video relative">
                            {cards.map((card, index) => (
                                <button
                                    key={card.id}
                                    onClick={() => handleCardClick(index)}
                                    disabled={card.isFlipped || card.isMatched}
                                    className={`relative rounded-xl flex items-center justify-center text-4xl transition-all duration-300 transform ${
                                        card.isFlipped || card.isMatched 
                                            ? 'bg-stone-800 border-purple-500/50 border-2 rotate-y-180' 
                                            : 'bg-gradient-to-br from-stone-700 to-stone-800 border-stone-600 border hover:border-purple-400 hover:-translate-y-1'
                                    } h-20 md:h-28 shadow-md`}
                                >
                                    {(card.isFlipped || card.isMatched) ? card.emoji : <span className="text-2xl text-stone-600">?</span>}
                                </button>
                            ))}
                            
                            {gameOverMemory && (
                                <div className="absolute inset-0 bg-stone-900/90 rounded-xl flex flex-col items-center justify-center z-10 backdrop-blur-sm animate-fade-in">
                                    <TrophyIcon className="w-20 h-20 text-yellow-500 mb-4 animate-bounce" />
                                    <p className="text-4xl font-extrabold text-white mb-2">You Won!</p>
                                    <p className="text-stone-400 mb-6">Completed in {movesMemory} moves.</p>
                                    <button onClick={initializeMemoryGame} className="px-8 py-3 font-bold text-white bg-purple-600 rounded-full hover:shadow-lg hover:bg-purple-500 transition-all">
                                        Play Again
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* GAME LIBRARY / STORE TAB */}
                {activeTab === 'store' && (
                    <div className="w-full animate-fade-in">
                        <div className="flex items-center gap-2 mb-6">
                            <TargetIcon className="w-6 h-6 text-green-500" />
                            <h3 className="text-xl font-bold text-stone-200">Featured Educational Games</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {GAMES.map(game => (
                                <div key={game.id} className="bg-stone-900 border border-stone-800 p-4 rounded-xl flex flex-col hover:border-green-500/30 transition-all group">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-14 h-14 bg-stone-800 rounded-xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">
                                            {game.icon}
                                        </div>
                                        <span className="text-xs font-bold bg-stone-800 text-stone-400 px-2 py-1 rounded border border-stone-700">{game.rating} ★</span>
                                    </div>
                                    <h4 className="font-bold text-stone-200 text-lg mb-1">{game.name}</h4>
                                    <p className="text-xs text-stone-500 font-medium mb-4 uppercase tracking-wide">{game.category}</p>
                                    
                                    <div className="mt-auto pt-4 border-t border-stone-800">
                                        <a 
                                            href={game.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="block w-full py-2 bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white text-center rounded-lg font-bold text-sm transition-all border border-green-600/30 hover:border-green-600"
                                        >
                                            Get on Play Store
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-8 p-6 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-between gap-4">
                            <div>
                                <h4 className="font-bold text-stone-200">Looking for more?</h4>
                                <p className="text-stone-400 text-sm">Explore thousands of educational apps on Google Play.</p>
                            </div>
                            <a 
                                href="https://play.google.com/store/apps/category/GAME_EDUCATIONAL" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-lg transition-colors border border-stone-600"
                            >
                                Browse All Games
                            </a>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default GamingView;
