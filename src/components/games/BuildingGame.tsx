import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Hammer, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BuildingGameProps {
  onGameComplete: (score: number, timeSpent: number) => void;
}

export const BuildingGame = ({ onGameComplete }: BuildingGameProps) => {
  const HEIGHT = 10;
  const WIDTH = 15;
  const blocks = [
    { id: "red", color: "bg-red-400", emoji: "🧱", name: "Red Brick" },
    { id: "blue", color: "bg-blue-400", emoji: "🟦", name: "Blue Block" },
    { id: "green", color: "bg-green-400", emoji: "🟩", name: "Green Block" },
    { id: "yellow", color: "bg-yellow-400", emoji: "🟨", name: "Yellow Block" },
    { id: "purple", color: "bg-purple-400", emoji: "🟪", name: "Purple Block" },
    { id: "orange", color: "bg-orange-400", emoji: "🟧", name: "Orange Block" }
  ];
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [world, setWorld] = useState(() => Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(null)));
  const [selectedBlock, setSelectedBlock] = useState(blocks[0].id);
  const [mode, setMode] = useState<"place" | "mine">("place");
  const { toast } = useToast();

  const handleClick = (row: number, col: number) => {
    const newWorld = world.map(r => [...r]);
    if (mode === "place") {
      if (selectedBlock) {
        newWorld[row][col] = selectedBlock;
        setWorld(newWorld);
        const height = HEIGHT - row;
        setScore(prev => prev + 10 + (height * 2));
        const block = blocks.find(b => b.id === selectedBlock);
        toast({
          title: `🏗️ ${block?.name} Placed!`,
          description: `Great job building at height ${height}!`,
          duration: 1000,
        });
      }
    } else if (mode === "mine") {
      if (newWorld[row][col]) {
        newWorld[row][col] = null;
        setWorld(newWorld);
        toast({
          title: "⛏️ Block Mined!",
          description: "Spot cleared for new ideas!",
          duration: 1000,
        });
      }
    }
  };

  const clearWorld = () => {
    setWorld(Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(null)));
    toast({
      title: "🧹 World Cleared!",
      description: "Ready to build something new!",
      duration: 1000,
    });
  };

  const endGame = () => {
    const timeSpent = (Date.now() - startTime) / 1000;
    const placed = world.flat().filter(b => b !== null).length;
    onGameComplete(score, timeSpent);
    toast({
      title: "🏗️ Building Game Complete!",
      description: `You placed ${placed} blocks and scored ${score} points!`,
      duration: 3000,
    });
  };

  const placed = world.flat().filter(b => b !== null).length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="text-6xl animate-bounce">🏗️</div>
        <h1 className="text-4xl font-bold text-engineering">Craft World Building</h1>
        <p className="text-lg text-muted-foreground">
          Place blocks to build amazing structures like houses and more!
        </p>
      </div>

      <Card className="p-8 bg-gradient-to-br from-engineering/10 to-engineering/20">
        <div className="flex justify-between items-center mb-6">
          <div className="text-2xl font-bold text-engineering">Score: {score}</div>
          <div className="text-lg text-engineering">
            Blocks Placed: {placed}
          </div>
          <div className="text-lg text-engineering">
            Mode: {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </div>
        </div>

        {/* Building Area */}
        <div className="bg-sky-100 rounded-lg p-4 mb-6 flex flex-col justify-end">
          <div className="flex flex-col">
            {world.map((rowData, row) => (
              <div key={row} className="flex">
                {rowData.map((cell, col) => {
                  const block = cell ? blocks.find(b => b.id === cell) : null;
                  return (
                    <div
                      key={col}
                      className={`w-10 h-10 flex items-center justify-center cursor-pointer ${
                        block ? block.color : "bg-transparent hover:bg-white/20"
                      }`}
                      onClick={() => handleClick(row, col)}
                    >
                      {block && <span className="text-2xl">{block.emoji}</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          {/* Ground */}
          <div className="w-full h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
        </div>

        {/* Block Selection */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {blocks.map((block) => (
            <Button
              key={block.id}
              onClick={() => setSelectedBlock(block.id)}
              className={`
                h-20 text-lg font-semibold transition-all duration-300
                ${block.color} text-white hover:scale-105 hover:shadow-lg
                flex flex-col items-center justify-center
                ${selectedBlock === block.id ? "ring-4 ring-engineering" : ""}
              `}
            >
              <span className="text-2xl">{block.emoji}</span>
              <span className="text-xs">{block.name}</span>
            </Button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Button
            onClick={() => setMode("place")}
            className="bg-engineering/20 hover:bg-engineering/30 text-engineering p-4 h-16"
          >
            <Building className="w-6 h-6 mr-2" />
            Place Mode
          </Button>
          <Button
            onClick={() => setMode("mine")}
            className="bg-engineering/20 hover:bg-engineering/30 text-engineering p-4 h-16"
          >
            <Hammer className="w-6 h-6 mr-2" />
            Mine Mode
          </Button>
          <Button
            onClick={clearWorld}
            className="bg-engineering/20 hover:bg-engineering/30 text-engineering p-4 h-16"
          >
            <Wrench className="w-6 h-6 mr-2" />
            Clear All
          </Button>
        </div>

        <div className="text-center">
          <Button
            onClick={endGame}
            className="bg-engineering hover:bg-engineering/90 text-engineering-foreground px-8 py-3 text-lg"
          >
            <Building className="w-5 h-5 mr-2" />
            Finish Building
          </Button>
        </div>
      </Card>
    </div>
  );
};