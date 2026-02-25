import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Brush, Eraser, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sample SVG outlines for coloring
const outlineImages = [
{
  name: "Dog",
  svg: `<svg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <ellipse cx='100' cy='120' rx='55' ry='45' stroke='black' stroke-width='3' fill='white'/>
    <ellipse cx='55' cy='70' rx='20' ry='35' stroke='black' stroke-width='3' fill='white'/>
    <ellipse cx='145' cy='70' rx='20' ry='35' stroke='black' stroke-width='3' fill='white'/>
    <ellipse cx='80' cy='125' rx='8' ry='12' stroke='black' stroke-width='2' fill='white'/>
    <ellipse cx='120' cy='125' rx='8' ry='12' stroke='black' stroke-width='2' fill='white'/>
    <ellipse cx='100' cy='150' rx='15' ry='8' stroke='black' stroke-width='2' fill='white'/>
  </svg>`
},

{
  name: "Teddy",
  svg: `<svg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <!-- head -->
    <circle cx='100' cy='70' r='30' stroke='black' stroke-width='3' fill='white'/>
    <!-- ears -->
    <circle cx='70' cy='50' r='12' stroke='black' stroke-width='3' fill='white'/>
    <circle cx='130' cy='50' r='12' stroke='black' stroke-width='3' fill='white'/>
    <!-- body -->
    <ellipse cx='100' cy='130' rx='40' ry='50' stroke='black' stroke-width='3' fill='white'/>
    <!-- arms -->
    <ellipse cx='55' cy='130' rx='15' ry='35' stroke='black' stroke-width='3' fill='white'/>
    <ellipse cx='145' cy='130' rx='15' ry='35' stroke='black' stroke-width='3' fill='white'/>
    <!-- legs -->
    <ellipse cx='80' cy='180' rx='15' ry='20' stroke='black' stroke-width='3' fill='white'/>
    <ellipse cx='120' cy='180' rx='15' ry='20' stroke='black' stroke-width='3' fill='white'/>
  </svg>`
},
{
  name: "Bird",
  svg: `<svg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <!-- body -->
    <ellipse cx='110' cy='120' rx='40' ry='30' stroke='black' stroke-width='3' fill='white'/>
    <!-- head -->
    <circle cx='70' cy='100' r='20' stroke='black' stroke-width='3' fill='white'/>
    <!-- beak -->
    <polygon points='50,100 35,105 50,110' stroke='black' stroke-width='2' fill='white'/>
    <!-- wings -->
    <ellipse cx='110' cy='120' rx='20' ry='15' stroke='black' stroke-width='2' fill='white'/>
    <!-- legs -->
    <line x1='100' y1='150' x2='95' y2='170' stroke='black' stroke-width='2'/>
    <line x1='115' y1='150' x2='120' y2='170' stroke='black' stroke-width='2'/>
  </svg>`
}
,
{
  name: "Cat",
  svg: `<svg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <!-- head -->
    <circle cx='100' cy='70' r='30' stroke='black' stroke-width='3' fill='white'/>
    <!-- ears -->
    <polygon points='75,50 65,30 85,45' stroke='black' stroke-width='3' fill='white'/>
    <polygon points='125,50 135,30 115,45' stroke='black' stroke-width='3' fill='white'/>
    <!-- body -->
    <ellipse cx='100' cy='130' rx='40' ry='50' stroke='black' stroke-width='3' fill='white'/>
    <!-- legs -->
    <ellipse cx='80' cy='180' rx='10' ry='20' stroke='black' stroke-width='3' fill='white'/>
    <ellipse cx='120' cy='180' rx='10' ry='20' stroke='black' stroke-width='3' fill='white'/>
    <!-- tail -->
    <path d='M140 150 Q170 140 160 110' stroke='black' stroke-width='3' fill='none'/>
  </svg>`
}
,


{
  name: "Girl Doll",
  svg: `<svg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <ellipse cx='100' cy='80' rx='30' ry='30' stroke='black' stroke-width='3' fill='white'/>
    <rect x='70' y='110' width='60' height='50' rx='20' stroke='black' stroke-width='3' fill='white'/>
    <ellipse cx='70' cy='150' rx='10' ry='20' stroke='black' stroke-width='2' fill='white'/>
    <ellipse cx='130' cy='150' rx='10' ry='20' stroke='black' stroke-width='2' fill='white'/>
    <ellipse cx='55' cy='80' rx='8' ry='12' stroke='black' stroke-width='2' fill='white'/>
    <ellipse cx='145' cy='80' rx='8' ry='12' stroke='black' stroke-width='2' fill='white'/>
  </svg>`
},


  {
  name: "Flower",
  svg: `<svg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <!-- petals -->
    <circle cx='100' cy='60' r='20' stroke='black' stroke-width='3' fill='white'/>
    <circle cx='140' cy='100' r='20' stroke='black' stroke-width='3' fill='white'/>
    <circle cx='100' cy='140' r='20' stroke='black' stroke-width='3' fill='white'/>
    <circle cx='60' cy='100' r='20' stroke='black' stroke-width='3' fill='white'/>
    <circle cx='80' cy='80' r='20' stroke='black' stroke-width='3' fill='white'/>
    <circle cx='120' cy='80' r='20' stroke='black' stroke-width='3' fill='white'/>
    <circle cx='80' cy='120' r='20' stroke='black' stroke-width='3' fill='white'/>
    <circle cx='120' cy='120' r='20' stroke='black' stroke-width='3' fill='white'/>
    <!-- center -->
    <circle cx='100' cy='100' r='15' stroke='black' stroke-width='3' fill='white'/>
    
  </svg>`
}
,
{
  name: "Tree",
  svg: `<svg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <!-- leaves -->
    <circle cx='100' cy='70' r='40' stroke='black' stroke-width='3' fill='white'/>
    <circle cx='70' cy='90' r='35' stroke='black' stroke-width='3' fill='white'/>
    <circle cx='130' cy='90' r='35' stroke='black' stroke-width='3' fill='white'/>
    <!-- trunk -->
    <rect x='90' y='110' width='20' height='50' stroke='black' stroke-width='3' fill='white'/>
  </svg>`
}
,
{
  name: "Face",
  svg: `<svg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <!-- head -->
    <circle cx='100' cy='100' r='40' stroke='black' stroke-width='3' fill='white'/>
    <!-- eyes -->
    <ellipse cx='85' cy='90' rx='5' ry='8' stroke='black' stroke-width='2' fill='white'/>
    <ellipse cx='115' cy='90' rx='5' ry='8' stroke='black' stroke-width='2' fill='white'/>
    <!-- smile -->
    <path d='M80 115 Q100 130 120 115' stroke='black' stroke-width='2' fill='none'/>
    <!-- hair -->
    <path d='M60 80 Q100 40 140 80' stroke='black' stroke-width='3' fill='none'/>
  </svg>`
}
,
{
  name: "Joker",
  svg: `<svg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <!-- face -->
    <circle cx='100' cy='100' r='40' stroke='black' stroke-width='3' fill='white'/>
    <!-- eyes -->
    <circle cx='85' cy='90' r='5' stroke='black' stroke-width='2' fill='white'/>
    <circle cx='115' cy='90' r='5' stroke='black' stroke-width='2' fill='white'/>
    <!-- smile -->
    <path d='M80 115 Q100 135 120 115' stroke='black' stroke-width='2' fill='none'/>
    <!-- hat -->
    <polygon points='60,65 100,30 140,65' stroke='black' stroke-width='3' fill='white'/>
    <!-- hat balls -->
    <circle cx='100' cy='30' r='5' stroke='black' stroke-width='2' fill='white'/>
  </svg>`
}
,
  {
    name: "Flower",
    svg: `<svg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='100' cy='100' r='30' stroke='black' stroke-width='3' fill='white'/><ellipse cx='100' cy='60' rx='20' ry='40' stroke='black' stroke-width='3' fill='white'/><ellipse cx='100' cy='140' rx='20' ry='40' stroke='black' stroke-width='3' fill='white'/><ellipse cx='60' cy='100' rx='40' ry='20' stroke='black' stroke-width='3' fill='white'/><ellipse cx='140' cy='100' rx='40' ry='20' stroke='black' stroke-width='3' fill='white'/></svg>`
  },
  {
    name: "Sun",
    svg: `<svg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='100' cy='100' r='40' stroke='black' stroke-width='3' fill='white'/><g stroke='black' stroke-width='3'><line x1='100' y1='10' x2='100' y2='40'/><line x1='100' y1='160' x2='100' y2='190'/><line x1='10' y1='100' x2='40' y2='100'/><line x1='160' y1='100' x2='190' y2='100'/><line x1='40' y1='40' x2='60' y2='60'/><line x1='160' y1='40' x2='140' y2='60'/><line x1='40' y1='160' x2='60' y2='140'/><line x1='160' y1='160' x2='140' y2='140'/></g></svg>`
  },
  {
    name: "House",
    svg: `<svg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'><rect x='50' y='100' width='100' height='70' stroke='black' stroke-width='3' fill='white'/><polygon points='50,100 100,50 150,100' stroke='black' stroke-width='3' fill='white'/><rect x='85' y='140' width='30' height='30' stroke='black' stroke-width='2' fill='white'/></svg>`
  },
];


