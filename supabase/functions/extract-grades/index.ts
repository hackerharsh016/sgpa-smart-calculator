import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GradeData {
  courseCode: string;
  courseName: string;
  credits: number;
  gradePoints: number;
  grade: string;
}

interface ExtractionResponse {
  success: boolean;
  data?: {
    courses: GradeData[];
    totalCredits: number;
    totalGradePoints: number;
    sgpa: number;
  };
  error?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      throw new Error("No image provided");
    }

    console.log("Processing image for grade extraction...");

    const prompt = `Analyze this grade sheet/result image and extract the following information for each course in JSON format:

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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ success: false, error: "Payment required. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("AI Response received");

    const content = aiResponse.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Extract JSON from the response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    } else {
      // Try to find raw JSON
      const rawJsonMatch = content.match(/\{[\s\S]*\}/);
      if (rawJsonMatch) {
        jsonStr = rawJsonMatch[0];
      }
    }

    console.log("Parsing extracted data:", jsonStr.substring(0, 200));

    const extractedData = JSON.parse(jsonStr);

    if (extractedData.error) {
      throw new Error(extractedData.error);
    }

    const courses: GradeData[] = extractedData.courses || [];
    
    // Calculate totals
    let totalCredits = 0;
    let totalGradePoints = 0;

    for (const course of courses) {
      totalCredits += course.credits || 0;
      totalGradePoints += course.gradePoints || 0;
    }

    const sgpa = totalCredits > 0 ? Math.round((totalGradePoints / totalCredits) * 100) / 100 : 0;

    const result: ExtractionResponse = {
      success: true,
      data: {
        courses,
        totalCredits,
        totalGradePoints,
        sgpa,
      },
    };

    console.log("Extraction successful:", { 
      courseCount: courses.length, 
      totalCredits, 
      totalGradePoints, 
      sgpa 
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in extract-grades:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
