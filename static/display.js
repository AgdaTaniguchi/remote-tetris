const serverIp = "http://192.168.15.2:8765";

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const tetrominos = {
    'I': [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    'J': [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    'L': [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
    ],
    'O': [
        [1, 1],
        [1, 1],
    ],
    'S': [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
    ],
    'Z': [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
    ],
    'T': [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
    ]
};

// color of each tetromino
const colors = {
    'I': 'cyan',
    'O': 'yellow',
    'T': 'purple',
    'S': 'green',
    'Z': 'red',
    'J': 'blue',
    'L': 'orange'
};

class TetrisGame {
    constructor() {
        this.gbRows = 30;
        this.gbCols = 12;
        this.playfield = [];
        this.tetrominoSequence = [];

        this.gameOver = false;
        
        for (let row = -2; row < this.gbRows; row++) {
            this.playfield[row] = [];
            
            for (let col = 0; col < this.gbCols; col++) {
                this.playfield[row][col] = 0;
            }
        }

        this.nextTetromino = this.getNextTetromino();
    }

    generateSequence() {
        const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

        while (sequence.length) {
            const rand = getRandomInt(0, sequence.length - 1);
            const name = sequence.splice(rand, 1)[0];
            this.tetrominoSequence.push(name);
        }
    }

    getNextTetromino() {
        if (this.tetrominoSequence.length === 0) {
            this.generateSequence();
        }

        const name = this.tetrominoSequence.pop();
        // const matrix = tetrominos[name];
        const matrix = tetrominos[name];

        // I and O start centered, all others start in left-middle
        const col = this.playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);

        // I starts on row 21 (-1), all others start on row 22 (-2)
        const row = name === 'I' ? -1 : -2;

        return {
            name: name,      // name of the piece (L, O, etc.)
            matrix: matrix,  // the current rotation matrix
            row: row,        // current row (starts offscreen)
            col: col         // current col
        };
    }

    rotate(matrix) {
        const N = matrix.length - 1;
        const result = matrix.map((row, i) =>
            row.map((val, j) => matrix[N - j][i])
        );

        return result;
    }

    isValidMove(matrix, cellRow, cellCol) {
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col] && (
                    // outside the game bounds
                    cellCol + col < 0 ||
                    cellCol + col >= this.playfield[0].length ||
                    cellRow + row >= this.playfield.length ||
                    // collides with another piece
                    this.playfield[cellRow + row][cellCol + col])
                ) {
                    return false;
                }
            }
        }

        return true;
    }

    placeTetromino() {
        for (let row = 0; row < this.nextTetromino.matrix.length; row++) {
            for (let col = 0; col < this.nextTetromino.matrix[row].length; col++) {
                if (this.nextTetromino.matrix[row][col]) {

                    // game over if piece has any part offscreen
                    if (this.nextTetromino.row + row < 0) {
                        return this.showGameOver();
                    }

                    this.playfield[this.nextTetromino.row + row][this.nextTetromino.col + col] = this.nextTetromino.name;
                }
            }
        }

        // check for line clears starting from the bottom and working our way up
        for (let row = this.playfield.length - 1; row >= 0;) {
            if (this.playfield[row].every(cell => !!cell)) {

                // drop every row above this one
                for (let r = row; r >= 0; r--) {
                    for (let c = 0; c < this.playfield[r].length; c++) {
                        this.playfield[r][c] = this.playfield[r - 1][c];
                    }
                }
            }
            else {
                row--;
            }
        }

        this.nextTetromino = this.getNextTetromino();
    }

    showGameOver() {
        cancelAnimationFrame(rAF);
        this.gameOver = true;

        context.fillStyle = 'black';
        context.globalAlpha = 0.75;
        context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);

        context.globalAlpha = 1;
        context.fillStyle = 'white';
        context.font = '36px monospace';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
    }
}

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 32;

let count = 0;
let rAF = null;  // keep track of the animation frame so we can cancel it

