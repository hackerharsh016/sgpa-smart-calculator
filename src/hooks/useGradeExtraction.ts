import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GradeData } from "@/types/grades";
import { FunctionsHttpError } from "@supabase/supabase-js";

export const useGradeExtraction = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const extractGrades = async (file: File) => {
    setIsExtracting(true);
    setError(null);
    setProgress(10);

    try {
      // 1. Convert image to Base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

      setProgress(40);

      // 2. Invoke the Edge Function
      const { data, error: invokeError } = await supabase.functions.invoke('extract-grades', {
        body: { image: base64 },
      });

      // 3. Handle Errors
      if (invokeError) {
        console.error("Supabase Function Error:", invokeError);

        // Check for Rate Limit (HTTP 429)
        // This covers both Supabase platform limits and custom 429 responses
        const isRateLimit = 
          invokeError.status === 429 || 
          (invokeError instanceof FunctionsHttpError && invokeError.context?.status === 429);

        if (isRateLimit) {
          throw new Error("due to high request the services is shut down for bit of time , try later");
        }

        // Handle other specific Edge Function errors
        if (invokeError instanceof FunctionsHttpError) {
          const details = await invokeError.context.json().catch(() => ({}));
          throw new Error(details.error || "Failed to process image");
        }
        
        throw invokeError;
      }

      if (!data) {
        throw new Error("No data received from extraction service");
      }

      setProgress(100);
      return data as { courses: GradeData[], sgpa: number };

    } catch (err: any) {
      console.error("Extraction process failed:", err);
      
      // Use the custom message if it was thrown above, otherwise default
      const errorMessage = err.message === "due to high request the services is shut down for bit of time , try later"
        ? err.message
        : (err.message || "Failed to extract grades. Please try again.");

      setError(errorMessage);
      return null;
    } finally {
      setIsExtracting(false);
    }
  };

  return { extractGrades, isExtracting, progress, error };
};