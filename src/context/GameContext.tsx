import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";

export interface GameSession {
  gameType: string;
  score: number;
  timeSpent: number; // In seconds
  timestamp: number;
}

export interface GameStats {
  totalSessions: number;
  averageScore: number;
  totalTimeSpent: number;
  topGames: Array<{
    gameType: string;
    sessions: number;
    percentage: number;
    averageScore: number;
  }>;
}

interface GameContextType {
  gameHistory: GameSession[];
  recordGameSession: (session: GameSession) => void;
  getGameStats: () => GameStats;
  clearHistory: () => void;
  currentChild: string;
  setCurrentChild: (name: string) => void;
  loading: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameHistory, setGameHistory] = useState<GameSession[]>([]);
  const [currentChild, setCurrentChild] = useState("Anonymous");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user?.uid) {
        console.log("User authenticated, UID:", user.uid);
        const q = query(collection(db, "parents", user.uid, "gameSessions"), orderBy("timestamp", "desc"));
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const sessions: GameSession[] = snapshot.docs.map(doc => ({
            gameType: doc.data().gameType,
            score: doc.data().score,
            timeSpent: doc.data().minutesPlayed * 60, // Convert minutes back to seconds
            timestamp: doc.data().timestamp,
          }));
          console.log("Synced Sessions:", sessions);
          setGameHistory(sessions);
          setLoading(false);
        }, (error) => {
          console.error("Error syncing game sessions:", error);
          setLoading(false);
        });
        return () => unsubscribeSnapshot();
      } else {
        setGameHistory([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const recordGameSession = (session: GameSession) => {
    if (auth.currentUser?.uid) {
      addDoc(collection(db, "parents", auth.currentUser.uid, "gameSessions"), {
        gameType: session.gameType,
        minutesPlayed: Math.round(session.timeSpent / 60),
        score: session.score,
        timestamp: session.timestamp,
        createdAt: new Date().toISOString(),
      }).then(() => {
        console.log("Session recorded successfully");
      }).catch((error) => {
        console.error("Error recording session:", error);
      });
    }
  };

  const getGameStats = (): GameStats => {
    const totalSessions = gameHistory.length;
    const averageScore = gameHistory.reduce((sum, session) => sum + session.score, 0) / totalSessions || 0;
    const totalTimeSpent = gameHistory.reduce((sum, session) => sum + session.timeSpent, 0);

    const gameTypeStats = gameHistory.reduce((acc, session) => {
      if (!acc[session.gameType]) {
        acc[session.gameType] = { sessions: 0, totalScore: 0 };
      }
      acc[session.gameType].sessions++;
      acc[session.gameType].totalScore += session.score;
      return acc;
    }, {} as Record<string, { sessions: number; totalScore: number }>);

    const topGames = Object.entries(gameTypeStats)
      .map(([gameType, stats]) => ({
        gameType,
        sessions: stats.sessions,
        percentage: (stats.sessions / totalSessions) * 100,
        averageScore: stats.totalScore / stats.sessions
      }))
      .sort((a, b) => b.percentage - a.percentage);

    return {
      totalSessions,
      averageScore,
      totalTimeSpent,
      topGames
    };
  };

  const clearHistory = () => {
    if (auth.currentUser?.uid) {
      setGameHistory([]);
      console.log("Game history cleared locally; Firestore deletion not implemented");
    }
  };

  return (
    <GameContext.Provider
      value={{
        gameHistory,
        recordGameSession,
        getGameStats,
        clearHistory,
        currentChild,
        setCurrentChild,
        loading
      }}
    >
      {children}
    </GameContext.Provider>
  );
};