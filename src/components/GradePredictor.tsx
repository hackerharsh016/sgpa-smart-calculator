import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Target, Calculator } from "lucide-react";
import { PredictionCourse, GRADE_OPTIONS, GRADE_VALUES, GradeData } from "@/types/grades";
import { cn } from "@/lib/utils";

interface GradePredictorProps {
  existingCourses: GradeData[];
}

export function GradePredictor({ existingCourses }: GradePredictorProps) {
  const [targetSGPA, setTargetSGPA] = useState<number>(8.0);
  const [futureCourses, setFutureCourses] = useState<PredictionCourse[]>([
    { id: "future-1", courseName: "Future Course 1", credits: 3, targetGrade: "A" },
  ]);

  // Calculate current totals
  const currentCredits = existingCourses.reduce((sum, c) => sum + c.credits, 0);
  const currentGradePoints = existingCourses.reduce((sum, c) => sum + c.gradePoints, 0);

  // Calculate future totals
  const futureCredits = futureCourses.reduce((sum, c) => sum + c.credits, 0);
  const futureGradePoints = futureCourses.reduce(
    (sum, c) => sum + c.credits * (GRADE_VALUES[c.targetGrade] || 0),
    0
  );

  // Combined SGPA
  const totalCredits = currentCredits + futureCredits;
  const totalGradePoints = currentGradePoints + futureGradePoints;
  const predictedSGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

  // Calculate required points for target
  const requiredPoints = targetSGPA * totalCredits;
  const pointsNeeded = requiredPoints - currentGradePoints;
  const isAchievable = pointsNeeded <= futureCredits * 10;

  const addCourse = () => {
    setFutureCourses([
      ...futureCourses,
      {
        id: `future-${Date.now()}`,
        courseName: `Future Course ${futureCourses.length + 1}`,
        credits: 3,
        targetGrade: "A",
      },
    ]);
  };

  const removeCourse = (id: string) => {
    if (futureCourses.length > 1) {
      setFutureCourses(futureCourses.filter((c) => c.id !== id));
    }
  };

  const updateCourse = (id: string, updates: Partial<PredictionCourse>) => {
    setFutureCourses(
      futureCourses.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg animate-fade-up">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Target className="w-5 h-5 text-primary" />
          Grade Predictor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Target SGPA */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="target-sgpa" className="text-sm font-medium">
                Target SGPA Goal
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set your desired SGPA to see what grades you need
              </p>
            </div>
            <Input
              id="target-sgpa"
              type="number"
              value={targetSGPA}
              onChange={(e) => setTargetSGPA(Number(e.target.value))}
              min={0}
              max={10}
              step={0.1}
              className="w-24 text-center font-bold text-lg"
            />
          </div>
        </div>

        {/* Future Courses */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Future/Hypothetical Courses</h4>
            <Button variant="outline" size="sm" onClick={addCourse} className="gap-1">
              <Plus className="w-3 h-3" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {futureCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50"
              >
                <Input
                  value={course.courseName}
                  onChange={(e) =>
                    updateCourse(course.id, { courseName: e.target.value })
                  }
                  className="flex-1 h-8"
                  placeholder="Course name"
                />
                <Input
                  type="number"
                  value={course.credits}
                  onChange={(e) =>
                    updateCourse(course.id, { credits: Number(e.target.value) })
                  }
                  className="w-16 h-8 text-center"
                  min={1}
                  max={10}
                />
                <Select
                  value={course.targetGrade}
                  onValueChange={(value) =>
                    updateCourse(course.id, { targetGrade: value })
                  }
                >
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_OPTIONS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeCourse(course.id)}
                  disabled={futureCourses.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Prediction Results */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Calculator className="w-4 h-4 text-secondary" />
            Prediction Results
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Current SGPA
              </p>
              <p className="text-2xl font-bold text-primary">
                {currentCredits > 0
                  ? (currentGradePoints / currentCredits).toFixed(2)
                  : "0.00"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Predicted SGPA
              </p>
              <p
                className={cn(
                  "text-2xl font-bold",
                  predictedSGPA >= targetSGPA ? "text-green-500" : "text-amber-500"
                )}
              >
                {predictedSGPA.toFixed(2)}
              </p>
            </div>
          </div>

          <div
            className={cn(
              "p-4 rounded-lg border",
              predictedSGPA >= targetSGPA
                ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900"
                : "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900"
            )}
          >
            {predictedSGPA >= targetSGPA ? (
              <p className="text-sm text-green-700 dark:text-green-400">
                ✅ <strong>Great news!</strong> With these grades, you'll achieve your
                target SGPA of {targetSGPA.toFixed(1)}!
              </p>
            ) : (
              <p className="text-sm text-amber-700 dark:text-amber-400">
                ⚠️ You'll need to improve your grades to reach {targetSGPA.toFixed(1)}.
                {isAchievable
                  ? ` Try aiming for higher grades in your future courses.`
                  : ` This target may not be achievable with the current credit load.`}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
