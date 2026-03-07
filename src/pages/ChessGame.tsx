import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Chess piece types
type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
type PieceColor = "white" | "black";

interface Piece {
  type: PieceType;
  color: PieceColor;
}

interface Mentor {
  mentorId: string;
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  profileImageUrl: string;
  experienceYears: number;
}

type Board = (Piece | null)[][];

// Chess piece Unicode symbols
const pieceSymbols: Record<PieceColor, Record<PieceType, string>> = {
  white: {
    king: "♔",
    queen: "♕",
    rook: "♖",
    bishop: "♗",
    knight: "♘",
    pawn: "♙",
  },
  black: {
    king: "♚",
    queen: "♛",
    rook: "♜",
    bishop: "♝",
    knight: "♞",
    pawn: "♟",
  },
};

// Initialize the chess board
const initializeBoard = (): Board => {
  const board: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  // Black pieces (top)
  board[0] = [
    { type: "rook", color: "black" },
    { type: "knight", color: "black" },
    { type: "bishop", color: "black" },
    { type: "queen", color: "black" },
    { type: "king", color: "black" },
    { type: "bishop", color: "black" },
    { type: "knight", color: "black" },
    { type: "rook", color: "black" },
  ];
  board[1] = Array(8)
    .fill(null)
    .map(() => ({ type: "pawn" as PieceType, color: "black" as PieceColor }));

  // White pieces (bottom)
  board[6] = Array(8)
    .fill(null)
    .map(() => ({ type: "pawn" as PieceType, color: "white" as PieceColor }));
  board[7] = [
    { type: "rook", color: "white" },
    { type: "knight", color: "white" },
    { type: "bishop", color: "white" },
    { type: "queen", color: "white" },
    { type: "king", color: "white" },
    { type: "bishop", color: "white" },
    { type: "knight", color: "white" },
    { type: "rook", color: "white" },
  ];

  return board;
};

// Check if a position is within the board
const isValidPosition = (row: number, col: number): boolean => {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
};

// Get all valid moves for a piece
const getValidMoves = (
  board: Board,
  row: number,
  col: number
): [number, number][] => {
  const piece = board[row][col];
  if (!piece) return [];

  const moves: [number, number][] = [];
  const { type, color } = piece;
  const direction = color === "white" ? -1 : 1;

  switch (type) {
    case "pawn": {
      // Forward move
      const newRow = row + direction;
      if (isValidPosition(newRow, col) && !board[newRow][col]) {
        moves.push([newRow, col]);
        // Double move from starting position
        const startRow = color === "white" ? 6 : 1;
        if (row === startRow && !board[row + 2 * direction][col]) {
          moves.push([row + 2 * direction, col]);
        }
      }
      // Captures
      for (const dc of [-1, 1]) {
        if (
          isValidPosition(newRow, col + dc) &&
          board[newRow][col + dc] &&
          board[newRow][col + dc]!.color !== color
        ) {
          moves.push([newRow, col + dc]);
        }
      }
      break;
    }

    case "rook":
      // Horizontal and vertical moves
      for (const [dr, dc] of [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ]) {
        for (let i = 1; i < 8; i++) {
          const newRow = row + dr * i;
          const newCol = col + dc * i;
          if (!isValidPosition(newRow, newCol)) break;
          if (!board[newRow][newCol]) {
            moves.push([newRow, newCol]);
          } else {
            if (board[newRow][newCol]!.color !== color) {
              moves.push([newRow, newCol]);
            }
            break;
          }
        }
      }
      break;

    case "bishop":
      // Diagonal moves
      for (const [dr, dc] of [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ]) {
        for (let i = 1; i < 8; i++) {
          const newRow = row + dr * i;
          const newCol = col + dc * i;
          if (!isValidPosition(newRow, newCol)) break;
          if (!board[newRow][newCol]) {
            moves.push([newRow, newCol]);
          } else {
            if (board[newRow][newCol]!.color !== color) {
              moves.push([newRow, newCol]);
            }
            break;
          }
        }
      }
      break;

    case "queen":
      // Combine rook and bishop moves
      for (const [dr, dc] of [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ]) {
        for (let i = 1; i < 8; i++) {
          const newRow = row + dr * i;
          const newCol = col + dc * i;
          if (!isValidPosition(newRow, newCol)) break;
          if (!board[newRow][newCol]) {
            moves.push([newRow, newCol]);
          } else {
            if (board[newRow][newCol]!.color !== color) {
              moves.push([newRow, newCol]);
            }
            break;
          }
        }
      }
      break;

    case "knight":
      for (const [dr, dc] of [
        [2, 1],
        [2, -1],
        [-2, 1],
        [-2, -1],
        [1, 2],
        [1, -2],
        [-1, 2],
        [-1, -2],
      ]) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (
          isValidPosition(newRow, newCol) &&
          (!board[newRow][newCol] || board[newRow][newCol]!.color !== color)
        ) {
          moves.push([newRow, newCol]);
        }
      }
      break;

    case "king":
      for (const dr of [-1, 0, 1]) {
        for (const dc of [-1, 0, 1]) {
          if (dr === 0 && dc === 0) continue;
          const newRow = row + dr;
          const newCol = col + dc;
          if (
            isValidPosition(newRow, newCol) &&
            (!board[newRow][newCol] || board[newRow][newCol]!.color !== color)
          ) {
            moves.push([newRow, newCol]);
          }
        }
      }
      break;
  }

  return moves;
};

