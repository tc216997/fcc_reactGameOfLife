'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var rows = 20;
var cells = 40;
var speed = 200;

function updateMatrix(array) {
  //update the matrix by checking the neighbors and return the updated array
  var newArray = JSON.parse(JSON.stringify(array));
  for (var i = 0; i < newArray.length; i++) {
    for (var j = 0; j < newArray[i].length; j++) {
      newArray[i][j].currentState = gameRules(newArray[i][j]);
    }
  }
  for (var i = 0; i < newArray.length; i++) {
    for (var j = 0; j < newArray[i].length; j++) {
      newArray[i][j].neighborScore = findNeighborsScore(i, j, newArray);
    }
  }
  return newArray;
}

function clearBoard(array) {
  // clear the cells by setting state to 0 and neighbor score to 0
  var newArray = JSON.parse(JSON.stringify(array));
  newArray.map(function (row) {
    row.map(function (cell) {
      cell.currentState = 0;
      cell.neighborScore = 0;
    });
  });
  return newArray;
}

function createCells(n) {
  // create cells
  var array = [];
  for (var i = 0; i < n; i++) {
    array.push(null);
  }
  return array;
}

function createRandomMatrix(rows, cells) {
  //create a random matrix with the specified number of rows and cells
  var matrix = [];
  var count = 0;
  for (var i = 0; i < rows; i++) {
    matrix[i] = createCells(cells);
    for (var j = 0; j < matrix[i].length; j++) {
      matrix[i][j] = { cellnumber: count,
        currentState: randomCellState(),
        neighborScore: undefined,
        index: [i, j]
      };
      count++;
    }
  }
  for (var i = 0; i < matrix.length; i++) {
    for (var j = 0; j < matrix[i].length; j++) {
      matrix[i][j].neighborScore = findNeighborsScore(i, j, matrix);
    }
  }
  return matrix;
}

function updateNeighbors(matrix) {
  // update the matrix neighbor score and returns it
  for (var i = 0; i < matrix.length; i++) {
    for (var j = 0; j < matrix[i].length; j++) {
      matrix[i][j].neighborScore = findNeighborsScore(i, j, matrix);
    }
  }
  return matrix;
}

function findNeighborsScore(row, col, matrix) {
  // find the neighbor score
  var score = 0;
  var rowLimit = matrix.length - 1;
  var colLimit = matrix[0].length - 1;
  for (var x = Math.max(0, row - 1); x <= Math.min(row + 1, rowLimit); x++) {
    for (var y = Math.max(0, col - 1); y <= Math.min(col + 1, colLimit); y++) {
      if (x !== row || y !== col) {
        score += matrix[x][y].currentState;
      }
    }
  }
  return score;
}

function gameRules(object) {
  // get each neighbor sum
  // if sum is 3, cell becomes alive
  // if sum is greater than 3, cell dies
  // if sum is less than 2, cell dies,
  // anthing else, cell state stays the same
  if (object.neighborScore === 3) {
    return 1;
  } else if (object.neighborScore > 3) {
    return 0;
  } else if (object.neighborScore < 2) {
    return 0;
  } else {
    return object.currentState;
  }
}

function randomCellState() {
  //random number between 1 and 0
  var num = Math.floor(Math.random() * 2);
  return num;
}

function Square(props) {
  // create a square button to be rendered
  var currentState = props.object.currentState;
  var nextState = gameRules(props.object);
  return React.createElement('button', { className: "cells " + (currentState > 0 ? 'birth' : 'death'),
    id: 'cell-' + props.object.cellnumber,
    value: props.object.index,
    onClick: function onClick() {
      return props.onClick(props.object.index);
    }
  });
}

var Board = function (_React$Component) {
  _inherits(Board, _React$Component);

  function Board() {
    _classCallCheck(this, Board);

    return _possibleConstructorReturn(this, _React$Component.apply(this, arguments));
  }

  //render the square button

  Board.prototype.renderSquare = function renderSquare(item) {
    return React.createElement(Square, { object: item,
      onClick: this.props.onClick
    });
  };

  Board.prototype.render = function render() {
    var _this2 = this;

    return React.createElement(
      'div',
      { className: 'gameBoard', id: 'gameBoard' },
      this.props.squares.map(function (row) {
        return React.createElement(
          'div',
          { className: 'boardRow' },
          row.map(function (item) {
            return _this2.renderSquare(item);
          })
        );
      })
    );
  };

  return Board;
}(React.Component);

