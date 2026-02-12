import { useState } from "react";
import { GradeData, calculateSGPA } from "@/types/grades";

// Direct Client-Side API Keys (Rotation Logic)
const API_KEYS = (import.meta.env.VITE_GEMINI_API_KEYS || "")
  .split(",")
  .map((key: string) => key.trim())
  .filter((key: string) => key.length > 0);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const result = reader.result as string;
          // Split to get just the base64 string
          const base64 = result.split(",")[1]; 
          resolve(base64);
        };
        reader.onerror = (error) => reject(error);
      });

      // FIX: Use the actual file type (e.g., 'image/jpeg') instead of hardcoding 'image/png'
      const mimeType = file.type || "image/png";

      setProgress(30);

      const systemPrompt = `Analyze this grade sheet/result image and extract the following information for each course in JSON format:

IMPORTANT: Look for a table containing course/subject information with grades.

For each course, extract:
- courseCode: The course code (e.g., "21CS101", "22MA102")
- courseName: The full name of the course/subject
- credits: The credit value (number) - look for "Credits" or "Credit Earned" column
- gradePoints: The grade points earned (number) - this is usually credits × grade value
- grade: The letter grade (O, A+, A, B+, B, C, S, P, F, etc.)

Grade Scale Reference (10-point scale):
- O (Outstanding) = 10
- A+ = 9
- A = 8
- B+ = 7
- B = 6
- C = 5
- S/P (Pass) = 4
- F (Fail) = 0

Return ONLY valid JSON in this exact format:
{
  "courses": [
    {
      "courseCode": "string",
      "courseName": "string", 
      "credits": number,
      "gradePoints": number,
      "grade": "string"
    }
  ]
}

If you cannot extract the data, return: {"error": "Could not extract grade data from image"}`;

      let successfulResponse = null;

      // 3. API Key Rotation Loop
      for (const [index, key] of API_KEYS.entries()) {
        try {
          console.log(`Attempting extraction with Key #${index + 1}...`);
          
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: systemPrompt },
                  { 
                    inline_data: { 
                      mime_type: mimeType, // FIX: Dynamic Mime Type
                      data: base64Data 
                    } 
                  }
                ]
              }]
            })
          });

          if (response.ok) {
            successfulResponse = await response.json();
            console.log(`Success with Key #${index + 1}`);
            break; 
          }

          // FIX: Parse and log the actual error details from Google
          const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
          console.warn(`Key #${index + 1} failed:`, errorData);

          // Handle Rate Limits (429) specifically
          if (response.status === 429) {
            if (index < API_KEYS.length - 1) await wait(1000);
            continue; 
          }

        } catch (e) {
          console.error(`Exception with Key #${index + 1}:`, e);
          if (index < API_KEYS.length - 1) await wait(1000);
          continue;
        }
      }

      if (!successfulResponse) {
        throw new Error("due to high request the services is shut down for bit of time , try later");
      }

      setProgress(80);

      // 4. Parse AI Response
      const content = successfulResponse.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) throw new Error("No content received from AI");

      let jsonStr = content;
      // Handle markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) jsonStr = jsonMatch[1].trim();
      else {
        const rawMatch = content.match(/\{[\s\S]*\}/);
        if (rawMatch) jsonStr = rawMatch[0];
      }

      const extractedData = JSON.parse(jsonStr);
      if (extractedData.error) throw new Error(extractedData.error);

      // 5. Format Data
      const rawCourses = extractedData.courses || [];
      const formattedCourses: GradeData[] = rawCourses.map((c: any, i: number) => ({
        id: `extracted-${Date.now()}-${i}`,
        courseCode: c.courseCode || "",
        courseName: c.courseName || "Unknown Course",
        credits: Number(c.credits) || 0,
        gradePoints: Number(c.gradePoints) || 0, 
        grade: c.grade || "F"
      }));

      // Calculate SGPA
      const { sgpa } = calculateSGPA(formattedCourses);

      setProgress(100);
      return { courses: formattedCourses, sgpa };

    } catch (err: any) {
      console.error("Extraction failed:", err);
      // Preserve specific shutdown message
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