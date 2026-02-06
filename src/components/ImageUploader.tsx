import { useCallback, useState } from "react";
import { Upload, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  isProcessing: boolean;
  progress: number;
  uploadedImage: string | null;
  onClear: () => void;
}

export function ImageUploader({
  onImageSelect,
  isProcessing,
  progress,
  uploadedImage,
  onClear,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  if (uploadedImage && !isProcessing) {
    return (
      <div className="relative animate-scale-in">
        <div className="relative rounded-2xl overflow-hidden border-2 border-primary/20 shadow-lg">
          <img
            src={uploadedImage}
            alt="Uploaded grade sheet"
            className="w-full max-h-80 object-contain bg-card"
          />
          <button
            onClick={onClear}
            className="absolute top-3 right-3 p-2 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3 text-center text-sm text-muted-foreground">
          Image uploaded successfully! Review your grades below.
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative rounded-2xl border-2 border-dashed p-8 md:p-12 transition-all duration-300 cursor-pointer",
        "bg-gradient-to-br from-card via-card to-muted/50",
        "hover:border-primary hover:shadow-lg hover:shadow-primary/10",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.02] shadow-xl shadow-primary/20"
          : "border-muted-foreground/30",
        isProcessing && "pointer-events-none"
      )}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isProcessing}
      />

      <div className="flex flex-col items-center gap-4 text-center">
        {isProcessing ? (
          <>
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center animate-pulse-glow">
                <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
              </div>
            </div>
            <div className="space-y-2 w-full max-w-xs">
              <p className="text-lg font-medium text-foreground">
                Extracting grades with AI...
              </p>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">{progress}% complete</p>
            </div>
          </>
        ) : (
          <>
            <div
              className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300",
                "bg-gradient-to-br from-primary to-secondary shadow-lg",
                isDragging && "scale-110 animate-float"
              )}
            >
              {isDragging ? (
                <ImageIcon className="w-10 h-10 text-primary-foreground" />
              ) : (
                <Upload className="w-10 h-10 text-primary-foreground" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xl font-semibold text-foreground">
                {isDragging ? "Drop your image here" : "Upload Grade Screenshot"}
              </p>
              <p className="text-sm text-muted-foreground">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-muted-foreground/70">
                Supports PNG, JPG, JPEG
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
