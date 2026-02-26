import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, BarChart3, User, Gamepad2, Video, MessageCircle } from "lucide-react";
import { GameCard } from "@/components/GameCard";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useGame } from "@/context/GameContext";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import YouTube, { YouTubeProps } from "react-youtube";
// Game Components
import { MusicGame } from "@/components/games/MusicGame";
import { ForestGame } from "@/components/games/ForestGame";
import { BuildingGame } from "@/components/games/BuildingGame";
import { DrawingGame } from "@/components/games/DrawingGame";
import { WordLearningGame } from "@/components/games/WordLearningGame";
import { CookingGame } from "@/components/games/CookingGame";
import FashionGame from "@/components/games/FashionGame";
import SportsGame from "@/components/games/SportsGame";
import ChildChatbot from "@/components/chatbot";

interface GameSelectorProps {
  onShowDashboard: () => void;
}

const videoCategories = {
  "Learn": [
    { id: "learn1", title: "Learn the Alphabet", icon: "🔤", color: "learning" },
    { id: "learn2", title: "Count Numbers", icon: "🔢", color: "learning" },
    { id: "learn3", title: "Learn Colors", icon: "🎨", color: "learning" },
    { id: "learn4", title: "Learn Shapes", icon: "⭐", color: "learning" },
  ],
  "Adventure": [
    { id: "adv1", title: "Jungle Quest", icon: "🌴", color: "nature" },
    { id: "adv2", title: "Space Explorer", icon: "🚀", color: "science" },
    { id: "adv3", title: "Ocean Discovery", icon: "🐠", color: "nature" },
    { id: "adv4", title: "Mountain Climb", icon: "⛰️", color: "adventure" },
  ],
  "Music": [
    { id: "mus1", title: "Sing Along", icon: "🎵", color: "music" },
    { id: "mus2", title: "Dance Party", icon: "💃", color: "music" },
    { id: "mus3", title: "Instrument Fun", icon: "🎸", color: "music" },
    { id: "mus4", title: "Rhythm Games", icon: "🥁", color: "music" },
  ],
  "Stories": [
    { id: "story1", title: "Fairy Tales", icon: "👑", color: "learning" },
    { id: "story2", title: "Animal Tales", icon: "🦁", color: "nature" },
    { id: "story3", title: "Adventure Stories", icon: "🗺️", color: "adventure" },
    { id: "story4", title: "Bedtime Stories", icon: "🌙", color: "learning" },
  ],
};

