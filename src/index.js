import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const Square = (props) => {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

const Board = (props) => {
  const renderSquare = (i) => {
    return (
      <Square
        value={props.squares[i]}
        onClick={() => props.onClick(i)}
      />
    );
  }

  return (
    <div>
      {
        [0, 1, 2].map(i => (
          <div className="board-row">
            {[0, 1, 2].map(j => renderSquare(3*i + j))}
          </div>
        ))
      }
    </div>
  );
}

const Game = () => {
  //Declare state variables with hooks.
  const [history, setHistory] = useState([
    {
      squares:  Array(9).fill(null),   //Current board state: array of nine elements 'X', 'O' or null.
      lastMove: null                  //Index (0-8) of last move made.
    }
  ]);
  const [stepNum, setStepNum] = useState(0);
  const [xNext, setXNext]     = useState(false);

  //Determine variables dependent on state variables.
  const current = history[stepNum];
  const winner  = calculateWinner(current.squares);
  const status  = winner ?
    `Winner: ${winner}!` :
    `Next turn: ${xNext?'X.':'O.'}`;

  //Helper functions (need to be declared before they can be used.)
  const jumpTo = (step) => {
    console.log(
      `Jumping to step ${step}`,
      `\nSetting xNext to ${!(step%2===0)}`
    );
    setXNext(!(step%2===0));
    setStepNum(step);
  }

  const handleClick = (i) => {
    const historySlice    = history.slice(0, stepNum + 1);           //turn history up to current turn.
    const currentSquares  = [...historySlice[historySlice.length - 1].squares];   //Square configuration of current turn
    /*
    Note spread operator "..." makes copy of array data without copying array reference.
    Current is thus a new object.
    */

    //If winner not declared, and square is null (not filled).
    if(!(calculateWinner(currentSquares) || currentSquares[i])) {
      //Set value of clicked square to current turn symbol.
      currentSquares[i] = xNext?'X':'O';

      //Updated history state with new turn.
      setHistory(historySlice.concat(
        {
          squares: currentSquares,
          lastMove: i
        }));

      //Increment stepnumber and current turn symbol.
      setXNext(!xNext);
      setStepNum(stepNum + 1);
    }

  }

  //Create moves list.
  //Map function automatically uses array index for second arg. First arg is irrelevant.
  const moves = history.map((turnObject, index) => {
    const player  = (index%2===0)?'X':'O';
    const row     = Math.floor(turnObject.lastMove/3);
    const col     = turnObject.lastMove%3;
    const desc    = index > 0 ?
      `Go to move #${index}: (${player}, ${row}, ${col})` :
      "Go to game start.";

    return (
      <li key={index}>
        <button onClick={() => jumpTo(index)}>{desc}</button>
      </li>
    );
  });
  
  //Log turn number and history for debugging.
  console.log(
    `Current turn: ${stepNum}`,
    `\nxNext: ${xNext}`
  );
  logHistory(history);

  return (
    <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
    </div>
  );
}

const calculateWinner = (squares) => {
  //All possible patterns to win.
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  //TODO: this can be changed to functional programming using an array.reduce function.
  //For each possible winning pattern.
  for(let i = 0; i<lines.length; i++) {
    //Let [a,b,c] be one winning pattern.
    const [a, b, c] = lines[i];

    //Check if pattern has been one (a, b, c all have same value.)
    //IF a is not null AND a=b AND a=c
    if(squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      //return value of winning player.
      return squares[a]
    }
  }
  
  return null
}

//Helper function for debugging.
const logHistory = (history) => { 
  const completeMessage = history.reduce((messageRows, turnObject, turnNum) => {
    const messageSquares = turnObject.squares.reduce((messageSquares, square) => {
      //Add symbol for each square to form row.
      return `${messageSquares}${square ? `${square},`:`_,`}`;

    }, "");
    //Add each row.
    return `${messageRows}Turn ${turnNum}:\t${messageSquares}\tLast move: ${turnObject.lastMove}\n`;

  }, "History:\n");

  console.log(completeMessage);
}
  
// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);
