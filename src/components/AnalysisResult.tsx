import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import type { AnimalAnalysis } from "@/pages/Index";

interface AnalysisResultProps {
  analysis: AnimalAnalysis;
  onNewAnalysis: () => void;
}

export const AnalysisResult = ({ analysis, onNewAnalysis }: AnalysisResultProps) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-primary text-primary-foreground";
    if (confidence >= 70) return "bg-accent text-accent-foreground";
    return "bg-secondary text-secondary-foreground";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Button
        onClick={onNewAnalysis}
        variant="outline"
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Analyze Another Image
      </Button>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Image Display */}
        <Card className="overflow-hidden shadow-glow">
          <CardContent className="p-0">
            <img
              src={analysis.imageUrl}
              alt="Analyzed animal"
              className="w-full h-auto object-contain max-h-[500px]"
            />
          </CardContent>
        </Card>

        {/* Analysis Details */}
        <div className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl">{analysis.animalType}</CardTitle>
                <Badge className={getConfidenceColor(analysis.confidence)}>
                  {analysis.confidence}% confident
                </Badge>
              </div>
              <CardDescription className="text-lg">{analysis.breed}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Age Range</p>
                <p className="text-lg font-semibold text-foreground">{analysis.ageRange}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Characteristics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Size</p>
                  <p className="text-base font-semibold text-foreground">{analysis.characteristics.size}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Color</p>
                  <p className="text-base font-semibold text-foreground">{analysis.characteristics.color}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Coat/Fur</p>
                <p className="text-base text-foreground">{analysis.characteristics.coat}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Distinguishing Features</p>
                <p className="text-base text-foreground">{analysis.characteristics.distinguishingFeatures}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Observations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.observations.map((observation, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{observation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
