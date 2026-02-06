import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GradeData, SGPAResult } from "@/types/grades";

export function useGradeExtraction() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const extractGrades = async (imageFile: File): Promise<SGPAResult | null> => {
    setIsExtracting(true);
    setProgress(10);
    setError(null);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(imageFile);
      setProgress(30);

      console.log("Sending image for extraction...");
      
      // Call the edge function
      const { data, error: fnError } = await supabase.functions.invoke("extract-grades", {
        body: { imageBase64: base64 },
      });

      setProgress(80);

      if (fnError) {
        throw new Error(fnError.message || "Failed to extract grades");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to extract grade data");
      }

      setProgress(100);

      // Add unique IDs to courses
      const coursesWithIds: GradeData[] = data.data.courses.map((course: Omit<GradeData, "id">, index: number) => ({
        ...course,
        id: `course-${index}-${Date.now()}`,
      }));

      return {
        courses: coursesWithIds,
        totalCredits: data.data.totalCredits,
        totalGradePoints: data.data.totalGradePoints,
        sgpa: data.data.sgpa,
      };
    } catch (err) {
      console.error("Extraction error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to extract grades";
      setError(errorMessage);
      return null;
    } finally {
      setIsExtracting(false);
    }
  };

  return { extractGrades, isExtracting, progress, error };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix to get just the base64 string
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}
