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
  Loader2
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { useToast } from "@/hooks/use-toast";
import { RandomForestClassifier } from 'ml-random-forest';
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
        <h2 className="text-xl font-semibold border-b-2 border-blue-200 pb-2">Top Interests</h2>
        <ul className="list-disc list-inside mt-4">
          {reportData.topInterests.map((interest: any, index: number) => (
            <li key={index} className="mb-2">
              <strong>{interest.gameType}:</strong> {interest.sessions} sessions, Average Score: {Math.round(interest.averageScore)}%
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
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("Game History:", gameHistory);
    setStats(getGameStats());
  }, [gameHistory, getGameStats]);

  useEffect(() => {
    if (gameHistory.length > 0) {
      generateMlRecommendation();
    }
  }, [gameHistory]);

  const generateMlRecommendation = () => {
  // Define passion categories
  const passions = [
    "Music Game", "Farm Quest", "Building Blocks", "Drawing & Painting",
    "Learning Games", "Cooking Game", "Fashion Design", "Sports Game"
  ];

  // Create mapping
  const labelMap = passions.reduce((acc, label, idx) => ({ ...acc, [label]: idx }), {});
  const reverseLabelMap = Object.fromEntries(Object.entries(labelMap).map(([k, v]) => [v, k]));

  // Calculate weighted scores that consider both time spent and average score
  const weightedScores = passions.map(gameType => {
    const sessions = gameHistory.filter(session => session.gameType === gameType);
    
    if (sessions.length === 0) return { gameType, score: 0 };
    
    const totalTime = sessions.reduce((sum, s) => sum + s.timeSpent, 0);
    const avgScore = sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length;
    
    // Create a weighted score that considers both time spent and performance
    // You can adjust these weights based on what's more important
    const timeWeight = 0.6;  // 60% weight to time spent
    const scoreWeight = 0.4; // 40% weight to average score
    
    // Normalize values (assuming max time spent is 600 seconds and max score is 500)
    const normalizedTime = totalTime / 600;
    const normalizedScore = avgScore / 500;
    
    const weightedScore = (timeWeight * normalizedTime) + (scoreWeight * normalizedScore);
    
    return { gameType, score: weightedScore };
  });

  // Sort by weighted score to get top interest
  weightedScores.sort((a, b) => b.score - a.score);
  const topPassionLabel = weightedScores[0].gameType;

  // Recommendations
  const recommendations = {
    "Music Game": "🎵 Consider music lessons or instruments for your child!",
    "Farm Quest": "🌾 Your child loves farming! Explore crops, animals, and fun farm activities.",
    "Building Blocks": "🏗️ Engineering potential! Try robotics or construction toys.",
    "Drawing & Painting": "🎨 Artistic talent! Consider art classes or creative workshops.",
    "Learning Games": "📚 Academic excellence! Encourage reading and educational activities.",
    "Cooking Game": "🍳 Culinary interest! Try cooking together at home.",
    "Fashion Design": "👗 Creative design skills! Explore fashion or design activities.",
    "Sports Game": "⚽ Physical activity lover! Consider sports teams or activities."
  };

  setMlRecommendation(
    recommendations[topPassionLabel] || "Keep exploring different interests!"
  );
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

Top Interests:
--------------
${reportData.topInterests.map((interest: any, index: number) => 
  `${index + 1}. ${interest.gameType}: ${interest.sessions} sessions, Average Score: ${Math.round(interest.averageScore)}%`
).join('\n')}

Recommendations:
---------------
Based on gameplay patterns:
${reportData.recommendation}

ML-Powered Recommendation:
${reportData.mlRecommendation}

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
      topInterests: stats.topGames.slice(0, 3),
      recommendation: generateRecommendation(),
      mlRecommendation
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

  const generateRecommendation = () => {
    const topGame = stats.topGames[0];
    if (!topGame) return "Encourage your child to explore different games!";

    const recommendations = {
      "Music Game": "🎵 Consider music lessons or instruments for your child!",
      "Farm Quest": "🌾 Your child loves farming! Explore crops, animals, and fun farm activities.",
      "Building Blocks": "🏗️ Engineering potential! Try robotics or construction toys.",
      "Drawing & Painting": "🎨 Artistic talent! Consider art classes or creative workshops.",
      "Learning Games": "📚 Academic excellence! Encourage reading and educational activities.",
      "Cooking Game": "🍳 Culinary interest! Try cooking together at home.",
      "Fashion Design": "👗 Creative design skills! Explore fashion or design activities.",
      "Sports Game": "⚽ Physical activity lover! Consider sports teams or activities."
    };

    return recommendations[topGame.gameType] || "Keep exploring different interests!";
  };

  const gameTypeColors = {
    "Music Game": "bg-music",
    "Farm Quest": "bg-nature",
    "Building Blocks": "bg-engineering",
    "Drawing & Painting": "bg-art",
    "Learning Games": "bg-learning",
    "Cooking Game": "bg-cooking",
    "Fashion Design": "bg-fashion",
    "Sports Game": "bg-sports"
  };

  const maxSessions = Math.max(...stats.topGames.map(g => g.sessions), 1);

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

          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Time Played</p>
                <p className="text-2xl font-bold">{Math.round(stats.totalTimeSpent / 60)}m</p>
              </div>
            </div>
          </Card>

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
              <TrendingUp className="w-8 h-8 text-nature" />
              <div>
                <p className="text-sm text-muted-foreground">Top Interest</p>
                <p className="text-sm font-bold">
                  {stats.topGames[0]?.gameType.replace(" Game", "") || "None"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Simple Bar Chart */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Game Sessions</h3>
          <div className="space-y-4">
            {stats.topGames.map((game, index) => (
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
              </div>
            ))}
          </div>
        </Card>

        {/* Interest Distribution */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Interest Distribution</h3>
          <div className="grid grid-cols-2 gap-4">
            {stats.topGames.slice(0, 4).map((game, index) => (
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
                      {game.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={game.percentage} className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Interests */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Your Child's Top Interests</h3>
          <div className="space-y-4">
            {stats.topGames.slice(0, 5).map((game, index) => (
              <div key={game.gameType} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary">#{index + 1}</Badge>
                  <div>
                    <p className="font-semibold">{game.gameType}</p>
                    <p className="text-sm text-muted-foreground">
                      {game.sessions} sessions • Avg score: {Math.round(game.averageScore)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{game.percentage.toFixed(1)}%</p>
                  <Progress value={game.percentage} className="w-20" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Recommendations */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">🤖 ML Recommendation</h3>
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg">
            <p className="text-lg">{mlRecommendation || "Play more games to get a personalized recommendation!"}</p>
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