import React, {useState} from 'react';
import axios from 'axios';

const Board = () => {
  const [board, setBoard] = useState(
    Array.from(Array(100), () => Array(100).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState('X');

  const handleClick = async (row, col) => {
    if (board[row][col]) return;

    const newBoard = [...board];
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);

    try {
      const {data: {gameStatus}} = await axios.create({
        baseURL: 'http://localhost:3333',
      }).post('/play', { row, col, symbol: currentPlayer });

      if (gameStatus !== 'ongoing') {
        await alert(gameStatus);
        setBoard(Array.from(Array(100), () => Array(100).fill(null)));
      }

      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h1>Tic Tac Toe</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(100, 1fr)' }}>
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              style={{
                width: '20px',
                height: '20px',
                border: '1px solid black',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => handleClick(rowIndex, colIndex)}
            >
              {cell}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Board;
