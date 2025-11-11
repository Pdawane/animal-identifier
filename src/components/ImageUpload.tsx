import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2 } from "lucide-react";
import type { AnimalAnalysis } from "@/pages/Index";

interface ImageUploadProps {
  onAnalysisComplete: (analysis: AnimalAnalysis) => void;
}

export const ImageUpload = ({ onAnalysisComplete }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Analyze the image
    await analyzeImage(file);
  };

  const analyzeImage = async (file: File) => {
    setUploading(true);

    try {
      // Convert image to base64
      const base64 = await fileToBase64(file);

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('analyze-animal', {
        body: { imageBase64: base64 }
      });

      if (error) {
        console.error('Function error:', error);
        throw new Error(error.message || 'Failed to analyze image');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Add the image URL to the result
      const analysisWithImage: AnimalAnalysis = {
        ...data,
        imageUrl: base64
      };

      onAnalysisComplete(analysisWithImage);

      toast({
        title: "Analysis complete!",
        description: `Detected: ${data.animalType} with ${data.confidence}% confidence`,
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      handleFileSelect({ target: fileInputRef.current } as any);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary transition-colors cursor-pointer bg-muted/30"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {preview && !uploading ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg shadow-soft"
            />
            <p className="text-sm text-muted-foreground">Click to upload a different image</p>
          </div>
        ) : uploading ? (
          <div className="space-y-4">
            {preview && (
              <img
                src={preview}
                alt="Analyzing"
                className="max-h-64 mx-auto rounded-lg shadow-soft opacity-50"
              />
            )}
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium text-foreground">Analyzing image...</p>
              <p className="text-sm text-muted-foreground">This may take a few seconds</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="h-16 w-16 mx-auto text-primary" />
            <div>
              <p className="text-lg font-medium text-foreground mb-2">
                Drop your image here or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                Supports JPG, PNG, WEBP formats
              </p>
            </div>
          </div>
        )}
      </div>

      {!preview && !uploading && (
        <Button
          onClick={() => fileInputRef.current?.click()}
          size="lg"
          className="w-full"
        >
          <Upload className="mr-2 h-5 w-5" />
          Choose Image
        </Button>
      )}
    </div>
  );
};
