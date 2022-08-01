import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {
  let className = "square"
  if (props.winner) {
    className += " square-winner"
  }

  return (
    <button className={className} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

function Position(props) {
  if (props.step.position.x == null && props.step.position.y == null) {
    return null;
  } else {
    return (
      <span> ({props.step.position.x}, {props.step.position.y}) </span>
    )
  }
}

function Moves(props) {
  let history = props.history;

  if (props.reverse) {
    history = history.reverse()
  }

  const history_length = history.length - 1;

  const moves = history.map( (step, move) => {
    let index = move;
    if (props.reverse) {
      index = history_length - move;
    }

    const desc = step.position.x != null ?
      'Go to move #' + index :
      'Go to game start';

    return (
      <li key={index}>
        <button onClick={() => props.jumpTo(index)}>{desc}</button>
        <Position step={step}/>
      </li>
    );
  });

  return moves;
}

class Board extends React.Component {
  renderSquare(i, winner) {
    return (
      <Square 
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        winner={winner}
      />
    );
  }

  render() {
    let squares_array = []
    for (let i = 0; i < 3; i++) {
      let squares_row = [];
      for (let j = 0; j < 3; j++) {
        const squareIndex = i * 3 + j;
        const winnerSquare = this.props.winnerSquares && this.props.winnerSquares.includes(squareIndex)
        squares_row.push(this.renderSquare(squareIndex, winnerSquare));
      }
      squares_array.push(<div className="board-row" key={i}>{squares_row}</div>)
    }

    return (
      <div>
        {squares_array}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        position: {x: null, y: null},
      }],
      xIsNext: true,
      stepNumber: 0,
      reverse: false,
    };
  }

  handleClick(i) {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const squares = current.squares.slice();
    const winnerCalculation = calculateWinner(squares);
    if (winnerCalculation.winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        position: {
          x: this.calculateRow(i),
          y: this.calculateCol(i),
        }
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      history: this.state.history.slice(0, step + 1),
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  calculateCol(i) {
    if ([0, 3, 6].includes(i)) {
      return 1;
    } else if ([1, 4, 7].includes(i)) {
      return 2;
    } else if ([2, 5, 8].includes(i)) {
      return 3;
    }
  }

  calculateRow(i) {
    if ([0, 1, 2].includes(i)) {
      return 1;
    } else if ([3, 4, 5].includes(i)) {
      return 2;
    } else if ([6, 7, 8].includes(i)) {
      return 3;
    }
  }

  handleSort() {
    this.setState({
      reverse: !this.state.reverse,
    })
  }

  render() {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const winnerCalculation = calculateWinner(current.squares);
    const reverse = this.state.reverse;

    let status;
    if (winnerCalculation.winner) {
      status = 'Winner: ' + winnerCalculation.winner;
    } else if (history.length < 10) {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    } else {
      status = 'Draw'
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            winnerSquares ={winnerCalculation.winnerSquares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>
            <Moves history={history} reverse={reverse} jumpTo={(i) => this.jumpTo(i)}/>
          </ol>
          <button onClick={ () => this.handleSort() }>
            Reverse history
          </button> 
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { 
        winner: squares[a],
        winnerSquares: [a, b, c],
      };
    }
  }
  return { 
    winner: null,
    winnerSquares: null,
  };
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);
