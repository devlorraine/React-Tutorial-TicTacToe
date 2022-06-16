import React from 'react';
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

class Game extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {
      //history array:
      history: [
        {squares: Array(9).fill(null)},
      ],
      stepNumber: 0,
      xNext: true,
    }
  }

  handleClick(i)
  {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length-1];
    const squares = current.squares.slice();

    //IF NOT (winner exists OR clicked square is already filled)
    //ie. if valid move, execute code
    if(!(calculateWinner(squares) || squares[i]))
    {
      squares[i] = this.state.xNext?'X':'O';
      this.setState({
        history: history.concat([{
          squares: squares
        }]),
        stepNumber: history.length,
        xNext: !this.state.xNext
      });
    }
  }

  jumpTo(step)
  {
    this.setState({
      stepNumber: step,
      xNext: (step % 2) ===0,
    });
  }

  render()
  {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move + '.' :
        'Go to game start.';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if(winner)
    {
      status = 'Winner: ' + winner + '!';
    }
    else
    {
      status = 'Next turn: ' + (this.state.xNext?'X.':'O.');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
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

  //For each possible winning pattern.
  for(let i = 0; i<lines.length; i++)
  {
    //Let [a,b,c] be one winning pattern.
    const [a, b, c] = lines[i];

    //Check if pattern has been one (a, b, c all have same value.)
    //IF a is not null AND a=b AND a=c
    if(squares[a] && squares[a] === squares[b] && squares[a] === squares[c])
    {
      //return value of winning player.
      return squares[a]
    }

  }

  return null;
}
  
// ========================================

console.log("These violent delights have violent ends.");

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);