var Game = function (_React$Component2) {
  _inherits(Game, _React$Component2);

  function Game() {
    _classCallCheck(this, Game);

    var _this3 = _possibleConstructorReturn(this, _React$Component2.call(this));

    _this3.state = {
      squares: createRandomMatrix(rows, cells),
      generation: 0,
      timer: undefined,
      isCleared: false,
      runDisabled: false
    };
    return _this3;
  }

  //check if the component was mounted

  Game.prototype.componentDidMount = function componentDidMount() {
    var _this4 = this;

    this.setState({
      timer: this.timerId
    });
    this.timerId = setInterval(function () {
      return _this4.generate();
    }, speed);
  };
  // generate cells

  Game.prototype.generate = function generate() {
    this.setState({
      squares: updateMatrix(this.state.squares),
      generation: this.state.generation + 1
    });
  };
  //click handler for each individual cells

  Game.prototype.handleClick = function handleClick(index) {
    console.log('click handler');
    var i = index[0];
    var j = index[1];
    var newState = this.state.squares;
    var cellState = !this.state.squares[i][j].currentState ? 1 : 0;
    newState[i][j].currentState = cellState;
    if (this.state.isCleared) {
      this.setState({
        squares: newState
      });
    }
  };
  // handler for the clear button

  Game.prototype.handleClear = function handleClear() {
    clearInterval(this.timerId);
    this.setState({
      squares: clearBoard(this.state.squares),
      generation: 0,
      isCleared: true
    });
  };

  Game.prototype.handleRun = function handleRun() {
    var _this5 = this;

    // run and render, set iscleared to false
    clearInterval(this.timerId);
    var matrix = updateNeighbors(this.state.squares);
    this.setState({
      squares: matrix,
      timer: this.timerId,
      isCleared: false
    });
    this.timerId = setInterval(function () {
      return _this5.generate();
    }, speed);
  };

  Game.prototype.handlePause = function handlePause() {
    //stop renderings
    clearInterval(this.timerId);
  };
  //handler for the random button

  Game.prototype.handleRandom = function handleRandom() {
    var _this6 = this;

    clearInterval(this.timerId);
    var matrix = createRandomMatrix(rows, cells);
    this.setState({
      squares: matrix,
      generation: 0,
      isCleared: false
    });
    this.timerId = setInterval(function () {
      return _this6.generate();
    }, speed);
  };

  Game.prototype.render = function render() {
    var _this7 = this;

    return React.createElement(
      'div',
      null,
      React.createElement(
        'h1',
        { className: 'app-heading' },
        'Conway\'s Game of Life'
      ),
      React.createElement(
        'div',
        { className: 'generation-text' },
        'Generation:',
        React.createElement(
          'span',
          { className: 'generation' },
          this.state.generation
        )
      ),
      React.createElement(
        'div',
        { className: 'outerboard-div' },
        React.createElement(Board, { squares: this.state.squares,
          onClick: this.handleClick.bind(this) })
      ),
      React.createElement(
        'div',
        { className: 'buttonsRow' },
        React.createElement(
          'button',
          { className: 'buttons', onClick: function onClick() {
              return _this7.handleRun();
            }, id: 'run-btn' },
          'Start'
        ),
        React.createElement(
          'button',
          { className: 'buttons', onClick: function onClick() {
              return _this7.handlePause();
            }, id: 'pause-btn' },
          'Pause'
        ),
        React.createElement(
          'button',
          { className: 'buttons', onClick: function onClick() {
              return _this7.handleClear();
            }, id: 'clear-btn' },
          'Clear'
        ),
        React.createElement(
          'button',
          { className: 'buttons', onClick: function onClick() {
              return _this7.handleRandom();
            }, id: 'random-btn' },
          'Random'
        )
      )
    );
  };

  return Game;
}(React.Component);

ReactDOM.render(React.createElement(Game, null), document.getElementById('container'));