export const GameSelector = ({ onShowDashboard }: GameSelectorProps) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [childName, setChildName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [nameError, setNameError] = useState("");
  const [loading, setLoading] = useState(false);
  const { recordGameSession, currentChild, setCurrentChild } = useGame();
  const { toast } = useToast();
  const [parentUid, setParentUid] = useState<string | null>(null);
  const [tab, setTab] = useState<"games" | "video" | "chatbot">("games");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const currentVideos = selectedCategory ? videoCategories[selectedCategory as keyof typeof videoCategories] : [];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setParentUid(user.uid);
        const savedChildId = localStorage.getItem("childId");
        if (savedChildId) {
          fetchChildName(user.uid, savedChildId);
        }
      } else {
        setParentUid(null);
        setCurrentChild("");
        localStorage.removeItem("childId");
      }
    });
    return () => unsubscribe();
  }, [setCurrentChild]);

  const fetchChildName = async (uid: string, childId: string) => {
    const docRef = doc(db, "parents", uid, "children", childId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const name = docSnap.data().name;
      setCurrentChild(name);
    }
  };

  const checkNameUnique = async (name: string) => {
    if (!parentUid) return false;
    const childId = name.trim().toLowerCase().replace(/\s+/g, "_");
    const docRef = doc(db, "parents", parentUid, "children", childId);
    const docSnap = await getDoc(docRef);
    return !docSnap.exists();
  };

  const handleChildNameSubmit = async () => {
    const trimmed = childName.trim();
    if (!trimmed) {
      setNameError("Child's name is required");
      return;
    }
    if (!parentUid) {
      toast({
        title: "Authentication Error",
        description: "Please log in to add a child",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setNameError("");
    const isUnique = await checkNameUnique(trimmed);
    if (!isUnique) {
      setNameError("This name is already used for another child");
      setLoading(false);
      return;
    }

    try {
      const childId = trimmed.toLowerCase().replace(/\s+/g, "_");
      const docRef = doc(db, "parents", parentUid, "children", childId);
      await setDoc(docRef, {
        name: trimmed,
        createdAt: new Date().toISOString(),
      });

      localStorage.setItem("childId", childId);
      setCurrentChild(trimmed);
      setShowNameInput(false);
      toast({
        title: "Child Added!",
        description: `Welcome, ${trimmed}! Ready to play?`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to save child name: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const games = [
    {
      id: "music",
      title: "Music Game",
      description: "Play piano, guitar, and drums to create beautiful music!",
      icon: "🎵",
      color: "music",
      component: MusicGame,
    },
    {
      id: "forest",
      title: "Farm Quest",
      description: "Learn about farming and grow your virtual crops!",
      icon: "🌾",
      color: "nature",
      component: ForestGame,
    },
    {
      id: "building",
      title: "Building Blocks",
      description: "Build towers, bridges, and amazing structures!",
      icon: "🏗️",
      color: "engineering",
      component: BuildingGame,
    },
    {
      id: "drawing",
      title: "Drawing & Painting",
      description: "Create beautiful artwork with colors and brushes!",
      icon: "🎨",
      color: "art",
      component: DrawingGame,
    },
    {
      id: "learning",
      title: "Word & Learning",
      description: "Learn letters, numbers, and new words!",
      icon: "📚",
      color: "learning",
      component: WordLearningGame,
    },
    {
      id: "cooking",
      title: "Cooking Game",
      description: "Cook delicious meals and learn about ingredients!",
      icon: "🍳",
      color: "cooking",
      component: CookingGame,
    },
    {
      id: "fashion",
      title: "Fashion Design",
      description: "Design clothes and create amazing outfits!",
      icon: "👗",
      color: "fashion",
      component: FashionGame,
    },
    {
      id: "sports",
      title: "Sports Game",
      description: "Play soccer, basketball, and other fun sports!",
      icon: "⚽",
      color: "sports",
      component: SportsGame,
    },
  ];

  const handleGameSelect = (gameId: string) => {
    if (!currentChild) {
      setShowNameInput(true);
      toast({
        title: "Child's Name Required",
        description: "Please enter your child's name to start playing",
        variant: "destructive",
      });
      return;
    }
    const game = games.find((g) => g.id === gameId);
    if (game && game.component) {
      setSelectedGame(gameId);
    }
  };

  const handleGameComplete = async (gameId: string, score: number, timeSpent: number) => {
    const game = games.find((g) => g.id === gameId);
    if (game && parentUid) {
      await addDoc(collection(db, "parents", parentUid, "gameSessions"), {
        gameType: game.title,
        score,
        timeSpent,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
      });
      recordGameSession({ gameType: game.title, score, timeSpent, timestamp: Date.now() });
    }
    setSelectedGame(null);
  };

  if (selectedGame) {
    const game = games.find((g) => g.id === selectedGame);
    if (game && game.component) {
      const GameComponent = game.component;
      return (
        <GameComponent
          onGameComplete={(score, timeSpent) => handleGameComplete(selectedGame, score, timeSpent)}
          onBack={() => setSelectedGame(null)}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="text-8xl animate-bounce">🎮</div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Kids Passion Analyser
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover your child's natural talents through fun games!
          </p>
        </div>

        {/* Navigation Bar */}
        <nav className="bg-white shadow-md rounded-lg px-4 py-2 flex justify-center gap-4 items-center w-fit mx-auto">
          <Button
            onClick={() => setTab("games")}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
              tab === "games"
                ? "bg-primary text-white"
                : "bg-transparent text-primary hover:bg-primary/10"
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            Games
          </Button>

          <Button
            onClick={() => setTab("video")}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
              tab === "video"
                ? "bg-primary text-white"
                : "bg-transparent text-primary hover:bg-primary/10"
            }`}
          >
            <Video className="w-4 h-4" />
            Video
          </Button>

          <Button
            onClick={() => setTab("chatbot")}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
              tab === "chatbot"
                ? "bg-primary text-white"
                : "bg-transparent text-primary hover:bg-primary/10"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Chatbot
          </Button>
        </nav>

        {/* Content Based on Tab */}
        {tab === "games" && (
          <>
            {/* Child Name & Controls */}
            <div className="flex items-center justify-center gap-4">
              <Card className="p-4 flex items-center gap-4">
                <User className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Playing as:</p>
                  <p className="font-semibold">{currentChild || "No name yet"}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNameInput(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Change
                </Button>
              </Card>

              <Button
                onClick={onShowDashboard}
                className="bg-primary hover:bg-primary/90"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Parent Dashboard
              </Button>
            </div>

            {/* Child Name Input Modal */}
            {showNameInput && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="p-6 max-w-md w-full mx-4">
                  <h3 className="text-xl font-bold mb-4">Enter Child's Name</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="childName">Child's Name</Label>
                      <Input
                        id="childName"
                        value={childName}
                        onChange={(e) => {
                          setChildName(e.target.value);
                          setNameError("");
                        }}
                        placeholder="Enter your child's name"
                      />
                      {nameError && <p className="text-sm text-red-500 mt-1">{nameError}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleChildNameSubmit}
                        className="flex-1"
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowNameInput(false);
                          setChildName("");
                          setNameError("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {games.map((game) => (
                <GameCard
                  key={game.id}
                  title={game.title}
                  description={game.description}
                  icon={game.icon}
                  color={game.color}
                  onClick={() => handleGameSelect(game.id)}
                />
              ))}
            </div>

            {/* Fun Footer */}
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground">
                🌟 Have fun exploring and discovering your amazing talents! 🌟
              </p>
            </div>
          </>
        )}

        {tab === "video" && <VideoPlayer />}

        {tab === "chatbot" && (
          <div>
            <h1 className="text-4xl font-bold text-center mb-6">Chat with Buddy!</h1>
            <p className="text-center text-lg mb-4 text-muted-foreground">
              Ask questions and get help from our friendly chatbot!
            </p>
            <ChildChatbot parentUid={parentUid} />
          </div>
        )}
      </div>
    </div>
  );
};