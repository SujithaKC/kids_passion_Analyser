


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
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Chess } from "chess.js";
import Chessboard from "chessboardjsx";

interface MultiGameProps {
  onBack: () => void;
  onGameComplete: (score: number, timeSpent: number) => void;
}

const MultiGame: React.FC<MultiGameProps> = ({ onBack, onGameComplete }) => {
  const [chess] = useState(new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [score, setScore] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setStartTime(Date.now()); // reset timer at game start
  }, []);

  // AI move
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

    if (move) {
      setFen(chess.fen());
      checkGameOver();
    }
  };

  const endGame = () => {
    const timeSpent = (Date.now() - startTime) / 1000;
    onGameComplete(score ?? 0, timeSpent);
    onBack();
  };

  return (
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
    </div>
  );
};

export default MultiGame;
