import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    const AZURE_VISION_ENDPOINT = Deno.env.get("AZURE_VISION_ENDPOINT");
    const AZURE_VISION_KEY = Deno.env.get("AZURE_VISION_KEY");
    
    if (!AZURE_VISION_ENDPOINT || !AZURE_VISION_KEY) {
      throw new Error("Azure Vision credentials are not configured");
    }

    console.log('Starting animal analysis with Azure Vision...');

    // 🔴 CHANGED: Convert base64 to binary
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // 🔴 CHANGED: Azure endpoint URL
    const analyzeUrl = `${AZURE_VISION_ENDPOINT}vision/v3.2/analyze?visualFeatures=Tags,Description,Objects,Color&language=en`;
    
    // 🔴 CHANGED: Different headers and body format
    const response = await fetch(analyzeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Ocp-Apim-Subscription-Key": AZURE_VISION_KEY,
      },
      body: bytes,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Azure Vision API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`Azure Vision API error: ${response.status}`);
    }

    const azureData = await response.json();
    console.log('Azure Vision response received');

    // 🔴 CHANGED: Process Azure response format
    const analysisResult = {
      animalType: (azureData.tags[0]?.name || "Animal").charAt(0).toUpperCase() + (azureData.tags[0]?.name || "Animal").slice(1),
      breed: (azureData.tags[1]?.name || "Unknown breed").charAt(0).toUpperCase() + (azureData.tags[1]?.name || "Unknown breed").slice(1),
      ageRange: "Age estimation not available with basic vision API",
      confidence: Math.round((azureData.tags[0]?.confidence || 0.7) * 100),
      observations: [
        azureData.description?.captions?.[0]?.text || "Animal detected",
        `Detected features: ${azureData.tags.slice(0, 5).map((t: any) => t.name).join(', ')}`,
        `Color analysis: ${azureData.color?.dominantColors?.join(', ') || 'Various colors'}`
      ],
      characteristics: {
        size: "Medium",
        coat: azureData.color?.dominantColorForeground || "Not specified",
        color: azureData.color?.dominantColors?.join(', ') || "Various",
        distinguishingFeatures: azureData.tags.slice(0, 3).map((t: any) => t.name).join(', ')
      },
      imageUrl: imageBase64
    };

    console.log('Analysis completed successfully');

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-animal function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
