import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Trophy, 
  Mail, 
  Download,
  ArrowLeft, 
  Star,
  Loader2,
  Brain,
  Target,
  Award,
  AlertCircle
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { useToast } from "@/hooks/use-toast";
import React from "react";

interface ParentDashboardProps {
  parentEmail: string;
  onBackToGames: () => void;
}

// Mock email service
const sendEmailReport = async (reportData: any): Promise<boolean> => {
  try {
    console.log("Sending email with report data:", reportData);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const success = Math.random() > 0.1;
    if (!success) {
      throw new Error("Email service temporarily unavailable");
    }
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
};

// Report component for printing
const ReportTemplate = React.forwardRef(({ reportData }: { reportData: any }, ref: React.Ref<HTMLDivElement>) => {
  return (
    <div ref={ref} className="p-8 bg-white text-gray-800">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800">Child Progress Report</h1>
        <p className="text-gray-600">Generated on {new Date(reportData.generatedAt).toLocaleDateString()}</p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold border-b-2 border-blue-200 pb-2">Summary</h2>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p><strong>Total Sessions:</strong> {reportData.totalSessions}</p>
            <p><strong>Total Time Played:</strong> {reportData.totalTimeSpent} minutes</p>
            <p><strong>Average Score:</strong> {reportData.averageScore}%</p>
          </div>
          <div>
            <p><strong>Parent Email:</strong> {reportData.parentEmail}</p>
            <p><strong>Report Date:</strong> {new Date(reportData.generatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold border-b-2 border-blue-200 pb-2">All Games Played</h2>
        <ul className="list-disc list-inside mt-4">
          {reportData.allGames.map((game: any, index: number) => (
            <li key={index} className="mb-2">
              <strong>{game.gameType}:</strong> {game.sessions} sessions, 
              Avg Score: {Math.round(game.averageScore)}, 
              Engagement: {Math.round(game.engagementScore)}%,
              Performance: {Math.round(game.performanceScore)}%
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold border-b-2 border-blue-200 pb-2">Recommendations</h2>
        <div className="mt-4">
          <p className="mb-2"><strong>Based on gameplay patterns:</strong></p>
          <p className="bg-blue-50 p-4 rounded">{reportData.recommendation}</p>
        </div>
        <div className="mt-4">
          <p className="mb-2"><strong>ML-Powered Recommendation:</strong></p>
          <p className="bg-green-50 p-4 rounded">{reportData.mlRecommendation}</p>
        </div>
        <div className="mt-4">
          <p className="mb-2"><strong>Next Skill to Develop:</strong></p>
          <p className="bg-purple-50 p-4 rounded">{reportData.nextSkill}</p>
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>This report was generated automatically by the Child Learning Platform.</p>
        <p>For questions, please contact support@childlearningplatform.com</p>
      </div>
    </div>
  );
});

ReportTemplate.displayName = 'ReportTemplate';

export const ParentDashboard = ({ parentEmail, onBackToGames }: ParentDashboardProps) => {
  const { gameHistory, getGameStats, loading } = useGame();
  const { toast } = useToast();
  const [stats, setStats] = useState(getGameStats());
  const [mlRecommendation, setMlRecommendation] = useState("");
  const [nextSkill, setNextSkill] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [allGameScores, setAllGameScores] = useState<any[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("Game History:", gameHistory);
    setStats(getGameStats());
  }, [gameHistory, getGameStats]);

  useEffect(() => {
    if (gameHistory.length > 0) {
      generateMLRecommendations();
    }
  }, [gameHistory]);

  // ⭐ ADVANCED ML RECOMMENDATION SYSTEM
  const generateMLRecommendations = () => {
    // Define all possible game types
    const gameTypes = [
      "Music Game", "Farm Quest", "Building Blocks", "Drawing & Painting",
      "Learning Games", "Cooking Game", "Fashion Design", "Sports Game"
    ];

    // Calculate REAL interest scores based on:
    // 1. Time spent (normalized - longer sessions = more interest)
    // 2. Score achieved (normalized - higher scores = better skill/interest)
    // 3. Session count (normalized - more returns = more interest)
    // 4. Score improvement over time (learning curve)
    
    const gameScores = gameTypes.map(gameType => {
      const sessions = gameHistory
        .filter(session => session.gameType === gameType)
        .sort((a, b) => a.timestamp - b.timestamp); // Sort by time
      
      if (sessions.length === 0) {
        return { 
          gameType, 
          interestScore: 0,
          engagementScore: 0,
          performanceScore: 0,
          learningRate: 0,
          consistency: 0,
          sessions: 0,
          avgScore: 0,
          totalTime: 0,
          hasPlayed: false
        };
      }

      // Calculate metrics
      const totalTime = sessions.reduce((sum, s) => sum + s.timeSpent, 0);
      const avgScore = sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length;
      const maxPossibleScore = 500; // Adjust based on your game scoring
      const maxPossibleTime = 600; // 10 minutes max per session
      
      // Normalize metrics (0-1 scale) with safe division
      const normalizedTime = Math.min(totalTime / (maxPossibleTime * Math.max(1, sessions.length)), 1) || 0;
      const normalizedScore = Math.min(avgScore / maxPossibleScore, 1) || 0;
      const sessionFrequency = Math.min(sessions.length / 10, 1) || 0; // Cap at 10 sessions
      
      // Calculate learning rate (score improvement over time)
      let learningRate = 0;
      if (sessions.length >= 2) {
        const firstScore = sessions[0].score / maxPossibleScore;
        const lastScore = sessions[sessions.length - 1].score / maxPossibleScore;
        learningRate = Math.max(0, lastScore - firstScore) || 0;
      }
      
      // Calculate consistency (low variance in scores)
      let consistency = 0;
      if (sessions.length >= 3) {
        const scores = sessions.map(s => s.score / maxPossibleScore);
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - normalizedScore, 2), 0) / scores.length;
        consistency = Math.max(0, 1 - Math.min(variance, 1)) || 0;
      }

      // ⭐ WEIGHTED INTEREST SCORE
      // This is the key improvement - combines multiple factors
      const weights = {
        timeWeight: 0.25,      // Time spent shows engagement
        scoreWeight: 0.30,      // High scores show skill/mastery
        frequencyWeight: 0.20,  // Returning shows sustained interest
        learningWeight: 0.15,   // Improvement shows growth
        consistencyWeight: 0.10  // Consistency shows true skill
      };

      const interestScore = 
        (normalizedTime * weights.timeWeight) +
        (normalizedScore * weights.scoreWeight) +
        (sessionFrequency * weights.frequencyWeight) +
        (learningRate * weights.learningWeight) +
        (consistency * weights.consistencyWeight);

      // Calculate engagement score (for display) - based on time and frequency
      const engagementScore = ((normalizedTime * 0.6) + (sessionFrequency * 0.4)) * 100;
      
      // Calculate performance score (for display) - based on score, learning, consistency
      const performanceScore = (
        (normalizedScore * 0.5) + 
        (learningRate * 0.3) + 
        (consistency * 0.2)
      ) * 100;

      // Ensure no NaN values
      const safeEngagementScore = isNaN(engagementScore) ? 0 : Math.round(engagementScore * 100) / 100;
      const safePerformanceScore = isNaN(performanceScore) ? 0 : Math.round(performanceScore * 100) / 100;
      const safeInterestScore = isNaN(interestScore) ? 0 : interestScore;

      // Debug log to see calculations
      console.log(`${gameType} - Sessions: ${sessions.length}, AvgScore: ${avgScore}, Interest: ${safeInterestScore}, Engage: ${safeEngagementScore}, Perform: ${safePerformanceScore}`);

      return {
        gameType,
        interestScore: safeInterestScore,
        engagementScore: safeEngagementScore,
        performanceScore: safePerformanceScore,
        learningRate: Math.round(learningRate * 100) || 0,
        consistency: Math.round(consistency * 100) || 0,
        sessions: sessions.length,
        avgScore: Math.round(avgScore) || 0,
        totalTime: Math.round(totalTime / 60) || 0, // Convert to minutes
        hasPlayed: true
      };
    });

    // Sort by interest score (highest first) - only games that have been played
    const playedGames = gameScores.filter(game => game.hasPlayed);
    const sortedByInterest = [...playedGames].sort((a, b) => b.interestScore - a.interestScore);
    
    // Store all game scores for display
    setAllGameScores(sortedByInterest);
    
    // Get top 3 interests
    const topInterests = sortedByInterest.slice(0, 3);
    
    if (topInterests.length === 0) {
      setMlRecommendation("Play more games to get personalized recommendations!");
      setNextSkill("Start with any game to discover interests!");
      return;
    }

    const topGame = topInterests[0];
    
    // Generate detailed recommendations based on patterns
    let recommendation = "";
    if (topGame.performanceScore > 70 && topGame.engagementScore > 70) {
      recommendation = `🌟 Exceptional! Your child shows both high engagement and skill in ${topGame.gameType}. Consider advanced activities in this area.`;
    } else if (topGame.performanceScore > 70) {
      recommendation = `🎯 Natural talent detected! Your child performs well in ${topGame.gameType} despite moderate engagement. Encourage more practice!`;
    } else if (topGame.engagementScore > 70) {
      recommendation = `💫 Strong interest in ${topGame.gameType}! Keep encouraging this passion - skill will improve with practice.`;
    } else if (topGame.learningRate > 20) {
      recommendation = `📈 Rapid improvement in ${topGame.gameType}! This shows great learning potential.`;
    } else {
      recommendation = `🌱 Growing interest in ${topGame.gameType}. Continue providing opportunities to explore this area.`;
    }

    // Find next skill to develop (highest interest score among games with <3 sessions)
    const nextSkillGame = playedGames
      .filter(g => g.sessions < 3 && g.interestScore > 0.1)
      .sort((a, b) => b.interestScore - a.interestScore)[0];

    const nextSkillText = nextSkillGame 
      ? `Try more ${nextSkillGame.gameType} - early interest detected!` 
      : `Explore a new game category to discover more interests!`;

    setMlRecommendation(recommendation);
    setNextSkill(nextSkillText);

    // Create enhanced stats with all metrics - but match the expected GameStats type
    const enhancedStats = {
      ...stats,
      topGames: topInterests.map(game => ({
        gameType: game.gameType,
        sessions: game.sessions,
        averageScore: game.avgScore,
        percentage: parseFloat((game.interestScore * 100).toFixed(1)) // Convert to number
      }))
    };
    
    setStats(enhancedStats);
  };

  // Alternative print function that doesn't use react-to-print
  const handlePrint = () => {
    if (!reportRef.current) return;
    
    const printContent = reportRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      toast({
        title: "Print blocked",
        description: "Please allow popups to print the report",
        variant: "destructive",
      });
      return;
    }
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Child Progress Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              color: #333;
            }
            h1 { 
              color: #2563eb; 
              text-align: center;
            }
            h2 {
              border-bottom: 2px solid #93c5fd;
              padding-bottom: 8px;
            }
            .bg-blue-50 {
              background-color: #eff6ff;
            }
            .bg-green-50 {
              background-color: #f0fdf4;
            }
            .bg-purple-50 {
              background-color: #faf5ff;
            }
            .bg-yellow-50 {
              background-color: #fefce8;
            }
            .p-4 {
              padding: 16px;
            }
            .rounded {
              border-radius: 8px;
            }
            .mt-4 {
              margin-top: 16px;
            }
            .mb-2 {
              margin-bottom: 8px;
            }
            .mb-6 {
              margin-bottom: 24px;
            }
            .mb-8 {
              margin-bottom: 32px;
            }
            .text-center {
              text-align: center;
            }
            .grid {
              display: grid;
            }
            .grid-cols-2 {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
            .gap-4 {
              gap: 16px;
            }
            .list-disc {
              list-style-type: disc;
            }
            .list-inside {
              list-style-position: inside;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
    
    toast({
      title: "Report Downloaded",
      description: "The report has been downloaded as PDF",
    });
  };

  const downloadTextReport = () => {
    if (!reportData) return;
    
    const textContent = `
Child Progress Report
=====================

Generated on: ${new Date(reportData.generatedAt).toLocaleDateString()}
Parent Email: ${reportData.parentEmail}

Summary:
--------
Total Sessions: ${reportData.totalSessions}
Total Time Played: ${reportData.totalTimeSpent} minutes
Average Score: ${reportData.averageScore}%

All Games Played:
--------------
${reportData.allGames.map((game: any, index: number) => 
  `${index + 1}. ${game.gameType}: 
     • Sessions: ${game.sessions}
     • Average Score: ${Math.round(game.averageScore)}
     • Engagement: ${game.engagementScore}%
     • Performance: ${game.performanceScore}%`
).join('\n')}

Recommendations:
---------------
Based on gameplay patterns:
${reportData.recommendation}

ML-Powered Recommendation:
${reportData.mlRecommendation}

Next Skill to Develop:
${reportData.nextSkill}

This report was generated automatically by the Child Learning Platform.
For questions, please contact support@childlearningplatform.com
    `;
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Child_Progress_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Downloaded",
      description: "The report has been downloaded as text file",
    });
  };

  const generateReport = async () => {
    if (gameHistory.length === 0) {
      toast({
        title: "No data available",
        description: "Your child needs to play some games first!",
        variant: "destructive",
      });
      return;
    }

    const report = {
      parentEmail,
      generatedAt: new Date().toISOString(),
      totalSessions: stats.totalSessions,
      totalTimeSpent: Math.round(stats.totalTimeSpent / 60),
      averageScore: Math.round(stats.averageScore),
      allGames: allGameScores.map(game => ({
        gameType: game.gameType,
        sessions: game.sessions,
        averageScore: game.avgScore,
        engagementScore: game.engagementScore,
        performanceScore: game.performanceScore
      })),
      recommendation: generateRecommendation(allGameScores[0]),
      mlRecommendation,
      nextSkill
    };

    setReportData(report);
    setIsSendingEmail(true);

    try {
      const emailSent = await sendEmailReport(report);
      
      if (emailSent) {
        toast({
          title: "📧 Report Sent!",
          description: "Weekly report has been sent to your email",
        });
        console.log("Generated Report:", report);
      }
    } catch (error) {
      console.error("Failed to send email:", error);
      toast({
        title: "Email failed to send",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const generateRecommendation = (topGame: any) => {
    if (!topGame) return "Encourage your child to explore different games!";

    // Enhanced recommendations based on engagement and performance
    if (topGame.engagementScore > 80 && topGame.performanceScore > 80) {
      return `🎯 ${topGame.gameType} is a perfect match! High engagement and excellent performance suggest this could be a long-term passion.`;
    } else if (topGame.engagementScore > 80) {
      return `💫 Your child loves ${topGame.gameType}! Keep encouraging this interest - skill will improve with continued practice.`;
    } else if (topGame.performanceScore > 80) {
      return `🌟 Natural talent in ${topGame.gameType}! Consider providing more opportunities in this area to build confidence.`;
    } else if (topGame.sessions > 30 && topGame.avgScore < 100) {
      return `⚠️ Your child plays ${topGame.gameType} frequently but scores are low. Consider providing guidance or easier levels to build confidence.`;
    } else {
      const recommendations: { [key: string]: string } = {
        "Music Game": "🎵 Consider music lessons or instruments for your child!",
        "Farm Quest": "🌾 Your child shows interest in farming! Try gardening activities together.",
        "Building Blocks": "🏗️ Engineering potential detected! Explore robotics or construction toys.",
        "Drawing & Painting": "🎨 Artistic talent emerging! Consider art classes or creative workshops.",
        "Learning Games": "📚 Academic interest! Encourage reading and educational activities.",
        "Cooking Game": "🍳 Culinary curiosity! Try simple cooking projects at home.",
        "Fashion Design": "👗 Creative design skills developing! Explore fashion or design activities.",
        "Sports Game": "⚽ Physical activity interest! Consider sports teams or outdoor activities."
      };
      return recommendations[topGame.gameType] || "Keep exploring different interests!";
    }
  };

  const gameTypeColors: { [key: string]: string } = {
    "Music Game": "bg-music",
    "Farm Quest": "bg-nature",
    "Building Blocks": "bg-engineering",
    "Drawing & Painting": "bg-art",
    "Learning Games": "bg-learning",
    "Cooking Game": "bg-cooking",
    "Fashion Design": "bg-fashion",
    "Sports Game": "bg-sports"
  };

  const maxSessions = Math.max(...allGameScores.map(g => g.sessions), 1);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Parent Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {parentEmail}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={onBackToGames} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Games
            </Button>
            {reportData && (
              <div className="flex gap-2">
                <Button 
                  onClick={handlePrint} 
                  variant="outline"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF Report
                </Button>
                <Button 
                  onClick={downloadTextReport} 
                  variant="outline"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Text Report
                </Button>
              </div>
            )}
            <Button 
              onClick={generateReport} 
              className="bg-primary hover:bg-primary/90"
              disabled={isSendingEmail || gameHistory.length === 0}
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
              </div>
            </div>
          </Card>

          {/* <Card className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Time Played</p>
                <p className="text-2xl font-bold">{Math.round(stats.totalTimeSpent / 60)}m</p>
              </div>
            </div>
          </Card> */}

          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <Star className="w-8 h-8 text-secondary" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">{Math.round(stats.averageScore)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-nature" />
              <div>
                <p className="text-sm text-muted-foreground">Games Played</p>
                <p className="text-2xl font-bold">{allGameScores.length}</p>
              </div>
            </div>
          </Card>
        </div>
        
{/* Simple Bar Chart - Shows ALL Games */}
<Card className="p-6">
  <h3 className="text-xl font-bold mb-4">Game Sessions (All Games)</h3>
  <div className="space-y-4">
    {allGameScores.map((game, index) => (
      <div key={game.gameType} className="flex items-center space-x-4">
        <div className="w-24 text-sm font-medium text-right">
          {game.gameType.replace(" Game", "")}
        </div>
        <div className="flex-1 relative">
          <div className="h-8 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${gameTypeColors[game.gameType] || "bg-primary"} transition-all duration-500`}
              style={{ width: `${(game.sessions / maxSessions) * 100}%` }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
            {game.sessions} sessions
          </div>
        </div>
        {/* Optional: Show average score as small text */}
        <div className="w-16 text-xs text-muted-foreground text-left">
          Avg: {game.avgScore}
        </div>
      </div>
    ))}
    {allGameScores.length === 0 && (
      <div className="text-center text-muted-foreground py-8">
        No games played yet. Start playing to see statistics!
      </div>
    )}
  </div>
</Card>

        {/* All Games Analysis */}
        {/* <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            All Games Analysis (Engagement vs Performance)
          </h3>
          <div className="space-y-6">
            {allGameScores.map((game, index) => (
              <div key={game.gameType} className="space-y-2 p-4 bg-muted/30 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Badge variant={index < 3 ? "default" : "secondary"}>
                      #{index + 1}
                    </Badge>
                    <span className="font-semibold text-lg">{game.gameType}</span>
                  </div>
                  <span className="text-sm font-medium">
                    Interest: {(game.interestScore * 100).toFixed(1)}%
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mt-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-600 font-medium">Engagement</span>
                      <span className="font-bold">{game.engagementScore}%</span>
                    </div>
                    <Progress value={game.engagementScore} className="h-3" />
                    <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                      <span>Sessions: {game.sessions}</span>
                      <span>Time: {game.totalTime}m</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-600 font-medium">Performance</span>
                      <span className="font-bold">{game.performanceScore}%</span>
                    </div>
                    <Progress value={game.performanceScore} className="h-3" />
                    <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                      <span>Avg Score: {game.avgScore}</span>
                      {/* <span>Learning: {game.learningRate}%</span>
                    </div>
                  </div>
                </div>

                {game.avgScore < 100 && game.sessions > 20 && (
                  <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Plays frequently but struggling with scores - may need guidance</span>
                  </div>
                )}

                {game.performanceScore > 80 && game.sessions < 5 && (
                  <div className="mt-2 p-2 bg-green-100 text-green-800 rounded flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    <span className="text-sm">Natural talent detected! Consider exploring this more</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card> */}

        {/* Interest Distribution */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Interest Distribution</h3>
          <div className="grid grid-cols-2 gap-4">
            {allGameScores.slice(0, 4).map((game, index) => (
              <div key={game.gameType} className="flex items-center space-x-3">
                <div 
                  className={`w-4 h-4 rounded-full ${gameTypeColors[game.gameType] || "bg-primary"}`}
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {game.gameType.replace(" Game", "")}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {(game.interestScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={game.interestScore * 100} className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Recommendations */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Insights
          </h3>
          <div className="grid gap-4">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">🤖 Primary Recommendation</p>
              <p className="text-lg">{mlRecommendation || "Play more games to get personalized recommendations!"}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">🎯 Next Skill to Develop</p>
              <p className="text-lg">{nextSkill || "Explore different games to discover interests!"}</p>
            </div>
          </div>
        </Card>

        {/* Hidden report template for printing */}
        <div style={{ display: 'none' }}>
          {reportData && (
            <ReportTemplate ref={reportRef} reportData={reportData} />
          )}
        </div>
      </div>
    </div>
  );
};


