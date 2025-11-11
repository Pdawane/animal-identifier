import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { AnalysisResult } from "@/components/AnalysisResult";
import { Sparkles } from "lucide-react";

export type AnimalAnalysis = {
  animalType: string;
  breed: string;
  ageRange: string;
  confidence: number;
  observations: string[];
  characteristics: {
    size: string;
    coat: string;
    color: string;
    distinguishingFeatures: string;
  };
  imageUrl: string;
};

const Index = () => {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnimalAnalysis | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnimalAnalysis[]>([]);

  const handleAnalysisComplete = (analysis: AnimalAnalysis) => {
    setCurrentAnalysis(analysis);
    setAnalysisHistory(prev => [analysis, ...prev]);
  };

  const handleNewAnalysis = () => {
    setCurrentAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="bg-gradient-hero text-primary-foreground py-12 shadow-glow">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-12 w-12 mr-3" />
            <h1 className="text-5xl font-bold">AI Animal Detector</h1>
          </div>
          <p className="text-xl opacity-95 max-w-2xl mx-auto">
            Upload any animal image and get instant AI-powered identification with detailed analysis
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {!currentAnalysis ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-card rounded-2xl shadow-soft p-8 mb-8">
              <h2 className="text-3xl font-bold mb-6 text-card-foreground">Upload Animal Image</h2>
              <ImageUpload onAnalysisComplete={handleAnalysisComplete} />
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-6 mt-12">
              <div className="bg-gradient-card rounded-xl p-6 shadow-soft">
                <div className="text-4xl mb-3">📸</div>
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">Easy Upload</h3>
                <p className="text-muted-foreground">Simply drag & drop or click to select any animal image from your device</p>
              </div>
              <div className="bg-gradient-card rounded-xl p-6 shadow-soft">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">AI Analysis</h3>
                <p className="text-muted-foreground">Advanced AI identifies species, breeds, and provides detailed insights</p>
              </div>
              <div className="bg-gradient-card rounded-xl p-6 shadow-soft">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">Detailed Results</h3>
                <p className="text-muted-foreground">Get comprehensive info including type, breed, age, and characteristics</p>
              </div>
              <div className="bg-gradient-card rounded-xl p-6 shadow-soft">
                <div className="text-4xl mb-3">⚡</div>
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">Instant Results</h3>
                <p className="text-muted-foreground">Receive accurate analysis within seconds powered by cutting-edge AI</p>
              </div>
            </div>
          </div>
        ) : (
          <AnalysisResult analysis={currentAnalysis} onNewAnalysis={handleNewAnalysis} />
        )}

        {/* History Section */}
        {analysisHistory.length > 1 && (
          <div className="mt-16 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-foreground">Analysis History</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysisHistory.slice(1).map((analysis, index) => (
                <div
                  key={index}
                  className="bg-card rounded-xl shadow-soft overflow-hidden cursor-pointer hover:shadow-glow transition-all duration-300"
                  onClick={() => setCurrentAnalysis(analysis)}
                >
                  <img
                    src={analysis.imageUrl}
                    alt={analysis.animalType}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-card-foreground">{analysis.animalType}</h3>
                    <p className="text-sm text-muted-foreground">{analysis.breed}</p>
                    <div className="mt-2">
                      <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                        {analysis.confidence}% confident
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-muted py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>Powered by advanced AI technology • Accurate animal identification</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
