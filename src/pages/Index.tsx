import { useState, useRef, useCallback } from "react";
import { GraduationCap, Sparkles } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { GradeTable } from "@/components/GradeTable";
import { SGPADisplay } from "@/components/SGPADisplay";
import { GradePredictor } from "@/components/GradePredictor";
import { ExportPanel } from "@/components/ExportPanel";
import { useGradeExtraction } from "@/hooks/useGradeExtraction";
import { GradeData, calculateSGPA } from "@/types/grades";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [courses, setCourses] = useState<GradeData[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const { extractGrades, isExtracting, progress, error } = useGradeExtraction();

  const { totalCredits, totalGradePoints, sgpa } = calculateSGPA(courses);

  const handleImageSelect = useCallback(
    async (file: File) => {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Extract grades
      const result = await extractGrades(file);

      if (result) {
        setCourses(result.courses);
        toast({
          title: "Grades Extracted!",
          description: `Found ${result.courses.length} courses with SGPA ${result.sgpa.toFixed(2)}`,
        });
      } else if (error) {
        toast({
          title: "Extraction Failed",
          description: error,
          variant: "destructive",
        });
      }
    },
    [extractGrades, error]
  );

  const handleClear = useCallback(() => {
    setUploadedImage(null);
    setCourses([]);
  }, []);

  const handleCoursesChange = useCallback((newCourses: GradeData[]) => {
    setCourses(newCourses);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-secondary/20 to-primary/20 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Section */}
        <header className="text-center mb-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered OCR</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              SGPA Calculator
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your grade sheet screenshot and let AI extract your grades instantly.
            Calculate SGPA, predict future performance, and export results.
          </p>
        </header>

        {/* Upload Section */}
        <section className="mb-10">
          <ImageUploader
            onImageSelect={handleImageSelect}
            isProcessing={isExtracting}
            progress={progress}
            uploadedImage={uploadedImage}
            onClear={handleClear}
          />
        </section>

        {/* Results Section */}
        {courses.length > 0 && (
          <div ref={resultRef} className="space-y-8">
            {/* SGPA Display */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Your SGPA Result
              </h2>
              <SGPADisplay
                sgpa={sgpa}
                totalCredits={totalCredits}
                totalGradePoints={totalGradePoints}
              />
            </section>

            {/* Grade Table */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Course Details</h2>
              <GradeTable courses={courses} onCoursesChange={handleCoursesChange} />
            </section>

            {/* Grade Predictor & Export */}
            <div className="grid md:grid-cols-2 gap-6">
              <GradePredictor existingCourses={courses} />
              <ExportPanel
                courses={courses}
                totalCredits={totalCredits}
                totalGradePoints={totalGradePoints}
                sgpa={sgpa}
                resultRef={resultRef}
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {courses.length === 0 && !isExtracting && (
          <div className="text-center py-16 animate-fade-up">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No grades yet
            </h3>
            <p className="text-sm text-muted-foreground/70">
              Upload a screenshot of your grade sheet to get started
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>
            10-point grading scale: O=10, A+=9, A=8, B+=7, B=6, C=5, S/P=4, F=0
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