const creativeShapes = [
  {
    name: "Circle",
    svg: <circle cx="50" cy="50" r="40" stroke="black" strokeWidth="3" fill="white" />,
  },
  {
    name: "Square",
    svg: <rect x="10" y="10" width="80" height="80" stroke="black" strokeWidth="3" fill="white" />,
  },
  {
    name: "Triangle",
    svg: <polygon points="50,10 90,90 10,90" stroke="black" strokeWidth="3" fill="white" />,
  },
  {
    name: "Star",
    svg: <polygon points="50,10 61,35 88,35 66,55 75,80 50,65 25,80 34,55 12,35 39,35" stroke="black" strokeWidth="3" fill="white" />,
  },
  {
    name: "Heart",
    svg: <path d="M50 80 Q20 50 50 30 Q80 50 50 80 Z" stroke="black" strokeWidth="3" fill="white" />,
  },
];

interface DrawingGameProps {
  onGameComplete: (score: number, timeSpent: number) => void;
}

export const DrawingGame = ({ onGameComplete }: DrawingGameProps) => {
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState("#e84d6fe0");
  const [brushSize, setBrushSize] = useState(5);
  const [mode, setMode] = useState<'drawing' | 'coloring'>("drawing");
  const [selectedOutline, setSelectedOutline] = useState<number | null>(null);
  const [svgColor, setSvgColor] = useState<string>("#e34e4eff");
  const [creativeMode, setCreativeMode] = useState(false);
  const [placedShapes, setPlacedShapes] = useState<any[]>([]); // {type, color, x, y, id}
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [draggedShapeId, setDraggedShapeId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  
  // ⭐ NEW STATES FOR DRAWING ANALYSIS
  const [strokes, setStrokes] = useState<
    { points: { x: number; y: number }[]; color: string; size: number }[]
  >([]);
  const currentStroke = useRef<{ x: number; y: number }[]>([]);
  const [colorUsage, setColorUsage] = useState<Map<string, number>>(new Map());
  
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
    "#DDA0DD", "#F8BBD9", "#FFB347", "#98D8C8", "#A8E6CF"
  ];

  const startDrawing = (e: React.MouseEvent) => {
    setIsDrawing(true);
    currentStroke.current = [];
    draw(e);
  };
  
  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.strokeStyle = currentColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    // ⭐ Track stroke path
    currentStroke.current.push({ x, y });
  };

  const stopDrawing = () => {
    setIsDrawing(false);

    if (currentStroke.current.length > 0) {
      // Add stroke with its color and size
      setStrokes((prev) => [...prev, { 
        points: currentStroke.current, 
        color: currentColor,
        size: brushSize 
      }]);
      
      // Track color usage
      setColorUsage(prev => {
        const newMap = new Map(prev);
        const count = newMap.get(currentColor) || 0;
        newMap.set(currentColor, count + 1);
        return newMap;
      });
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    ctx?.beginPath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    
    // ⭐ Reset stroke tracking
    setStrokes([]);
    setColorUsage(new Map());
    
    toast({
      title: "🎨 Canvas Cleared!",
      description: "Ready for your next masterpiece!",
      duration: 1000,
    });
  };

  const createMasterpiece = () => {
    setScore(prev => prev + 100);
    toast({
      title: "🎨 Masterpiece Created!",
      description: "Your artistic skills are amazing!",
      duration: 2000,
    });
  };
  
  // ⭐ IMPROVED DRAWING ANALYSIS FUNCTION
  const analyzeDrawingQuality = (): {
    category: string;
    score: number;
    details: { strokes: number; colors: number; curves: number; patterns: number; coverage: number };
  } => {
    if (strokes.length === 0) return { 
      category: "No Drawing",
      score: 0,
      details: {
        strokes: 0,
        colors: 0,
        curves: 0,
        patterns: 0,
        coverage: 0
      }
    };

    // Count strokes
    const strokeCount = strokes.length;
    
    // Calculate total length
    let totalLength = 0;
    let angleChanges = 0;
    let closedShapes = 0;
    let complexity = 0;
    
    // Track color variety
    const uniqueColors = colorUsage.size;
    
    // Track drawing bounds
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    strokes.forEach((stroke) => {
      const pts = stroke.points;
      if (pts.length < 3) return;

      // Calculate stroke length
      for (let i = 1; i < pts.length; i++) {
        const dx = pts[i].x - pts[i - 1].x;
        const dy = pts[i].y - pts[i - 1].y;
        totalLength += Math.hypot(dx, dy);

        // Update bounds
        minX = Math.min(minX, pts[i].x);
        minY = Math.min(minY, pts[i].y);
        maxX = Math.max(maxX, pts[i].x);
        maxY = Math.max(maxY, pts[i].y);

        // Detect angle changes (curves)
        if (i > 1) {
          const dx1 = pts[i - 1].x - pts[i - 2].x;
          const dy1 = pts[i - 1].y - pts[i - 2].y;
          const dx2 = pts[i].x - pts[i - 1].x;
          const dy2 = pts[i].y - pts[i - 1].y;

          const angle1 = Math.atan2(dy1, dx1);
          const angle2 = Math.atan2(dy2, dx2);
          const angleDiff = Math.abs(angle2 - angle1);
          
          if (angleDiff > 0.5) angleChanges++;
        }
      }

      // Detect closed shape (potential circle/loop)
      const start = pts[0];
      const end = pts[pts.length - 1];
      const distance = Math.hypot(end.x - start.x, end.y - start.y);
      if (distance < 30 && pts.length > 10) {
        closedShapes++;
      }
    });

    // Calculate coverage area
    const width = maxX - minX;
    const height = maxY - minY;
    const area = width * height;
    const canvasArea = 600 * 400;
    const coverageRatio = area / canvasArea;

    // ⭐ COMPREHENSIVE SCORING SYSTEM
    
    // Base score from stroke count (more strokes = more effort)
    let totalScore = 0;
    
    // Stroke count scoring (0-30 points)
    if (strokeCount >= 20) totalScore += 30;
    else if (strokeCount >= 10) totalScore += 20;
    else if (strokeCount >= 5) totalScore += 10;
    else totalScore += strokeCount * 2;

    // Color variety scoring (0-20 points)
    if (uniqueColors >= 5) totalScore += 20;
    else if (uniqueColors >= 3) totalScore += 15;
    else if (uniqueColors >= 2) totalScore += 10;
    else totalScore += 5;

    // Complexity scoring (angle changes) (0-25 points)
    if (angleChanges > 50) totalScore += 25;
    else if (angleChanges > 30) totalScore += 20;
    else if (angleChanges > 15) totalScore += 15;
    else if (angleChanges > 5) totalScore += 10;
    else totalScore += 5;

    // Coverage scoring (0-15 points)
    if (coverageRatio > 0.5) totalScore += 15;
    else if (coverageRatio > 0.3) totalScore += 10;
    else if (coverageRatio > 0.1) totalScore += 5;

    // Closed shapes/patterns scoring (0-10 points)
    if (closedShapes >= 3) totalScore += 10;
    else if (closedShapes >= 1) totalScore += 5;

    // ⭐ CATEGORIZATION BASED ON SCORE
    
    let category = "";
    if (totalScore >= 80) {
      category = "🌟 Masterpiece! Detailed artwork with rich colors";
    } else if (totalScore >= 60) {
      category = "🎨 Great Drawing! Shows good effort and creativity";
    } else if (totalScore >= 40) {
      category = "✏️ Good Start! Keep adding more details";
    } else if (totalScore >= 20) {
      category = "🖍️ Basic Drawing - Try using more colors and strokes";
    } else {
      category = "⚡ Quick Scribble - Practice making detailed drawings";
    }

    // Additional context for scribble detection
    if (strokeCount < 5 && uniqueColors < 2 && coverageRatio < 0.2) {
      category = "📝 Quick Scribble - Try drawing something specific!";
    } else if (strokeCount > 15 && uniqueColors > 3 && closedShapes > 2) {
      category = "🏆 Excellent Work! Very detailed and creative!";
    }

    return {
      category,
      score: totalScore,
      details: {
        strokes: strokeCount,
        colors: uniqueColors,
        curves: angleChanges,
        patterns: closedShapes,
        coverage: Math.round(coverageRatio * 100)
      }
    };
  };

  const endGame = () => {
    const timeSpent = (Date.now() - startTime) / 1000;
    const analysis = analyzeDrawingQuality();
    
    // ⭐ Update score based on drawing quality
    const qualityScore = analysis.score;
    const finalScore = score + qualityScore;
    setScore(finalScore);

    onGameComplete(finalScore, timeSpent);

    // ⭐ Detailed feedback toast
    toast({
      title: "🎨 Drawing Analysis Complete!",
      description: (
        <div className="mt-2 space-y-1">
          <p className="font-semibold">{analysis.category}</p>
          <p>📊 Stats:</p>
          <p>  • Strokes: {analysis.details.strokes}</p>
          <p>  • Colors used: {analysis.details.colors}</p>
          <p>  • Curves: {analysis.details.curves}</p>
          <p>  • Patterns: {analysis.details.patterns}</p>
          <p>  • Coverage: {analysis.details.coverage}%</p>
          <p className="text-lg font-bold mt-1">Score: +{qualityScore} points!</p>
        </div>
      ),
      duration: 5000,
    });
  };

  // Coloring SVG logic: replace fill color on click
  useEffect(() => {
    // Reset colors when switching images
    if (svgContainerRef.current && selectedOutline !== null) {
      const svgEl = svgContainerRef.current.querySelector('svg');
      if (svgEl) {
        const fillables = svgEl.querySelectorAll('[fill="white"]');
        fillables.forEach((el) => {
          (el as SVGElement).setAttribute('fill', 'white');
        });
      }
    }
  }, [selectedOutline]);

  const handleSvgPartClick = (e: React.MouseEvent) => {
    const target = e.target as SVGElement;
    if (target && target.getAttribute('fill') === 'white') {
      target.setAttribute('fill', svgColor);
      setScore((prev) => prev + 10);
      
      // ⭐ Track color usage in coloring mode
      setColorUsage(prev => {
        const newMap = new Map(prev);
        const count = newMap.get(svgColor) || 0;
        newMap.set(svgColor, count + 1);
        return newMap;
      });
    }
  };

  // Add shape to canvas at default position
  const handleAddShape = (shapeIdx: number) => {
    setPlacedShapes((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        type: shapeIdx,
        color: "white",
        x: 300 + Math.random() * 100, // randomize a bit
        y: 150 + Math.random() * 100,
      },
    ]);
    setScore((prev) => prev + 5);
  };

  // Color a shape by clicking
  const handleShapeClick = (id: number) => {
    setPlacedShapes((prev) => prev.map(s => s.id === id ? { ...s, color: currentColor } : s));
    setScore((prev) => prev + 10);
    
    // ⭐ Track color usage for shapes
    setColorUsage(prev => {
      const newMap = new Map(prev);
      const count = newMap.get(currentColor) || 0;
      newMap.set(currentColor, count + 1);
      return newMap;
    });
  };

  // Mouse/touch handlers for dragging shapes
  const handleShapeMouseDown = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const svgRect = (e.target as SVGElement).ownerSVGElement?.getBoundingClientRect();
    if (!svgRect) return;
    const shape = placedShapes.find((s) => s.id === id);
    if (!shape) return;
    setDraggedShapeId(id);
    setDragOffset({
      x: e.clientX - shape.x,
      y: e.clientY - shape.y,
    });
  };

  const handleSvgMouseMove = (e: React.MouseEvent) => {
    if (draggedShapeId !== null && dragOffset) {
      setPlacedShapes((prev) =>
        prev.map((s) =>
          s.id === draggedShapeId
            ? { ...s, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }
            : s
        )
      );
    }
  };

  const handleSvgMouseUp = () => {
    setDraggedShapeId(null);
    setDragOffset(null);
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          backgroundImage: 'url(/drawing-background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
      <div className="max-w-4xl mx-auto p-6 space-y-6 relative z-10">
      <div className="text-center space-y-4">
        <div className="text-6xl animate-bounce">🎨</div>
          <h1 className="text-4xl font-bold text-art">Drawing & Coloring</h1>
        <p className="text-lg text-muted-foreground">
          Create beautiful artwork with colors and brushes!
        </p>
      </div>

        {/* Mode Selector */}
        <div className="flex justify-center gap-4 mb-6">
          <Button
            variant={mode === 'drawing' ? 'default' : 'outline'}
            onClick={() => setMode('drawing')}
          >
            Drawing
          </Button>
          <Button
            variant={mode === 'coloring' ? 'default' : 'outline'}
            onClick={() => setMode('coloring')}
          >
            Coloring
          </Button>
        </div>

        {mode === 'drawing' && (
      <Card className="p-8 bg-gradient-to-br from-art/10 to-art/20">
        <div className="flex justify-between items-center mb-6">
          <div className="text-2xl font-bold text-art">Score: {score}</div>
          <div className="text-lg text-art">
            Strokes: {strokes.length} | Colors: {colorUsage.size}
          </div>
        </div>

        {/* Color Palette */}
        <div className="flex justify-center space-x-2 mb-4">
          {colors.map((color) => (
            <Button
              key={color}
              onClick={() => setCurrentColor(color)}
              className={`
                w-10 h-10 rounded-full border-4 transition-all duration-200
                ${currentColor === color ? 'border-art scale-110' : 'border-white hover:scale-105'}
              `}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Brush Size */}
        <div className="flex justify-center items-center space-x-4 mb-6">
          <span className="text-art font-semibold">Brush Size:</span>
          {[2, 5, 10, 15].map((size) => (
            <Button
              key={size}
              onClick={() => setBrushSize(size)}
              className={`
                w-12 h-12 rounded-full transition-all duration-200
                ${brushSize === size ? 'bg-art text-art-foreground' : 'bg-art/20 text-art hover:bg-art/30'}
              `}
            >
              {size}
            </Button>
          ))}
        </div>

            <div className="flex">
              {/* Creative Mode Sidebar */}
              {creativeMode && (
                <div className="mr-6 flex flex-col items-center gap-4">
                  <div className="font-bold text-art mb-2">Shapes</div>
                  {creativeShapes.map((shape, idx) => (
                    <div key={shape.name} className="cursor-pointer hover:scale-110 transition-transform" onClick={() => handleAddShape(idx)}>
                      <svg width="50" height="50" viewBox="0 0 100 100">{shape.svg}</svg>
                      <div className="text-xs text-center">{shape.name}</div>
                    </div>
                  ))}
                </div>
              )}
              {/* Drawing Canvas with SVG overlay for shapes */}
              <div className="flex justify-center items-center w-full" style={{ minHeight: 400 }}>
                <div className="bg-white rounded-lg mb-6 relative flex justify-center items-center" style={{ width: 600, height: 400 }}>
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="border-2 border-art/30 rounded-lg cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
                    style={{ position: 'absolute', left: 0, top: 0, zIndex: 1, background: 'transparent' }}
                  />
                  {/* SVG overlay for shapes */}
                  <svg
                    width={600}
                    height={400}
                    style={{ position: 'absolute', left: 0, top: 0, zIndex: 2, pointerEvents: 'none' }}
                    onMouseMove={handleSvgMouseMove}
                    onMouseUp={handleSvgMouseUp}
                    onMouseLeave={handleSvgMouseUp}
                  >
                    {placedShapes.map((shape) => {
                      const ShapeSvg = creativeShapes[shape.type].svg;
                      return (
                        <g
                          key={shape.id}
                          transform={`translate(${shape.x - 50},${shape.y - 50})`}
                          style={{ cursor: draggedShapeId === shape.id ? 'grabbing' : 'grab', pointerEvents: 'all' }}
                          onMouseDown={(e) => handleShapeMouseDown(e, shape.id)}
                          onClick={(e) => {
                            // Only color if not dragging
                            if (!draggedShapeId) {
                              e.stopPropagation();
                              handleShapeClick(shape.id);
                            }
                          }}
                        >
                          {React.cloneElement(ShapeSvg, { fill: shape.color })}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Button
            onClick={clearCanvas}
            className="bg-art/20 hover:bg-art/30 text-art p-4 h-16"
          >
            <Eraser className="w-6 h-6 mr-2" />
            Clear Canvas
          </Button>
          <Button
            onClick={createMasterpiece}
            className="bg-art/20 hover:bg-art/30 text-art p-4 h-16"
          >
            <Palette className="w-6 h-6 mr-2" />
            Masterpiece
          </Button>
          <Button
                onClick={() => setCreativeMode((v) => !v)}
                className={`bg-art/20 hover:bg-art/30 text-art p-4 h-16 ${creativeMode ? 'ring-2 ring-art' : ''}`}
          >
            <Brush className="w-6 h-6 mr-2" />
            Creative Mode
          </Button>
        </div>

        <div className="text-center">
          <Button
            onClick={endGame}
            className="bg-art hover:bg-art/90 text-art-foreground px-8 py-3 text-lg"
          >
            <Palette className="w-5 h-5 mr-2" />
            Finish Artwork
          </Button>
        </div>
      </Card>
        )}

        {mode === 'coloring' && (
          <Card className="p-8 bg-gradient-to-br from-art/10 to-art/20">
            {!selectedOutline ? (
              <>
                <div className="text-xl font-semibold mb-4 text-art">Choose a picture to color:</div>
                <div className="flex gap-8 justify-center flex-wrap">
                  {outlineImages.map((img, idx) => (
                    <div key={img.name} className="cursor-pointer hover:scale-105 transition-transform" onClick={() => setSelectedOutline(idx)}>
                      <div dangerouslySetInnerHTML={{ __html: img.svg }} />
                      <div className="text-center mt-2">{img.name}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center">
                  <div className="mb-4">
                    <Button onClick={() => setSelectedOutline(null)} variant="outline">Back to Gallery</Button>
                  </div>
                  <div className="flex gap-4 mb-4">
                    {colors.map((color) => (
                      <Button
                        key={color}
                        onClick={() => setSvgColor(color)}
                        className={`w-10 h-10 rounded-full border-4 ${svgColor === color ? 'border-art scale-110' : 'border-white hover:scale-105'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="bg-white rounded-lg p-4 mb-6 flex justify-center">
                    <div
                      ref={svgContainerRef}
                      dangerouslySetInnerHTML={{ __html: outlineImages[selectedOutline].svg }}
                      onClick={handleSvgPartClick as any}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  <Button onClick={() => {
                    setScore((prev) => prev + 50);
                    toast({
                      title: "🎨 Coloring Complete!",
                      description: `You used ${colorUsage.size} different colors!`,
                      duration: 2000,
                    });
                  }} className="bg-art/20 hover:bg-art/30 text-art p-4 h-16">
                    Finish Coloring
                  </Button>
                </div>
              </>
            )}
          </Card>
        )}
    </div>
    </>
  );
};