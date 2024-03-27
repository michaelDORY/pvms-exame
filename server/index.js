import express from 'express';
import Queue from "queue";
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

const MAX_QUEUE_LENGTH = 50;

const gameQueue = new Queue({ concurrency: 1, autostart: true });

const boardSize = 100;
const getEmptyBoard = () => Array.from(Array(boardSize), () => Array(boardSize).fill(null));
let gameBoard = getEmptyBoard();
let gameStatus = 'ongoing';


app.post('/play', async (req, res) => {
	const move = req.body;
	console.log('Received move:', move);

	if (gameQueue.length >= MAX_QUEUE_LENGTH) {
		res.status(429).send('Too many requests');
		return;
	}

	gameQueue.push((callback) => {
		processMove(move, callback, res);
	});
});


function processMove(move, callback, res) {
	const row = move.row;
	const col = move.col;
	const symbol = move.symbol;

	if (gameBoard[row][col] !== null) {
		console.log('Invalid move: cell is already occupied');
		res.status(400).send('Invalid move: cell is already occupied');
		callback();
		return;
	}

	gameBoard[row][col] = symbol;

	let responseBody = {
		board: gameBoard,
	}

	const winner = checkWin(gameBoard, row, col, symbol);
	if (winner) {
		console.log(`${symbol} wins!`);
		gameStatus = `${symbol} wins`;


		res.json({ ...responseBody, gameStatus });

		resetGame();
	} else {
		const isTie = gameBoard.every((row) => row.every((cell) => cell !== null));
		if (isTie) {
			console.log("It's a tie!");
			gameStatus = "It's a tie";

			res.json({ ...responseBody, gameStatus });

			resetGame();
		} else {
			res.json({ ...responseBody, gameStatus: 'ongoing' });
		}
	}

	callback();
}

function checkWin(board, row, col, symbol) {
	const directions = [
		[0, 1], // Горизонтальний
		[1, 0], // Вертикальний
	];

	const winningLength = 5;

	for (const [dx, dy] of directions) {
		let count = 1;
		let i = 1;

		const isInsideBoard = row + i * dx < boardSize &&
			col + i * dy < boardSize &&
			row + i * dx >= 0 &&
			col + i * dy >= 0;

		// Перевірка в одному напрямку
		while (
			isInsideBoard &&
			board[row + i * dx][col + i * dy] === symbol
			) {
			count++;
			i++;
		}

		i = -1;

		// Перевірка в протилежному напрямку
		while (
			isInsideBoard &&
			board[row + i * dx][col + i * dy] === symbol
			) {
			count++;
			i--;
		}

		if (count >= winningLength) {
			return true;
		}
	}

	return false;
}

function resetGame() {
	gameBoard = getEmptyBoard();
	gameStatus = 'ongoing';
}

const PORT = 3333;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
