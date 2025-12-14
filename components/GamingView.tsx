import React, { useState, useEffect, useCallback } from 'react';

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

// --- Pure helper functions for the game logic ---

const getEmptyCells = (grid: number[][]): [number, number][] => {
    const emptyCells: [number, number][] = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (grid[r][c] === 0) {
                emptyCells.push([r, c]);
            }
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
            i++; // Skip the next tile because it has been merged
        } else {
            newRow.push(filteredRow[i]);
        }
    }

    while (newRow.length < 4) {
        newRow.push(0);
    }
    return [newRow, scoreToAdd];
};


const GamingView: React.FC = () => {
    const [grid, setGrid] = useState<number[][]>([]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

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

    const resetGame = useCallback(() => {
        let newGrid = Array(4).fill(null).map(() => Array(4).fill(0));
        newGrid = addRandomTile(newGrid);
        newGrid = addRandomTile(newGrid);
        setGrid(newGrid);
        setScore(0);
        setGameOver(false);
    }, [addRandomTile]);
    
    useEffect(() => {
        resetGame();
    }, [resetGame]);
    
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (gameOver) return;
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

        e.preventDefault();

        let moved = false;
        let newGrid = grid.map(row => [...row]);
        let currentScore = score;
        
        let rotations = 0;
        if (e.key === 'ArrowLeft') rotations = 0;
        if (e.key === 'ArrowUp') rotations = 1;
        if (e.key === 'ArrowRight') rotations = 2;
        if (e.key === 'ArrowDown') rotations = 3;

        // Rotate grid to treat every move as a 'left' slide
        for(let i=0; i < rotations; i++) {
            newGrid = rotateGrid(newGrid);
        }

        // Slide and merge each row
        for (let r = 0; r < 4; r++) {
            const [newRow, scoreToAdd] = slideAndMergeRow(newGrid[r]);
            if (JSON.stringify(newGrid[r]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            currentScore += scoreToAdd;
            newGrid[r] = newRow;
        }

        // Rotate back to original orientation
        const reverseRotations = (4 - rotations) % 4;
        for(let i=0; i < reverseRotations; i++) {
            newGrid = rotateGrid(newGrid);
        }

        if (moved) {
            const gridWithNewTile = addRandomTile(newGrid);
            setGrid(gridWithNewTile);
            setScore(currentScore);
            if (isGameOverCheck(gridWithNewTile)) {
                setGameOver(true);
            }
        }
    }, [grid, score, gameOver, addRandomTile]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);


    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl animate-fade-in">
            <h2 className="text-2xl font-bold mb-2 text-stone-100">Game Zone 🎮</h2>
            <p className="text-stone-400 mb-6">
                Take a break and play a game of 2048! Use your arrow keys to move the tiles.
            </p>

            <div className="flex flex-col items-center">
                <div className="flex justify-between items-center w-full max-w-sm mb-4">
                    <div className="bg-stone-800 p-3 rounded-lg text-center border border-stone-700 shadow-sm">
                        <div className="text-sm font-bold text-stone-500">SCORE</div>
                        <div className="text-2xl font-bold text-amber-500">{score}</div>
                    </div>
                    <button onClick={resetGame} className="px-4 py-2 font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 shadow-md">
                        New Game
                    </button>
                </div>

                <div className="relative bg-stone-600 border border-stone-500 p-2 rounded-lg w-full max-w-sm aspect-square grid grid-cols-4 grid-rows-4 gap-2 shadow-inner">
                    {grid.map((row, r) =>
                        row.map((val, c) => (
                            <div key={`${r}-${c}`} className={`flex items-center justify-center rounded-md text-2xl sm:text-3xl font-bold transition-all duration-200 ${TILE_COLORS[val] || 'bg-stone-400'}`}>
                                {val > 0 && <span>{val}</span>}
                            </div>
                        ))
                    )}
                    {gameOver && (
                        <div className="absolute inset-0 bg-stone-900/90 flex flex-col items-center justify-center rounded-lg animate-fade-in">
                            <p className="text-4xl font-bold text-stone-200">Game Over!</p>
                            <button onClick={resetGame} className="mt-4 px-4 py-2 font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 shadow-md">
                                Play Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GamingView;