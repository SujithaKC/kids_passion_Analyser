<<<<<<< HEAD



// import { useState, useEffect } from "react";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { ArrowLeft } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import Chessboard from "chessboardjsx";
// import { Chess } from "chess.js";
// import { doc, getDoc } from "firebase/firestore";
// import { db } from "@/lib/firebase"; // Adjust path to your Firebase config

// interface MultiGameProps {
//   onBack: () => void;
//   onComplete?: (win: boolean, score: number) => void;
//   childId?: string; // Optional prop for child document ID
// }

// const MultiGame: React.FC<MultiGameProps> = ({ onBack, onComplete, childId }) => {
//   const [chess] = useState(new Chess());
//   const [fen, setFen] = useState(chess.fen());
//   const [currentChild, setCurrentChild] = useState<string | null>(null);
//   const [gameResult, setGameResult] = useState<{ message: string; score: number } | null>(null);
//   const { toast } = useToast();

//   // Fetch child name from Firestore
//   useEffect(() => {
//     const fetchChildName = async () => {
//       if (!childId) {
//         setCurrentChild(null);
//         return;
//       }

//       try {
//         const childDocRef = doc(db, "children", childId);
//         const childDoc = await getDoc(childDocRef);
//         if (childDoc.exists()) {
//           const data = childDoc.data();
//           setCurrentChild(data.name || "Human");
//         } else {
//           setCurrentChild("Human");
//           toast({
//             title: "Error",
//             description: "Child profile not found.",
//             variant: "destructive",
//           });
//         }
//       } catch (error) {
//         console.error("Error fetching child name:", error);
//         setCurrentChild("Human");
//         toast({
//           title: "Error",
//           description: "Failed to fetch child name.",
//           variant: "destructive",
//         });
//       }
//     };

//     fetchChildName();
//   }, [childId, toast]);

//   // Handle AI move after player's move
//   useEffect(() => {
//     if (chess.turn() === "b" && !chess.isGameOver()) {
//       const moves = chess.moves();
//       if (moves.length > 0) {
//         const randomMove = moves[Math.floor(Math.random() * moves.length)];
//         setTimeout(() => {
//           chess.move(randomMove);
//           setFen(chess.fen());
//           checkGameOver();
//         }, 500);
//       }
//     }
//   }, [fen, chess]);

//   // Check if game is over and trigger onComplete
//   const checkGameOver = () => {
//     if (chess.isGameOver()) {
//       let message = "";
//       let win = false;
//       let score = 0;

//       if (chess.isCheckmate()) {
//         win = chess.turn() === "b";
//         message = win ? `Checkmate! ${currentChild || "You"} win!` : "Checkmate! AI wins!";
//         score = win ? 100 : 0;
//       } else if (chess.isDraw()) {
//         message = "Game is a draw!";
//         score = 50;
//       } else if (chess.isStalemate()) {
//         message = "Stalemate!";
//         score = 50;
//       } else if (chess.isThreefoldRepetition()) {
//         message = "Draw by threefold repetition!";
//         score = 50;
//       } else if (chess.isInsufficientMaterial()) {
//         message = "Draw by insufficient material!";
//         score = 50;
//       }

//       setGameResult({ message, score });
//       toast({
//         title: "Game Over",
//         description: message,
//         variant: win ? "default" : "destructive",
//       });
//       onComplete?.(win, score);
//     }
//   };

//   // Handle player's move
//   const handleMove = ({ sourceSquare, targetSquare, promotion = "q" }: { sourceSquare: string; targetSquare: string; promotion?: string }) => {
//     try {
//       const move = chess.move({
//         from: sourceSquare,
//         to: targetSquare,
//         promotion,
//       });

//       if (move) {
//         setFen(chess.fen());
//         checkGameOver();
//       } else {
//         toast({
//           title: "Invalid Move",
//           description: "Please try a legal chess move.",
//           variant: "destructive",
//         });
//       }
//     } catch (error) {
//       toast({
//         title: "Invalid Move",
//         description: "Please try a legal chess move.",
//         variant: "destructive",
//       });
//     }
//   };

