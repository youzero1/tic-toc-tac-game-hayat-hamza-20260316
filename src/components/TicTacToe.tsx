'use client';

import { useState, useEffect, useCallback } from 'react';
import Scoreboard from './Scoreboard';

type Player = 'X' | 'O';
type Cell = Player | null;
type Board = Cell[];

interface ScoreData {
  xWins: number;
  oWins: number;
  draws: number;
}

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner(board: Board): { winner: Player | 'Draw' | null; line: number[] | null } {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, line: combo };
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { winner: 'Draw', line: null };
  }
  return { winner: null, line: null };
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player | 'Draw' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [scores, setScores] = useState<ScoreData>({ xWins: 0, oWins: 0, draws: 0 });
  const [scoresLoading, setScoresLoading] = useState(true);
  const [resultSaved, setResultSaved] = useState(false);

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch('/api/scores');
      if (res.ok) {
        const data: ScoreData = await res.json();
        setScores(data);
      }
    } catch {
      // ignore
    } finally {
      setScoresLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  const saveResult = useCallback(
    async (result: Player | 'Draw') => {
      if (resultSaved) return;
      setResultSaved(true);
      try {
        const res = await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ winner: result }),
        });
        if (res.ok) {
          const data: ScoreData = await res.json();
          setScores(data);
        }
      } catch {
        // ignore
      }
    },
    [resultSaved]
  );

  const handleCellClick = (index: number) => {
    if (board[index] || gameOver) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const { winner: w, line } = checkWinner(newBoard);
    if (w) {
      setWinner(w);
      setWinningLine(line);
      setGameOver(true);
      saveResult(w);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const handleRestart = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setGameOver(false);
    setWinner(null);
    setWinningLine(null);
    setResultSaved(false);
  };

  const getStatusClass = () => {
    if (winner === 'X') return 'status-card winner-x';
    if (winner === 'O') return 'status-card winner-o';
    if (winner === 'Draw') return 'status-card draw';
    if (currentPlayer === 'X') return 'status-card turn-x';
    return 'status-card turn-o';
  };

  const getStatusText = () => {
    if (winner === 'Draw') return "It's a Draw! 🤝";
    if (winner) return `Player ${winner} Wins! 🎉`;
    return `Player ${currentPlayer}'s Turn`;
  };

  const getCellClass = (index: number, value: Cell): string => {
    const classes: string[] = ['cell'];
    if (value === 'X') classes.push('x');
    if (value === 'O') classes.push('o');
    if (value) classes.push('filled');
    if (winningLine && winningLine.includes(index)) classes.push('winning');
    if (gameOver && !value) classes.push('disabled');
    return classes.join(' ');
  };

  return (
    <div className="container">
      <h1 className="title">Tic Tac Toe</h1>

      <div className={getStatusClass()}>
        {getStatusText()}
      </div>

      <div className="board">
        {board.map((cell, index) => (
          <button
            key={index}
            className={getCellClass(index, cell)}
            onClick={() => handleCellClick(index)}
            aria-label={`Cell ${index + 1}${cell ? `, filled with ${cell}` : ''}`}
          >
            {cell && <span className="cell-content">{cell}</span>}
          </button>
        ))}
      </div>

      <button className="btn-restart" onClick={handleRestart}>
        Restart Game
      </button>

      <Scoreboard scores={scores} loading={scoresLoading} />
    </div>
  );
}