// game loop
function loop() {
    rAF = requestAnimationFrame(loop);
    context.clearRect(0, 0, canvas.width, canvas.height);

    count++;

    // draw the playfield
    screens.forEach((screen, index) => {
        if(screen.game == undefined) {
            return;
        }

        for (let row = 0; row < screen.game.gbRows; row++) {
            for (let col = 0; col < screen.game.gbCols; col++) {
                if (screen.game.playfield[row][col]) {
                    const name = screen.game.playfield[row][col];
                    context.fillStyle = colors[name];
    
                    // drawing 1 px smaller than the grid creates a grid effect
                    context.fillRect((index * screen.game.gbCols * grid) + (col * grid), row * grid, grid - 1, grid - 1);
                }
            }
        }

        // draw the active tetromino
        if (screen.game.nextTetromino) {
            // tetromino falls every 35 frames
            if (count % 35 == 0) {
                screen.game.nextTetromino.row++;
                // place piece if it runs into anything
                if (!screen.game.isValidMove(screen.game.nextTetromino.matrix, screen.game.nextTetromino.row, screen.game.nextTetromino.col)) {
                    screen.game.nextTetromino.row--;
                    screen.game.placeTetromino();
                }
            }
    
            context.fillStyle = colors[screen.game.nextTetromino.name];
    
            for (let row = 0; row < screen.game.nextTetromino.matrix.length; row++) {
                for (let col = 0; col < screen.game.nextTetromino.matrix[row].length; col++) {
                    if (screen.game.nextTetromino.matrix[row][col]) {
                        // drawing 1 px smaller than the grid creates a grid effect
                        context.fillRect((index * screen.game.gbCols * grid) + (screen.game.nextTetromino.col + col) * grid, (screen.game.nextTetromino.row + row) * grid, grid - 1, grid - 1);
                    }
                }
            }
        }
    });
}

// start the game
rAF = requestAnimationFrame(loop);

// const screens = [new TetrisGame(), new TetrisGame(), new TetrisGame(), new TetrisGame()];

for (let index = 1; index <= 4; index++) {
    new QRCode(`qrcode${index}`, {
        text: `${serverIp}/controls?player=p${index}`,
        colorDark : "#ffffff",
        colorLight : "#000000",
    });
}

const screens = [
    {
        'mode': 'invite',
    },
    {
        'mode': 'invite',
    },
    {
        'mode': 'invite',
    },
    {
        'mode': 'invite',
    },
];

// listen to keyboard events to move the active tetromino
// document.addEventListener('keydown', function (e) {
//     if (game1.gameOver) return;

//     // left and right arrow keys (move)
//     if (e.which === 37 || e.which === 39) {
//         const col = e.which === 37
//             ? game1.nextTetromino.col - 1
//             : game1.nextTetromino.col + 1;

//         if (game1.isValidMove(game1.nextTetromino.matrix, game1.nextTetromino.row, col)) {
//             game1.nextTetromino.col = col;
//         }
//     }

//     // up arrow key (rotate)
//     if (e.which === 38) {
//         const matrix = game1.rotate(game1.nextTetromino.matrix);
//         if (game1.isValidMove(matrix, game1.nextTetromino.row, game1.nextTetromino.col)) {
//             game1.nextTetromino.matrix = matrix;
//         }
//     }

//     // down arrow key (drop)
//     if (e.which === 40) {
//         const row = game1.nextTetromino.row + 1;

//         if (!game1.isValidMove(game1.nextTetromino.matrix, row, game1.nextTetromino.col)) {
//             game1.nextTetromino.row = row - 1;

//             game1.placeTetromino();
//             return;
//         }

//         game1.nextTetromino.row = row;
//     }
// });

// const socket = io("http://localhost:8765/");
// socket.on('connect', (event) => {
//     console.log('Conectado com sucesso!');
// });

// socket.on('error', (error) => {
//     console.log(error)
// });

// socket.on('sendMessageDisplay', (msg) => {
//     if (gameOver) return;

//     // left and right arrow keys (move)
//     if (msg.movement === 'left' || msg.movement === 'right') {
//         const col = msg.movement === 'left'
//             ? tetromino.col - 1
//             : tetromino.col + 1;

//         if (game1.isValidMove(tetromino.matrix, tetromino.row, col)) {
//             tetromino.col = col;
//         }
//     }

//     // up arrow key (rotate)
//     if (msg.movement === 'turn right') {
//         const matrix = rotate(tetromino.matrix);
//         if (game1.isValidMove(matrix, tetromino.row, tetromino.col)) {
//             tetromino.matrix = matrix;
//         }
//     }

//     // down arrow key (drop)
//     if (msg.movement === 'down') {
//         const row = tetromino.row + 1;

//         if (!game1.isValidMove(tetromino.matrix, row, tetromino.col)) {
//             tetromino.row = row - 1;

//             placeTetromino();
//             return;
//         }

//         tetromino.row = row;
//     }
// });