// Find king position
const findKing = (board: Board, color: PieceColor): [number, number] | null => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === "king" && piece.color === color) {
        return [row, col];
      }
    }
  }
  return null;
};

// Check if a color is in check
const isInCheck = (board: Board, color: PieceColor): boolean => {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;

  const opponentColor = color === "white" ? "black" : "white";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === opponentColor) {
        const moves = getValidMoves(board, row, col);
        if (moves.some(([r, c]) => r === kingPos[0] && c === kingPos[1])) {
          return true;
        }
      }
    }
  }
  return false;
};

// Get all valid moves for AI
const getAllMoves = (
  board: Board,
  color: PieceColor
): { from: [number, number]; to: [number, number] }[] => {
  const allMoves: { from: [number, number]; to: [number, number] }[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, row, col);
        for (const [toRow, toCol] of moves) {
          allMoves.push({ from: [row, col], to: [toRow, toCol] });
        }
      }
    }
  }
  return allMoves;
};

// Piece values for AI
const pieceValues: Record<PieceType, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 100,
};

// Simple AI move evaluation
const evaluateMove = (
  board: Board,
  _from: [number, number],
  to: [number, number]
): number => {
  let score = 0;
  const targetPiece = board[to[0]][to[1]];
  if (targetPiece) {
    score += pieceValues[targetPiece.type] * 10;
  }
  // Prefer center control
  const centerDistance =
    Math.abs(to[0] - 3.5) + Math.abs(to[1] - 3.5);
  score += (7 - centerDistance) * 0.5;
  // Add some randomness
  score += Math.random() * 2;
  return score;
};

