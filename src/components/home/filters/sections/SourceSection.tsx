import React from "react";
import { motion } from "framer-motion";
import { Users, Instagram, BookOpen, Mail, MessageSquare, Music, Youtube, FileText, MoreHorizontal, Sparkles } from "lucide-react";
import { SourceType } from "@/utils/recommendation/types";
import { lightHaptic } from "@/utils/ios/haptics";

interface SourceSectionProps {
  values: SourceType[];
  onChange: (values: SourceType[]) => void;
  sourceNames: string[];
  onSourceNamesChange: (values: string[]) => void;
  availableSourceNames: string[];
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
  ai: <Sparkles className="h-4 w-4" />,
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
  ai: "AI",
  other: "Other",
};

const SourceSection: React.FC<SourceSectionProps> = ({
  values,
  onChange,
  sourceNames,
  onSourceNamesChange,
  availableSourceNames
}) => {
  const handleToggle = (source: SourceType) => {
    lightHaptic();
    const newValues = values.includes(source)
      ? values.filter((s) => s !== source)
      : [...values, source];
    onChange(newValues);
  };

  const handleSourceNameToggle = (name: string) => {
    lightHaptic();
    const newValues = sourceNames.includes(name)
      ? sourceNames.filter((n) => n !== name)
      : [...sourceNames, name];
    onSourceNamesChange(newValues);
  };

  // Organized order: Social media, Personal, Content, AI, Other
  const orderedSources: SourceType[] = [
    'instagram',
    'tiktok',
    'youtube',
    'friend',
    'text',
    'email',
    'article',
    'ai',
    'other',
  ];

  const showFriendNames = values.includes('friend') && availableSourceNames.length > 0;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Source</h3>
      <div className="grid grid-cols-3 gap-2">
        {orderedSources.map((source) => {
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

      {/* Friend Names Selection */}
      {showFriendNames && (
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400">Filter by Friend</h4>
          <div className="flex flex-wrap gap-2">
            {availableSourceNames.map((name) => {
              const isSelected = sourceNames.includes(name);
              return (
                <motion.button
                  key={name}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSourceNameToggle(name)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium
                    border ios26-transition-smooth
                    ${
                      isSelected
                        ? "border-[#667eea] bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10 text-[#667eea]"
                        : "border-white/20 liquid-glass-clear text-gray-700 dark:text-gray-300 hover:border-[#667eea]/30"
                    }
                  `}
                >
                  {name}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SourceSection;
