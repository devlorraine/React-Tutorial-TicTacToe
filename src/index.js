/*
* TODO:
* 1 - Bold current move in turn list.
* 2 - Highlight winning line when game is won.
* 3 - Detect stalemate and display message.
*/

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
      squares:  Array(9).fill(null),  //Current board state: array of nine elements 'X', 'O' or null.
      lastMove: null                  //Index (0-8) of last move made.
    }
  ]);
  const [stepNum, setStepNum]   = useState(0);      //Current turn of the game: stars at 0 and is incremented with each move.
  const [xNext, setXNext]       = useState(false);  //Boolean indicating whether 'X' or 'O' is the next player.
  const [wonBy, setWonBy]       = useState(null);   //'X' or 'O' if that player has won the game, otherwise null.
  const [orderAsc, setOrderAsc] = useState(true);   //Boolean indicating whether moves list should be displayed in ascneding or descending order.

  //Determine variables dependent on state variables.
  const current = history[stepNum];
  
  const winner = !wonBy ?
    calculateWinner(current.squares) :
    wonBy;

  const status = !winner ?
    `Next turn: ${xNext?'X.':'O.'}` :
    (winner==='D') ?
      `No win possible. :(` :
      `Winner: ${winner}!`;

  //Set state variable if new winner was detected.
  if(winner !== wonBy) {
    setWonBy(winner);
  }

  //Helper functions (need to be declared before they can be used.)
  const jumpTo = (step) => {
    console.log(
      `Jumping to step ${step}`,
      `\nSetting xNext to ${!(step%2===0)}`
    );
    setXNext(!(step%2===0));
    setStepNum(step);
    setWonBy(null);
  }

  const handleClick = (i) => {
    const historySlice    = history.slice(0, stepNum + 1);           //turn history up to current turn.
    const currentSquares  = [...historySlice[historySlice.length - 1].squares];   //Square configuration of current turn
    /*
    Note spread operator "..." makes copy of array data without copying array reference.
    currentSquares is thus a new object.
    */

    //If winner not already declared, and square is null (not filled).
    if(!(wonBy || currentSquares[i])) {
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

  //Create game info DOM elements.
  const gameInfo = (
    <div className="game-info">
      <div>{status}</div>
      <ol><button onClick={() => setOrderAsc(!orderAsc)}> Order by {orderAsc?"ascending.":"descending."}</button></ol>
      {
      orderAsc ?
        <ol start='0'>{moves}</ol> :
        <ol reversed start={moves.length - 1}>{moves.reverse()}</ol>
      }
    </div>
  );
  
  //Log turn number and history for debugging.
  console.log(
    `Current turn: ${stepNum}`,
    `\nGame won by: ${wonBy}`,
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
        {gameInfo}
    </div>
  );
}

/*
* Return 'X' or 'O' if that player wins, 'D' if game is stalemate, or null otherwise.
*/
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

  /*
  * Check if line [a, b, c] is won.
  * i.e. squares are not empty and are all the same character.
  */
  const lineIsWin = (a, b, c) => {
    return (squares[a]) && (squares[a] === squares[b]) && (squares[a] === squares[c])
  }

  /*
  * Check if line [a ,b c] can not be won by either player.
  * i.e. 'X' and 'O' both appear in line.
  */
  const lineIsDraw = (a, b, c) => {
    const xPresent = (squares[a] === 'X') || (squares[b] === 'X') || (squares[c] === 'X');
    const oPresent = (squares[a] === 'O') || (squares[b] === 'O') || (squares[c] === 'O');
    return (xPresent && oPresent);
  }

  /*
  * winChar is 'X' or 'O' if that char has won the game, or null otherwise. Null by default.
  * draw is TRUE if game can not be won by either player. TRUE by default.
  * Note that function does not catch all stalemate states. Needs revision.
  */
  const [winChar, draw] =  lines.reduce((result, line) => {
    const [a, b, c] = line;

    /*
    * If winner already found (winChar previously not null), retain previous result.
    * Otherwise check line and return 'X','O', or null.
    */
    const lineWon = result[0] ?
      result[0] :
      lineIsWin(a, b, c) ? 
        squares[a] :
        null;

    /*
    * If win already possible (stalemate previously FALSE), retain FALSE.
    * Otherwise check line and return TRUE or FALSE.
    */
    const lineDrawn = !result[1] ? false : lineIsDraw(a, b, c);

    return [lineWon, lineDrawn];
  }, [null, true]);

  return draw ? 'D' : winChar;
}

/*
* Helper function for debugging.
* Write history array to console, formatted for readability.
*/
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
