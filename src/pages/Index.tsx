import { useState, useRef, useCallback, useEffect } from "react";
import { GraduationCap, Sparkles, Linkedin, Instagram, Mail, Github, Star, Heart } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { GradeTable } from "@/components/GradeTable";
import { SGPADisplay } from "@/components/SGPADisplay";
import { GradePredictor } from "@/components/GradePredictor";
import { ExportPanel } from "@/components/ExportPanel";
import { useGradeExtraction } from "@/hooks/useGradeExtraction";
import { GradeData, calculateSGPA } from "@/types/grades";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [courses, setCourses] = useState<GradeData[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [starCount, setStarCount] = useState<number | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const { extractGrades, isExtracting, progress, error } = useGradeExtraction();

  const { totalCredits, totalGradePoints, sgpa } = calculateSGPA(courses);

  // Fetch GitHub Stars on Mount
  useEffect(() => {
    const fetchStars = async () => {
      try {
        const response = await fetch("https://api.github.com/repos/hackerharsh016/sgpa-smart-calculator");
        if (response.ok) {
          const data = await response.json();
          setStarCount(data.stargazers_count);
        }
      } catch (error) {
        console.error("Failed to fetch stars", error);
      }
    };
    fetchStars();
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 relative">
      {/* GitHub Star Button (Top Right) */}
      <div className="absolute top-4 right-4 z-50 hidden md:block">
        <Button
          variant="outline"
          className="gap-2 bg-background/50 backdrop-blur-sm hover:bg-muted/80 border-primary/20 transition-all hover:scale-105"
          onClick={() => window.open("https://github.com/hackerharsh016/sgpa-smart-calculator", "_blank")}
        >
          <Github className="w-4 h-4" />
          <span>Star on GitHub</span>
          <div className="flex items-center gap-1 pl-2 border-l border-border/50 ml-1 text-muted-foreground">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-mono">{starCount !== null ? starCount : "..."}</span>
          </div>
        </Button>
      </div>

      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-secondary/20 to-primary/20 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-8 max-w-5xl flex flex-col min-h-screen">
        {/* Mobile Star Link (Visible only on small screens) */}
        <div className="md:hidden flex justify-end mb-4">
          <a
            href="https://github.com/hackerharsh016/sgpa-smart-calculator"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border border-border/40"
          >
            <Github className="w-3 h-3" />
            <span>{starCount !== null ? starCount : "0"} Stars</span>
          </a>
        </div>

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
          <div ref={resultRef} className="space-y-8 flex-grow">
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
          <div className="text-center py-16 animate-fade-up flex-grow">
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

        {/* Modern Footer */}
        <footer className="mt-20 py-8 border-t border-border/40 bg-background/50 backdrop-blur-sm rounded-t-3xl">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Credits & Info */}
              <div className="text-center md:text-left space-y-1.5">
                <p className="font-semibold text-foreground">
                  Designed & Developed by <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-md">Harsh Potdar</span>
                </p>
                
              </div>

              {/* Endorse / Star Us Section (New) */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 flex items-center gap-1">
                  Like this project? <Heart className="w-3 h-3 text-red-400 fill-red-400 animate-pulse" />
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 bg-background/50 border-primary/20 hover:bg-primary/5 hover:border-primary/50 transition-all group"
                  onClick={() => window.open("https://github.com/hackerharsh016/sgpa-smart-calculator", "_blank")}
                >
                  <Github className="w-4 h-4 text-foreground group-hover:text-black dark:group-hover:text-white transition-colors" />
                  <span className="font-medium">Star on GitHub</span>
                  <div className="flex items-center gap-1 pl-2 border-l border-border/50 ml-1 text-muted-foreground group-hover:text-yellow-500 transition-colors">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-mono font-bold">{starCount !== null ? starCount : "..."}</span>
                  </div>
                </Button>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                <a
                  href="https://www.linkedin.com/in/harsh-potdar-25900933a/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full bg-muted/50 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110 hover:shadow-lg transition-all duration-300"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                
                <a
                  href="https://www.instagram.com/harsh_potdar23/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full bg-muted/50 text-muted-foreground hover:bg-pink-500/10 hover:text-pink-600 dark:hover:text-pink-400 hover:scale-110 hover:shadow-lg transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>

                <a
                  href="mailto:harshpotdar023@gmail.com"
                  className="p-2.5 rounded-full bg-muted/50 text-muted-foreground hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:scale-110 hover:shadow-lg transition-all duration-300"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;