'use client';

interface ScoreData {
  xWins: number;
  oWins: number;
  draws: number;
}

interface ScoreboardProps {
  scores: ScoreData;
  loading: boolean;
}

export default function Scoreboard({ scores, loading }: ScoreboardProps) {
  return (
    <div className="scoreboard">
      <p className="scoreboard-title">All-Time Scoreboard</p>
      {loading ? (
        <p className="loading">Loading scores...</p>
      ) : (
        <div className="scoreboard-grid">
          <div className="score-item x-wins">
            <span className="score-label">X Wins</span>
            <span className="score-value">{scores.xWins}</span>
          </div>
          <div className="score-item draws">
            <span className="score-label">Draws</span>
            <span className="score-value">{scores.draws}</span>
          </div>
          <div className="score-item o-wins">
            <span className="score-label">O Wins</span>
            <span className="score-value">{scores.oWins}</span>
          </div>
        </div>
      )}
    </div>
  );
}
