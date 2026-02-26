import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Palette, PawPrint, Book, Music, Star, Cake, Shirt, Dumbbell } from "lucide-react";
import YouTube, { YouTubeProps } from "react-youtube";

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

interface VideoData {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
}

interface VideoCategory {
  [key: string]: VideoData[];
}

export const VideoPlayer = () => {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const videoPlayerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to video player when a video is selected
  useEffect(() => {
    if (selectedVideoId && videoPlayerRef.current) {
      setTimeout(() => {
        videoPlayerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [selectedVideoId]);

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

  const videoCategories: VideoCategory = {
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
    ],
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
    ],
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
    ],
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
    ],
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
    ],
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
    ],
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
    ],
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
    ],
  };

  const currentVideos = selectedCategory ? videoCategories[selectedCategory] : [];

  return (
    <div>
      <h1 className="text-4xl font-bold text-center mb-6">Video Corner</h1>
      {!selectedCategory && (
        <p className="text-center text-lg mb-4 text-muted-foreground">Select a category to watch fun videos!</p>
      )}
      
      {/* Video Player - Display at Top */}
      {selectedVideoId && (
        <div ref={videoPlayerRef} className="flex justify-center mb-8">
          <YouTube videoId={selectedVideoId} opts={videoOptions} onReady={onYouTubeReady} />
        </div>
      )}
      
      {/* Category Selection Grid */}
      {!selectedCategory && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {Object.keys(videoCategories).map((category) => (
            <VideoCard
              key={category}
              title={category}
              description={`Explore ${category.toLowerCase()} videos for kids!`}
              icon={videoCategories[category][0].icon}
              color={videoCategories[category][0].color}
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
            <Button variant="outline" onClick={() => {setSelectedCategory(null); setSelectedVideoId(null);}}>Back to Categories</Button>
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
        </div>
      )}
    </div>
  );
};
