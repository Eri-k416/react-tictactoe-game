import { useState } from 'react';
import './App.css';
type TicTacType = null | "X" | "O"

// VISUALS
function Square({value, onSquareClick}: {value: TicTacType, onSquareClick: () => void}) {

  return (
    <>
      <button onClick={onSquareClick} className="border-[1.5px] flex aspect-square min-w-8 justify-center items-center">
        <strong>{value}</strong>
      </button>
    </>
  )
};

const squarePack = (squares: TicTacType[], onSquareClick: (i: number) => void) => 
  {
    const squaresPack: React.JSX.Element[] = [];

    for (let i = 0; i < 9; i++) {
      squaresPack.push(<Square key={i} value={squares[i]} onSquareClick={() => onSquareClick(i)}/>)
    }

    return squaresPack;
  }

// LOGIC
function calculateWinner(squares: TicTacType[]): TicTacType {
  const lines: number[][] = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
  ]

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];

    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
function Board({ xIsNext, squares, onPlay }: {xIsNext: boolean; squares: TicTacType[]; onPlay: (nextSquares: TicTacType[]) => void}) {

  function handleClick(i: number) {
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext? "X" : "O";
    onPlay(nextSquares);
  }

  const winner: TicTacType = calculateWinner(squares);
  let status: string;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <>
      <div className="grid grid-cols-3">
        {squarePack(squares, handleClick)}
      </div>
      <div className="status font-bold bg-indigo-500 rounded-full basis-30 text-white text-center"><span>{status}</span></div>
    </>
  )
}

export default function Game() {
  const [history, setHistory] = useState<TicTacType[][]>([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState<number>(0);
  const xIsNext: boolean = currentMove % 2 === 0;
  const currentSquares: TicTacType[] = history[currentMove];

  function handlePlay(nextSquares: TicTacType[]): void {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1)
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((_, move) => {
    let desc;
    if (move > 0) {desc = "Go to move #" + move} else {desc = "Go to game start"};

    return (
      <li className="mb-1" key={move}>
        <button className="font-bold bg-indigo-500 rounded-full basis-30 text-white text-center px-3 hover:bg-indigo-300" onClick={() => jumpTo(move)}>{desc}</button>
      </li>
    )
  })
  
  return (
    <div className='game margin-0 padding-0 box-border gap-2 aspect-video flex flex-wrap content-center justify-center align-middle items-start'>
      <div className='game-board margin-0 padding-0 box-border gap-2 aspect-video flex flex-wrap content-center justify-center align-middle items-start'>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className='game-info'>
        <ol>{moves}</ol>
      </div>
    </div>
  )
}



