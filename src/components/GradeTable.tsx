import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Edit2, Check, X } from "lucide-react";
import { GradeData, GRADE_OPTIONS, getGradePoints } from "@/types/grades";
import { cn } from "@/lib/utils";

interface GradeTableProps {
  courses: GradeData[];
  onCoursesChange: (courses: GradeData[]) => void;
  editable?: boolean;
}

export function GradeTable({ courses, onCoursesChange, editable = true }: GradeTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<GradeData | null>(null);

  const handleEdit = (course: GradeData) => {
    setEditingId(course.id);
    setEditForm({ ...course });
  };

  const handleSave = () => {
    if (editForm) {
      // Recalculate grade points
      const updatedGradePoints = getGradePoints(editForm.credits, editForm.grade);
      const updatedCourse = { ...editForm, gradePoints: updatedGradePoints };
      
      onCoursesChange(
        courses.map((c) => (c.id === editingId ? updatedCourse : c))
      );
    }
    setEditingId(null);
    setEditForm(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = (id: string) => {
    onCoursesChange(courses.filter((c) => c.id !== id));
  };

  const handleAdd = () => {
    const newCourse: GradeData = {
      id: `course-${Date.now()}`,
      courseCode: "",
      courseName: "New Course",
      credits: 3,
      gradePoints: 24,
      grade: "A",
    };
    onCoursesChange([...courses, newCourse]);
    handleEdit(newCourse);
  };

  const handleGradeChange = (grade: string) => {
    if (editForm) {
      const newGradePoints = getGradePoints(editForm.credits, grade);
      setEditForm({ ...editForm, grade, gradePoints: newGradePoints });
    }
  };

  const handleCreditsChange = (credits: number) => {
    if (editForm) {
      const newGradePoints = getGradePoints(credits, editForm.grade);
      setEditForm({ ...editForm, credits, gradePoints: newGradePoints });
    }
  };

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden bg-card/50 backdrop-blur-sm shadow-lg animate-fade-up">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/15 hover:to-secondary/15">
              <TableHead className="font-semibold">Course Code</TableHead>
              <TableHead className="font-semibold">Course Name</TableHead>
              <TableHead className="font-semibold text-center">Credits</TableHead>
              <TableHead className="font-semibold text-center">Grade</TableHead>
              <TableHead className="font-semibold text-center">Grade Points</TableHead>
              {editable && <TableHead className="font-semibold text-center w-24">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course, index) => (
              <TableRow
                key={course.id}
                className={cn(
                  "transition-colors",
                  index % 2 === 0 ? "bg-card/30" : "bg-muted/20"
                )}
              >
                {editingId === course.id && editForm ? (
                  <>
                    <TableCell>
                      <Input
                        value={editForm.courseCode}
                        onChange={(e) =>
                          setEditForm({ ...editForm, courseCode: e.target.value })
                        }
                        className="h-8 w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editForm.courseName}
                        onChange={(e) =>
                          setEditForm({ ...editForm, courseName: e.target.value })
                        }
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={editForm.credits}
                        onChange={(e) => handleCreditsChange(Number(e.target.value))}
                        className="h-8 w-16 text-center"
                        min={1}
                        max={10}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={editForm.grade}
                        onValueChange={handleGradeChange}
                      >
                        <SelectTrigger className="h-8 w-20">
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
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {editForm.gradePoints}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-100"
                          onClick={handleSave}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-100"
                          onClick={handleCancel}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="font-mono text-sm">
                      {course.courseCode || "-"}
                    </TableCell>
                    <TableCell>{course.courseName}</TableCell>
                    <TableCell className="text-center font-medium">
                      {course.credits}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center w-10 h-6 rounded-full text-xs font-bold",
                          course.grade === "O" && "bg-green-100 text-green-700",
                          course.grade === "A+" && "bg-emerald-100 text-emerald-700",
                          course.grade === "A" && "bg-teal-100 text-teal-700",
                          course.grade === "B+" && "bg-blue-100 text-blue-700",
                          course.grade === "B" && "bg-sky-100 text-sky-700",
                          course.grade === "C" && "bg-amber-100 text-amber-700",
                          (course.grade === "S" || course.grade === "P") &&
                            "bg-orange-100 text-orange-700",
                          course.grade === "F" && "bg-red-100 text-red-700"
                        )}
                      >
                        {course.grade}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-bold text-primary">
                      {course.gradePoints}
                    </TableCell>
                    {editable && (
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-primary"
                            onClick={() => handleEdit(course)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(course.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editable && (
        <div className="p-3 border-t border-border/50 bg-muted/30">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdd}
            className="w-full gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </Button>
        </div>
      )}
    </div>
  );
}
