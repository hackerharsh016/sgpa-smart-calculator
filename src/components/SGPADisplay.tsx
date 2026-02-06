import { cn } from "@/lib/utils";

interface SGPADisplayProps {
  sgpa: number;
  totalCredits: number;
  totalGradePoints: number;
}

export function SGPADisplay({ sgpa, totalCredits, totalGradePoints }: SGPADisplayProps) {
  const getGradeRemark = (sgpa: number) => {
    if (sgpa >= 9) return { text: "Outstanding!", color: "text-green-500" };
    if (sgpa >= 8) return { text: "Excellent!", color: "text-emerald-500" };
    if (sgpa >= 7) return { text: "Very Good!", color: "text-teal-500" };
    if (sgpa >= 6) return { text: "Good", color: "text-blue-500" };
    if (sgpa >= 5) return { text: "Average", color: "text-amber-500" };
    if (sgpa >= 4) return { text: "Pass", color: "text-orange-500" };
    return { text: "Needs Improvement", color: "text-red-500" };
  };

  const remark = getGradeRemark(sgpa);
  const percentage = (sgpa / 10) * 100;

  return (
    <div className="relative animate-scale-in">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 blur-3xl rounded-full opacity-50" />

      <div className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-br from-card to-card/80 border border-border/50 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
          {/* SGPA Circle */}
          <div className="relative">
            <svg className="w-40 h-40 md:w-48 md:h-48 -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${percentage * 2.827} 282.7`}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--secondary))" />
                </linearGradient>
              </defs>
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {sgpa.toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground">SGPA</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <p className={cn("text-2xl md:text-3xl font-bold", remark.color)}>
                {remark.text}
              </p>
              <p className="text-muted-foreground mt-1">
                Keep up the great work!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <p className="text-3xl font-bold text-primary">{totalCredits}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Total Credits
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
                <p className="text-3xl font-bold text-secondary">{totalGradePoints}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Total Points
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Formula:</span> SGPA = Total Grade Points ÷ Total Credits = {totalGradePoints} ÷ {totalCredits} = {sgpa.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
