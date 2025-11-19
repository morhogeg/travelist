import React from "react";
import { motion } from "framer-motion";
import { Users, Instagram, BookOpen, Mail, MessageSquare, Music, Youtube, FileText, MoreHorizontal } from "lucide-react";
import { SourceType } from "@/utils/recommendation/types";
import { lightHaptic } from "@/utils/ios/haptics";

interface SourceSectionProps {
  values: SourceType[];
  onChange: (values: SourceType[]) => void;
}

const sourceIcons: Record<SourceType, React.ReactNode> = {
  friend: <Users className="h-4 w-4" />,
  instagram: <Instagram className="h-4 w-4" />,
  blog: <BookOpen className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  text: <MessageSquare className="h-4 w-4" />,
  tiktok: <Music className="h-4 w-4" />,
  youtube: <Youtube className="h-4 w-4" />,
  article: <FileText className="h-4 w-4" />,
  other: <MoreHorizontal className="h-4 w-4" />,
};

const sourceLabels: Record<SourceType, string> = {
  friend: "Friend",
  instagram: "Instagram",
  blog: "Blog",
  email: "Email",
  text: "Text",
  tiktok: "TikTok",
  youtube: "YouTube",
  article: "Article",
  other: "Other",
};

const SourceSection: React.FC<SourceSectionProps> = ({ values, onChange }) => {
  const handleToggle = (source: SourceType) => {
    lightHaptic();
    const newValues = values.includes(source)
      ? values.filter((s) => s !== source)
      : [...values, source];
    onChange(newValues);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Who Recommended</h3>
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(sourceIcons) as SourceType[]).map((source) => {
          const isSelected = values.includes(source);
          return (
            <motion.button
              key={source}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleToggle(source)}
              className={`
                flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl
                border ios26-transition-smooth
                ${
                  isSelected
                    ? "border-[#667eea] bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10"
                    : "border-white/20 liquid-glass-clear hover:border-[#667eea]/30"
                }
              `}
            >
              <div className={isSelected ? "text-[#667eea]" : "text-gray-600 dark:text-gray-400"}>
                {sourceIcons[source]}
              </div>
              <span
                className={`text-xs font-medium ${
                  isSelected ? "text-[#667eea]" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {sourceLabels[source]}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default SourceSection;