export default function ChessGame() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [board, setBoard] = useState<Board>(initializeBoard);
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(
    null
  );
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [currentTurn, setCurrentTurn] = useState<PieceColor>("white");
  const [gameStatus, setGameStatus] = useState<string>("Select a mentor to play against");
  const [isGameOver, setIsGameOver] = useState(false);
  const [capturedPieces, setCapturedPieces] = useState<{
    white: Piece[];
    black: Piece[];
  }>({ white: [], black: [] });
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  // Load mentors
  useEffect(() => {
    fetch("/mentors.json")
      .then((res) => res.json())
      .then((data) => setMentors(data))
      .catch(console.error);
  }, []);

  // AI move
  const makeAIMove = useCallback(() => {
    if (isGameOver || currentTurn !== "black") return;

    setIsThinking(true);
    // Simulate thinking time based on mentor experience
    const thinkTime = selectedMentor
      ? Math.max(500, 2000 - selectedMentor.experienceYears * 100)
      : 1000;

    setTimeout(() => {
      const moves = getAllMoves(board, "black");
      if (moves.length === 0) {
        setGameStatus("Checkmate! You win!");
        setIsGameOver(true);
        setIsThinking(false);
        return;
      }

      // Sort moves by score and pick the best one
      const scoredMoves = moves.map((move) => ({
        ...move,
        score: evaluateMove(board, move.from, move.to),
      }));
      scoredMoves.sort((a, b) => b.score - a.score);

      // Take one of the top moves (weighted by mentor experience)
      const topN = Math.max(1, 5 - Math.floor((selectedMentor?.experienceYears || 5) / 3));
      const selectedMove = scoredMoves[Math.floor(Math.random() * Math.min(topN, scoredMoves.length))];

      // Make the move
      const newBoard = board.map((row) => [...row]);
      const piece = newBoard[selectedMove.from[0]][selectedMove.from[1]];
      const capturedPiece = newBoard[selectedMove.to[0]][selectedMove.to[1]];

      newBoard[selectedMove.to[0]][selectedMove.to[1]] = piece;
      newBoard[selectedMove.from[0]][selectedMove.from[1]] = null;

      // Pawn promotion
      if (piece?.type === "pawn" && selectedMove.to[0] === 7) {
        newBoard[selectedMove.to[0]][selectedMove.to[1]] = {
          type: "queen",
          color: "black",
        };
      }

      if (capturedPiece) {
        setCapturedPieces((prev) => ({
          ...prev,
          black: [...prev.black, capturedPiece],
        }));
      }

      // Move notation
      const files = "abcdefgh";
      const notation = `${piece?.type === "pawn" ? "" : piece?.type[0].toUpperCase()}${files[selectedMove.from[1]]}${8 - selectedMove.from[0]} → ${files[selectedMove.to[1]]}${8 - selectedMove.to[0]}`;
      setMoveHistory((prev) => [...prev, `🖤 ${notation}`]);

      setBoard(newBoard);

      // Check game state
      if (isInCheck(newBoard, "white")) {
        const whiteMoves = getAllMoves(newBoard, "white");
        if (whiteMoves.length === 0) {
          setGameStatus(`Checkmate! ${selectedMentor?.firstName} wins!`);
          setIsGameOver(true);
        } else {
          setGameStatus("Check!");
        }
      } else {
        setGameStatus("Your turn");
      }

      setCurrentTurn("white");
      setIsThinking(false);
    }, thinkTime);
  }, [board, currentTurn, isGameOver, selectedMentor]);

  // Trigger AI move when it's black's turn
  useEffect(() => {
    if (currentTurn === "black" && !isGameOver && selectedMentor) {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, isGameOver, selectedMentor, makeAIMove]);

  const handleSquareClick = (row: number, col: number) => {
    if (isGameOver || currentTurn !== "white" || isThinking) return;

    const piece = board[row][col];

    if (selectedSquare) {
      // Try to make a move
      const [selectedRow, selectedCol] = selectedSquare;
      const isValidMove = validMoves.some(
        ([r, c]) => r === row && c === col
      );

      if (isValidMove) {
        const newBoard = board.map((r) => [...r]);
        const movingPiece = newBoard[selectedRow][selectedCol];
        const capturedPiece = newBoard[row][col];

        newBoard[row][col] = movingPiece;
        newBoard[selectedRow][selectedCol] = null;

        // Pawn promotion
        if (movingPiece?.type === "pawn" && row === 0) {
          newBoard[row][col] = { type: "queen", color: "white" };
        }

        if (capturedPiece) {
          setCapturedPieces((prev) => ({
            ...prev,
            white: [...prev.white, capturedPiece],
          }));
        }

        // Move notation
        const files = "abcdefgh";
        const notation = `${movingPiece?.type === "pawn" ? "" : movingPiece?.type[0].toUpperCase()}${files[selectedCol]}${8 - selectedRow} → ${files[col]}${8 - row}`;
        setMoveHistory((prev) => [...prev, `⬜ ${notation}`]);

        setBoard(newBoard);
        setSelectedSquare(null);
        setValidMoves([]);

        // Check game state
        if (isInCheck(newBoard, "black")) {
          const blackMoves = getAllMoves(newBoard, "black");
          if (blackMoves.length === 0) {
            setGameStatus("Checkmate! You win!");
            setIsGameOver(true);
            return;
          } else {
            setGameStatus("Check!");
          }
        } else {
          setGameStatus(`${selectedMentor?.firstName} is thinking...`);
        }

        setCurrentTurn("black");
      } else {
        // Select a different piece
        if (piece && piece.color === "white") {
          setSelectedSquare([row, col]);
          setValidMoves(getValidMoves(board, row, col));
        } else {
          setSelectedSquare(null);
          setValidMoves([]);
        }
      }
    } else {
      // Select a piece
      if (piece && piece.color === "white") {
        setSelectedSquare([row, col]);
        setValidMoves(getValidMoves(board, row, col));
      }
    }
  };

  const startGame = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setBoard(initializeBoard());
    setSelectedSquare(null);
    setValidMoves([]);
    setCurrentTurn("white");
    setGameStatus("Your turn - you play as White");
    setIsGameOver(false);
    setCapturedPieces({ white: [], black: [] });
    setMoveHistory([]);
  };

  const resetGame = () => {
    setSelectedMentor(null);
    setBoard(initializeBoard());
    setSelectedSquare(null);
    setValidMoves([]);
    setCurrentTurn("white");
    setGameStatus("Select a mentor to play against");
    setIsGameOver(false);
    setCapturedPieces({ white: [], black: [] });
    setMoveHistory([]);
  };

  // Mentor Selection Screen
  if (!selectedMentor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              ♟️ Chess Challenge
            </h1>
            <p className="text-xl text-purple-200">
              Select a mentor to challenge in a game of chess
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <Card
                key={mentor.mentorId}
                className="bg-slate-800/50 border-purple-500/30 hover:border-purple-400 transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => startGame(mentor)}
              >
                <CardHeader className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-purple-500/50">
                    <AvatarImage src={mentor.profileImageUrl} />
                    <AvatarFallback className="text-2xl bg-purple-600">
                      {mentor.firstName[0]}
                      {mentor.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-white">
                    {mentor.firstName} {mentor.lastName}
                  </CardTitle>
                  <p className="text-purple-300 text-sm">{mentor.title}</p>
                  <p className="text-slate-400 text-sm">{mentor.company}</p>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge
                    variant="secondary"
                    className="bg-purple-600/50 text-purple-100"
                  >
                    {mentor.experienceYears} years experience
                  </Badge>
                  <p className="text-slate-300 text-sm mt-4">
                    Difficulty: {mentor.experienceYears > 8 ? "Hard" : mentor.experienceYears > 4 ? "Medium" : "Easy"}
                  </p>
                  <Button className="mt-4 w-full bg-purple-600 hover:bg-purple-500">
                    Challenge ♟️
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Game Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button
            onClick={resetGame}
            variant="outline"
            className="border-purple-500 text-purple-300 hover:bg-purple-500/20"
          >
            ← Back to Mentors
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Chess Challenge</h1>
            <p className="text-purple-300">{gameStatus}</p>
          </div>
          <Button
            onClick={() => startGame(selectedMentor)}
            className="bg-purple-600 hover:bg-purple-500"
          >
            New Game
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Opponent Info */}
          <Card className="bg-slate-800/50 border-purple-500/30 lg:col-span-1 order-2 lg:order-1">
            <CardHeader className="text-center">
              <Avatar className="w-20 h-20 mx-auto mb-2 ring-4 ring-purple-500/50">
                <AvatarImage src={selectedMentor.profileImageUrl} />
                <AvatarFallback className="text-xl bg-purple-600">
                  {selectedMentor.firstName[0]}
                  {selectedMentor.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-white text-lg">
                {selectedMentor.firstName} {selectedMentor.lastName}
              </CardTitle>
              <p className="text-purple-300 text-sm">{selectedMentor.title}</p>
              <Badge
                variant={currentTurn === "black" ? "default" : "secondary"}
                className={
                  currentTurn === "black"
                    ? "bg-purple-600 animate-pulse"
                    : "bg-slate-600"
                }
              >
                {isThinking ? "Thinking..." : currentTurn === "black" ? "Playing" : "Waiting"}
              </Badge>
            </CardHeader>
            <CardContent>
              {/* Captured Pieces */}
              <div className="mb-4">
                <p className="text-slate-400 text-sm mb-2">Captured by {selectedMentor.firstName}:</p>
                <div className="flex flex-wrap gap-1">
                  {capturedPieces.black.map((piece, i) => (
                    <span key={i} className="text-2xl">
                      {pieceSymbols.white[piece.type]}
                    </span>
                  ))}
                  {capturedPieces.black.length === 0 && (
                    <span className="text-slate-500 text-sm">None</span>
                  )}
                </div>
              </div>

              {/* Move History */}
              <div>
                <p className="text-slate-400 text-sm mb-2">Move History:</p>
                <div className="max-h-40 overflow-y-auto space-y-1 bg-slate-900/50 rounded p-2">
                  {moveHistory.length > 0 ? (
                    moveHistory.slice(-10).map((move, i) => (
                      <p key={i} className="text-slate-300 text-xs font-mono">
                        {moveHistory.length - 10 + i + 1}. {move}
                      </p>
                    ))
                  ) : (
                    <p className="text-slate-500 text-xs">No moves yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chess Board */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardContent className="p-4">
                <div className="aspect-square max-w-lg mx-auto">
                  <div className="grid grid-cols-8 gap-0 border-4 border-amber-800 rounded-lg overflow-hidden shadow-2xl">
                    {board.map((row, rowIndex) =>
                      row.map((piece, colIndex) => {
                        const isLight = (rowIndex + colIndex) % 2 === 0;
                        const isSelected =
                          selectedSquare?.[0] === rowIndex &&
                          selectedSquare?.[1] === colIndex;
                        const isValidMove = validMoves.some(
                          ([r, c]) => r === rowIndex && c === colIndex
                        );
                        const isCapture = isValidMove && piece !== null;

                        return (
                          <div
                            key={`${rowIndex}-${colIndex}`}
                            onClick={() => handleSquareClick(rowIndex, colIndex)}
                            className={`
                              aspect-square flex items-center justify-center cursor-pointer
                              transition-all duration-200 relative
                              ${isLight ? "bg-amber-100" : "bg-amber-800"}
                              ${isSelected ? "ring-4 ring-yellow-400 ring-inset z-10" : ""}
                              ${isValidMove && !isCapture ? "after:absolute after:w-3 after:h-3 after:rounded-full after:bg-green-500/60" : ""}
                              ${isCapture ? "ring-4 ring-red-500 ring-inset" : ""}
                              ${currentTurn === "white" && !isGameOver && !isThinking ? "hover:brightness-110" : ""}
                            `}
                          >
                            {piece && (
                              <span
                                className={`
                                  text-4xl md:text-5xl select-none
                                  ${piece.color === "white" ? "drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" : "drop-shadow-[0_2px_2px_rgba(255,255,255,0.3)]"}
                                  ${isSelected ? "scale-110" : ""}
                                  transition-transform
                                `}
                              >
                                {pieceSymbols[piece.color][piece.type]}
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Board Labels */}
                <div className="flex justify-center mt-2 gap-0 max-w-lg mx-auto px-1">
                  {["a", "b", "c", "d", "e", "f", "g", "h"].map((file) => (
                    <div key={file} className="flex-1 text-center text-slate-400 text-sm">
                      {file}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Player Info */}
          <Card className="bg-slate-800/50 border-purple-500/30 lg:col-span-1 order-3">
            <CardHeader className="text-center">
              <div className="w-20 h-20 mx-auto mb-2 bg-gradient-to-br from-white to-slate-300 rounded-full flex items-center justify-center ring-4 ring-green-500/50">
                <span className="text-4xl">♔</span>
              </div>
              <CardTitle className="text-white text-lg">You</CardTitle>
              <p className="text-green-300 text-sm">Playing as White</p>
              <Badge
                variant={currentTurn === "white" ? "default" : "secondary"}
                className={
                  currentTurn === "white" && !isGameOver
                    ? "bg-green-600 animate-pulse"
                    : "bg-slate-600"
                }
              >
                {currentTurn === "white" && !isGameOver ? "Your Turn" : "Waiting"}
              </Badge>
            </CardHeader>
            <CardContent>
              {/* Captured Pieces */}
              <div className="mb-4">
                <p className="text-slate-400 text-sm mb-2">Your Captures:</p>
                <div className="flex flex-wrap gap-1">
                  {capturedPieces.white.map((piece, i) => (
                    <span key={i} className="text-2xl">
                      {pieceSymbols.black[piece.type]}
                    </span>
                  ))}
                  {capturedPieces.white.length === 0 && (
                    <span className="text-slate-500 text-sm">None</span>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-slate-900/50 rounded p-3">
                <p className="text-slate-400 text-sm font-medium mb-2">How to Play:</p>
                <ul className="text-slate-300 text-xs space-y-1">
                  <li>• Click a piece to select it</li>
                  <li>• Green dots show valid moves</li>
                  <li>• Red highlights show captures</li>
                  <li>• Pawns auto-promote to Queen</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Over Overlay */}
        {isGameOver && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <Card className="bg-slate-800 border-purple-500 max-w-md mx-4">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl text-white">
                  {gameStatus.includes("You win") ? "🏆 Victory!" : "💀 Defeat!"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-purple-200 text-lg">{gameStatus}</p>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => startGame(selectedMentor)}
                    className="bg-purple-600 hover:bg-purple-500"
                  >
                    Play Again
                  </Button>
                  <Button
                    onClick={resetGame}
                    variant="outline"
                    className="border-purple-500 text-purple-300 hover:bg-purple-500/20"
                  >
                    Choose Another Mentor
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
