import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Chessboard from "chessboardjsx";
import { Chess } from "chess.js";
import { useGame } from "@/context/GameContext";

interface MultiGameProps {
  onBack: () => void;
  onGameComplete: (score: number, timeSpent: number) => void;
}

const MultiGame: React.FC<MultiGameProps> = ({ onBack, onGameComplete }) => {
  const [chess] = useState(new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [startTime] = useState(Date.now());
  const [gameOver, setGameOver] = useState(false);
  const { toast } = useToast();
  const { currentChild, recordGameSession } = useGame();

  // Handle AI move after player's move
  useEffect(() => {
    if (chess.turn() === "b" && !chess.isGameOver()) {
      const moves = chess.moves();
      if (moves.length > 0) {
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        setTimeout(() => {
          chess.move(randomMove);
          setFen(chess.fen());
          checkGameOver();
        }, 500);
      }
    }
  }, [fen, chess]);

  // Check if game is over and trigger onComplete
  const checkGameOver = () => {
    if (chess.isGameOver()) {
      let message = "";
      let win = false;
      let score = 0;
      let result = "";

      if (chess.isCheckmate()) {
        win = chess.turn() === "b"; // If black's turn after checkmate, white won
        result = "checkmate";
        message = win ? "Checkmate! You win!" : "Checkmate! AI wins!";
        score = win ? 100 : 0;
      } else if (chess.isDraw()) {
        result = "draw";
        message = "Game is a draw!";
        score = 50;
      } else if (chess.isStalemate()) {
        result = "stalemate";
        message = "Stalemate!";
        score = 50;
      } else if (chess.isThreefoldRepetition()) {
        result = "threefold_repetition";
        message = "Draw by threefold repetition!";
        score = 50;
      } else if (chess.isInsufficientMaterial()) {
        result = "insufficient_material";
        message = "Draw by insufficient material!";
        score = 50;
      }

      toast({
        title: "Game Over",
        description: message,
        variant: win ? "default" : "destructive",
      });

      // Calculate time spent
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      // Record game session using the context function
      recordGameSession({
        gameType: "Chess Game",
        score,
        timeSpent,
        timestamp: Date.now(),
      });
      
      // Set game over state
      setGameOver(true);
      
      // Trigger completion callback
      onGameComplete(score, timeSpent);
    }
  };

  // Handle player's move
  const handleMove = ({ sourceSquare, targetSquare, promotion = "q" }: { 
    sourceSquare: string; 
    targetSquare: string; 
    promotion?: string 
  }) => {
    if (gameOver) return;
    
    try {
      const move = chess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion,
      });

      if (move) {
        setFen(chess.fen());
        checkGameOver();
      } else {
        toast({
          title: "Invalid Move",
          description: "Please try a legal chess move.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Invalid Move",
        description: "Please try a legal chess move.",
        variant: "destructive",
      });
    }
  };

  // Reset game
  const resetGame = () => {
    chess.reset();
    setFen(chess.fen());
    setGameOver(false);
  };

  // Exit game and record session
  const exitGame = () => {
    if (!gameOver) {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const score = 0; // Player exited without finishing
      
      recordGameSession({
        gameType: "Chess Game",
        score,
        timeSpent,
        timestamp: Date.now(),
      });
      
      onGameComplete(score, timeSpent);
    }
    onBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Button onClick={exitGame} className="mb-6" variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Games
        </Button>
        
        <Card className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Chess Game</h1>
            <p className="text-gray-600">Play against the computer and test your skills!</p>
            <p className="text-sm text-gray-500 mt-2">
              Playing as: <span className="font-semibold">{currentChild || "Guest"}</span>
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <Chessboard
                width={400}
                position={fen}
                onDrop={handleMove}
                orientation="white"
                boardStyle={{
                  borderRadius: "4px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                }}
              />
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={resetGame} variant="outline" disabled={!gameOver}>
              Play Again
            </Button>
            <Button onClick={exitGame} variant="outline">
              Exit Game
            </Button>
          </div>

          {gameOver && (
            <div className="mt-6 text-center">
              <p className="text-lg font-semibold text-green-600">
                Game Over! Check your score in the parent dashboard.
              </p>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Tip: The computer makes random moves. Try to checkmate it to win!</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MultiGame;