//   return (
//     <Card className="p-8 flex flex-col items-center">
//       <Button onClick={onBack} className="mb-4">
//         <ArrowLeft className="mr-2" /> Back to Home
//       </Button>
//       <h2 className="text-2xl font-bold mb-4">Computer Vs {currentChild || "Human"}</h2>
//       <Chessboard
//         width={900}
//         position={fen}
//         onDrop={handleMove}
//         orientation="white"
//       />
//       {gameResult && (
//         <div className="mt-4 text-center">
//           <p className="text-lg font-semibold">{gameResult.message}</p>
//           <p className="text-md">Score: {gameResult.score}</p>
//         </div>
//       )}
//     </Card>
//   );
// };

// export default MultiGame;



import React, { useState, useEffect } from "react";
=======
import { useState, useEffect } from "react";
>>>>>>> 02923ad7c34581f938b7dc22975aeea76d3f487f
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Chess } from "chess.js";
<<<<<<< HEAD
import Chessboard from "chessboardjsx";
=======
import { useGame } from "@/context/GameContext";
>>>>>>> 02923ad7c34581f938b7dc22975aeea76d3f487f

interface MultiGameProps {
  onBack: () => void;
  onGameComplete: (score: number, timeSpent: number) => void;
}

const MultiGame: React.FC<MultiGameProps> = ({ onBack, onGameComplete }) => {
  const [chess] = useState(new Chess());
  const [fen, setFen] = useState(chess.fen());
<<<<<<< HEAD
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [score, setScore] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setStartTime(Date.now()); // reset timer at game start
  }, []);

  // AI move
=======
  const [startTime] = useState(Date.now());
  const [gameOver, setGameOver] = useState(false);
  const { toast } = useToast();
  const { currentChild, recordGameSession } = useGame();

  // Handle AI move after player's move
>>>>>>> 02923ad7c34581f938b7dc22975aeea76d3f487f
  useEffect(() => {
    if (!gameOver && chess.turn() === "b" && !chess.isGameOver()) {
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
  }, [fen, chess, gameOver]);

  const checkGameOver = () => {
    if (chess.isGameOver()) {
<<<<<<< HEAD
      let resultMessage = "";
      let points = 0;

      if (chess.isCheckmate()) {
        const win = chess.turn() === "b"; // if AI's turn after checkmate, human won
        resultMessage = win ? "✅ You Win!" : "💻 AI Wins!";
        points = win ? 100 : 0;
      } else if (chess.isDraw()) {
        resultMessage = "🤝 Draw!";
        points = 50;
      } else if (chess.isStalemate()) {
        resultMessage = "🤝 Stalemate!";
        points = 50;
      }

      setMessage(resultMessage);
      setScore(points);
      setGameOver(true);
    }
  };

  const handleMove = ({ sourceSquare, targetSquare }: any) => {
    const move = chess.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });
=======
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
>>>>>>> 02923ad7c34581f938b7dc22975aeea76d3f487f

    if (move) {
      setFen(chess.fen());
      checkGameOver();
    }
  };

<<<<<<< HEAD
  const endGame = () => {
    const timeSpent = (Date.now() - startTime) / 1000;
    onGameComplete(score ?? 0, timeSpent);
=======
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
>>>>>>> 02923ad7c34581f938b7dc22975aeea76d3f487f
    onBack();
  };

  return (
<<<<<<< HEAD
    <div className="p-6 flex flex-col items-center space-y-6">
      <Button onClick={onBack} className="self-start">
        <ArrowLeft className="mr-2" /> Back
      </Button>

      <h2 className="text-2xl font-bold">♟ Computer vs Human</h2>

      <Card className="p-4 flex flex-col items-center">
        <Chessboard
          width={800}
          position={fen}
          onDrop={handleMove}
          orientation="white"
        />
      </Card>

      {gameOver && (
        <Card className="p-4 text-center">
          <p className="text-lg font-semibold">{message}</p>
          <p className="text-md">Score: {score}</p>
          <Button variant="default" className="mt-4" onClick={endGame}>
            🚪 End Game
          </Button>
        </Card>
      )}
=======
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
>>>>>>> 02923ad7c34581f938b7dc22975aeea76d3f487f
    </div>
  );
};

export default MultiGame;
