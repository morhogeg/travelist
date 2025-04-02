
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  currentImage?: string;
  onImageChange: (imageDataUrl: string) => void;
  className?: string;
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImage,
  onImageChange,
  className,
  buttonText = "Change Image",
  buttonVariant = "outline"
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string;
      setPreviewImage(imageDataUrl);
      onImageChange(imageDataUrl);
      setIsUploading(false);
    };
    
    reader.onerror = () => {
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };
  
  const cancelPreview = () => {
    setPreviewImage(null);
  };
  
  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      {previewImage && (
        <div className="absolute top-2 right-2 z-10">
          <Button 
            variant="destructive" 
            size="icon" 
            className="h-6 w-6 rounded-full"
            onClick={cancelPreview}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      <div className="mt-2">
        <input
          type="file"
          accept="image/*"
          id="image-upload"
          className="sr-only"
          onChange={handleFileChange}
        />
        <label htmlFor="image-upload">
          <Button 
            variant={buttonVariant} 
            className="text-xs flex items-center gap-1"
            disabled={isUploading}
            asChild
          >
            <span>
              {isUploading ? (
                "Uploading..."
              ) : (
                <>
                  <Upload className="h-3 w-3" />
                  {buttonText}
                </>
              )}
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
};

export default ImageUploader;
