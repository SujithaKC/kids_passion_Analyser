import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, BarChart3, User, Gamepad2, Video, Palette, PawPrint, Book, Music, Star, Cake, Shirt, Dumbbell, Play, MessageCircle } from "lucide-react";
import { GameCard } from "@/components/GameCard";
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

// Video Card Component
interface VideoCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

const VideoCard = ({ title, description, icon, color, onClick }: VideoCardProps) => {
  const getColorClasses = (color: string) => {
    const colorMap = {
      art: { bg: "bg-art", hover: "hover:bg-art/90", text: "text-art-foreground", gradient: "from-art to-art/80" },
      nature: { bg: "bg-nature", hover: "hover:bg-nature/90", text: "text-nature-foreground", gradient: "from-nature to-nature/80" },
      learning: { bg: "bg-learning", hover: "hover:bg-learning/90", text: "text-learning-foreground", gradient: "from-learning to-learning/80" },
      music: { bg: "bg-music", hover: "hover:bg-music/90", text: "text-music-foreground", gradient: "from-music to-music/80" },
      crafts: { bg: "bg-crafts", hover: "hover:bg-crafts/90", text: "text-crafts-foreground", gradient: "from-crafts to-crafts/80" },
      cooking: { bg: "bg-cooking", hover: "hover:bg-cooking/90", text: "text-cooking-foreground", gradient: "from-cooking to-cooking/80" },
      fashion: { bg: "bg-fashion", hover: "hover:bg-fashion/90", text: "text-fashion-foreground", gradient: "from-fashion to-fashion/80" },
      sports: { bg: "bg-sports", hover: "hover:bg-sports/90", text: "text-sports-foreground", gradient: "from-sports to-sports/80" },
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.art;
  };

  const colors = getColorClasses(color);

  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer animate-bounce-in">
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-10`} />
      <div className="relative p-6 flex flex-col items-center text-center space-y-4">
        <div className="text-6xl animate-float">{icon}</div>
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Button
          onClick={onClick}
          className={`${colors.bg} ${colors.hover} ${colors.text} animate-wiggle hover:animate-pop`}
        >
          <Play className="w-4 h-4 mr-2" />
          Watch Video
        </Button>
      </div>
    </Card>
  );
};

interface GameSelectorProps {
  onShowDashboard: () => void;
}

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
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>("Colouring");

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

  const onYouTubeReady: YouTubeProps["onReady"] = (event) => {
    event.target.pauseVideo();
  };

  const videoOptions = {
    height: "390",
    width: "640",
    playerVars: {
      autoplay: 0,
      controls: 1,
      modestbranding: 1,
    },
  };

  const videoCategories = {
    Colouring: [
      { id: "bpL_NEZSCfQ", title: "Peppa Pig Drawing for Kids", icon: <Palette className="w-6 h-6" />, color: "art" },
      { id: "7SWvlUd2at8", title: "Colouring Animals", icon: <Palette className="w-6 h-6" />, color: "art" },
      { id: "D-LO3UQhakM", title: "Easy Shapes Colouring", icon: <Palette className="w-6 h-6" />, color: "art" },
      { id: "Dt4SD4e2Z6E", title: "Rainbow Drawing", icon: <Palette className="w-6 h-6" />, color: "art" },
      { id: "sFezaQaDih8", title: "Cartoon Colouring", icon: <Palette className="w-6 h-6" />, color: "art" },
      { id: "-Q-5iShl3g4", title: "Flower Colouring", icon: <Palette className="w-6 h-6" />, color: "art" },
      { id: "8_bQoPbcxdo", title: "Kids Art Lesson", icon: <Palette className="w-6 h-6" />, color: "art" },
      { id: "JEGBYEFNUL8", title: "Colour by Numbers", icon: <Palette className="w-6 h-6" />, color: "art" },
      { id: "sp0OXjviF_0", title: "Dinosaur Colouring", icon: <Palette className="w-6 h-6" />, color: "art" },
      { id: "Zs9c5QalC7o", title: "Sea Animals Colouring", icon: <Palette className="w-6 h-6" />, color: "art" },
    ].slice(0, 10),
    Animals: [
      { id: "efiWeJbdbxk", title: "Animal Sounds for Kids", icon: <PawPrint className="w-6 h-6" />, color: "nature" },
      { id: "QwONVRva5ls", title: "Zoo Tour", icon: <PawPrint className="w-6 h-6" />, color: "nature" },
      { id: "hewioIU4a64", title: "Farm Animals", icon: <PawPrint className="w-6 h-6" />, color: "nature" },
      { id: "4IJeX6kWCQI", title: "Wildlife for Kids", icon: <PawPrint className="w-6 h-6" />, color: "nature" },
      { id: "pKosbOawGSY", title: "Pet Care", icon: <PawPrint className="w-6 h-6" />, color: "nature" },
      { id: "bapGaik9qxU", title: "Bird Watching", icon: <PawPrint className="w-6 h-6" />, color: "nature" },
      { id: "3i5_v_sUZ04", title: "Ocean Life", icon: <PawPrint className="w-6 h-6" />, color: "nature" },
      { id: "NQOD8oBfZjs", title: "Safari Adventure", icon: <PawPrint className="w-6 h-6" />, color: "nature" },
      { id: "s7pcWnlwcjA", title: "Animal Songs", icon: <PawPrint className="w-6 h-6" />, color: "nature" },
      { id: "es4x5R-rV9s", title: "Jungle Exploration", icon: <PawPrint className="w-6 h-6" />, color: "nature" },
    ].slice(0, 10),
    Learning: [
      { id: "Yt8GFgxlITs", title: "Counting 1 to 10", icon: <Book className="w-6 h-6" />, color: "learning" },
      { id: "ccEpTTZW34g", title: "Alphabet Fun", icon: <Book className="w-6 h-6" />, color: "learning" },
      { id: "igcoDFokKzU", title: "Math for Kids", icon: <Book className="w-6 h-6" />, color: "learning" },
      { id: "BnQnXN0y8P0", title: "Science Basics", icon: <Book className="w-6 h-6" />, color: "learning" },
      { id: "H_wNOcJadNI", title: "History Tales", icon: <Book className="w-6 h-6" />, color: "learning" },
      { id: "NVLv52rE4ug", title: "Geography Lessons", icon: <Book className="w-6 h-6" />, color: "learning" },
      { id: "UbYpfxrkqHo", title: "Reading Skills", icon: <Book className="w-6 h-6" />, color: "learning" },
      { id: "yBPraaPfLSA", title: "Puzzle Solving", icon: <Book className="w-6 h-6" />, color: "learning" },
      { id: "dd2ydzlxg6E", title: "Memory Games", icon: <Book className="w-6 h-6" />, color: "learning" },
      { id: "Wu7rNXVO_PY", title: "Language Basics", icon: <Book className="w-6 h-6" />, color: "learning" },
    ].slice(0, 10),
    Music: [
      { id: "ggRWEzo3SMg", title: "Alphabet Song", icon: <Music className="w-6 h-6" />, color: "music" },
      { id: "tWi_h154U5U", title: "Kids Nursery Rhymes", icon: <Music className="w-6 h-6" />, color: "music" },
      { id: "LZES_sSMuVs", title: "Instrument Lessons", icon: <Music className="w-6 h-6" />, color: "music" },
      { id: "xZbJQ7GjACY", title: "Dance Moves", icon: <Music className="w-6 h-6" />, color: "music" },
      { id: "L0MK7qz13bU", title: "Sing Along", icon: <Music className="w-6 h-6" />, color: "music" },
      { id: "RsQZX7Hhqug", title: "Music Games", icon: <Music className="w-6 h-6" />, color: "music" },
      { id: "5he1sCixSLM", title: "Rhythm Fun", icon: <Music className="w-6 h-6" />, color: "music" },
      { id: "BuinvmsRGNY", title: "Kids Band", icon: <Music className="w-6 h-6" />, color: "music" },
      { id: "Ex_aWeTDwNA", title: "Classical Music", icon: <Music className="w-6 h-6" />, color: "music" },
      { id: "grhi8MLM1i8", title: "Holiday Songs", icon: <Music className="w-6 h-6" />, color: "music" },
    ].slice(0, 10),
    Crafts: [
      { id: "jlzX8jt0Now", title: "Shapes for Kids", icon: <Star className="w-6 h-6" />, color: "crafts" },
      { id: "SF71ks5FrKQ", title: "Paper Crafts", icon: <Star className="w-6 h-6" />, color: "crafts" },
      { id: "9XY7LjNwid8", title: "Clay Modeling", icon: <Star className="w-6 h-6" />, color: "crafts" },
      { id: "q_Yp7KVPz0M", title: "Origami Fun", icon: <Star className="w-6 h-6" />, color: "crafts" },
      { id: "PfrY5v8g2lE", title: "Bead Crafts", icon: <Star className="w-6 h-6" />, color: "crafts" },
      { id: "FkyIf2ZFmJ0", title: "DIY Toys", icon: <Star className="w-6 h-6" />, color: "crafts" },
      { id: "Z4BEsFrQV1M", title: "Card Making", icon: <Star className="w-6 h-6" />, color: "crafts" },
      { id: "vjMHleB-Mlw", title: "Paint Projects", icon: <Star className="w-6 h-6" />, color: "crafts" },
      { id: "s6sIwt-4LqI", title: "Recycled Crafts", icon: <Star className="w-6 h-6" />, color: "crafts" },
      { id: "kqtHDkVrUeE", title: "Holiday Crafts", icon: <Star className="w-6 h-6" />, color: "crafts" },
    ].slice(0, 10),
    Cooking: [
      { id: "2oUxr7149DY", title: "Easy Recipes", icon: <Cake className="w-6 h-6" />, color: "cooking" },
      { id: "4GwTEbmKSb8", title: "Kids Baking", icon: <Cake className="w-6 h-6" />, color: "cooking" },
      { id: "pmgkj01uUTw", title: "Healthy Snacks", icon: <Cake className="w-6 h-6" />, color: "cooking" },
      { id: "gyVwpFLFqgY", title: "Fruit Fun", icon: <Cake className="w-6 h-6" />, color: "cooking" },
      { id: "C0z9BKuVfdE", title: "Pizza Making", icon: <Cake className="w-6 h-6" />, color: "cooking" },
      { id: "fi4n4Ix8MgU", title: "Cake Decorating", icon: <Cake className="w-6 h-6" />, color: "cooking" },
      { id: "im-y0JFs85Q", title: "Smoothie Recipes", icon: <Cake className="w-6 h-6" />, color: "cooking" },
      { id: "ttxJIH0D8nU", title: "Cookie Time", icon: <Cake className="w-6 h-6" />, color: "cooking" },
      { id: "31kyGGSTqFA", title: "Sandwich Art", icon: <Cake className="w-6 h-6" />, color: "cooking" },
      { id: "KFAyKx91BIs", title: "Holiday Treats", icon: <Cake className="w-6 h-6" />, color: "cooking" },
    ].slice(0, 10),
    Fashion: [
      { id: "1GDFa-nEzlg", title: "Dress Up", icon: <Shirt className="w-6 h-6" />, color: "fashion" },
      { id: "CwOXkHZyH24", title: "Kids Outfits", icon: <Shirt className="w-6 h-6" />, color: "fashion" },
      { id: "TBPfpkXzKkk", title: "Hair Styles", icon: <Shirt className="w-6 h-6" />, color: "fashion" },
      { id: "JTGlpUW8Q0w", title: "Makeup for Kids", icon: <Shirt className="w-6 h-6" />, color: "fashion" },
      { id: "ah2KQGi8Swk", title: "Accessory Design", icon: <Shirt className="w-6 h-6" />, color: "fashion" },
      { id: "DGdKhkwzfmg", title: "Costume Ideas", icon: <Shirt className="w-6 h-6" />, color: "fashion" },
      { id: "9vteeLTOX-s", title: "Shoe Crafts", icon: <Shirt className="w-6 h-6" />, color: "fashion" },
      { id: "OnSJB2e5ZeY", title: "Trendy Looks", icon: <Shirt className="w-6 h-6" />, color: "fashion" },
      { id: "EnulhZuwz04", title: "Kids Fashion Show", icon: <Shirt className="w-6 h-6" />, color: "fashion" },
      { id: "S67EG8ntlcM", title: "DIY Clothes", icon: <Shirt className="w-6 h-6" />, color: "fashion" },
    ].slice(0, 10),
    Sports: [
      { id: "MEk1FFFRQ7o", title: "Soccer for Kids", icon: <Dumbbell className="w-6 h-6" />, color: "sports" },
      { id: "0_56e5GKKwA", title: "Basketball Basics", icon: <Dumbbell className="w-6 h-6" />, color: "sports" },
      { id: "aXWFqBG-02w", title: "Swimming Lessons", icon: <Dumbbell className="w-6 h-6" />, color: "sports" },
      { id: "KCaxZaIZYs8", title: "Tennis Fun", icon: <Dumbbell className="w-6 h-6" />, color: "sports" },
      { id: "y1d64hQB3NU", title: "Yoga for Kids", icon: <Dumbbell className="w-6 h-6" />, color: "sports" },
      { id: "WeheMkndV1U", title: "Running Games", icon: <Dumbbell className="w-6 h-6" />, color: "sports" },
      { id: "dkoVxBnnGko", title: "Cycling Safety", icon: <Dumbbell className="w-6 h-6" />, color: "sports" },
      { id: "-xn9zvo0mvY", title: "Team Sports", icon: <Dumbbell className="w-6 h-6" />, color: "sports" },
      { id: "ymigWt5TOV8", title: "Dance Fitness", icon: <Dumbbell className="w-6 h-6" />, color: "sports" },
      { id: "olN2wl0I5No", title: "Outdoor Games", icon: <Dumbbell className="w-6 h-6" />, color: "sports" },
    ].slice(0, 10),
  };

  const currentVideos = selectedCategory ? videoCategories[selectedCategory as keyof typeof videoCategories] : [];

  if (selectedGame) {
    const game = games.find((g) => g.id === selectedGame);
    if (game && game.component) {
      const GameComponent = game.component;
      return (
        <GameComponent
          onGameComplete={(score, timeSpent) => handleGameComplete(selectedGame, score, timeSpent)}
          onBack={() => setSelectedGame(null)}     />
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

        {tab === "video" && (
          <div>
            <h1 className="text-4xl font-bold text-center mb-6">Video Corner</h1>
            <p className="text-center text-lg mb-4 text-muted-foreground">Select a category to watch fun videos!</p>
            {/* Category Selection Grid */}
            {!selectedCategory && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {Object.keys(videoCategories).map((category) => (
                  <VideoCard
                    key={category}
                    title={category}
                    description={`Explore ${category.toLowerCase()} videos for kids!`}
                    icon={videoCategories[category as keyof typeof videoCategories][0].icon}
                    color={videoCategories[category as keyof typeof videoCategories][0].color}
                    onClick={() => setSelectedCategory(category)}
                  />
                ))}
              </div>
            )}
            {/* Video Grid for Selected Category */}
            {selectedCategory && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">{selectedCategory} Videos</h2>
                  <Button variant="outline" onClick={() => setSelectedCategory(null)}>Back to Categories</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                  {currentVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      title={video.title}
                      description={`Watch ${video.title.toLowerCase()} video!`}
                      icon={video.icon}
                      color={video.color}
                      onClick={() => setSelectedVideoId(video.id)}
                    />
                  ))}
                </div>
                {selectedVideoId && (
                  <div className="flex justify-center mt-6">
                    <YouTube videoId={selectedVideoId} opts={videoOptions} onReady={onYouTubeReady} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

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