import React from "react";
import { motion } from "framer-motion";
import { Users, Instagram, BookOpen, Mail, MessageSquare, Music, Youtube, FileText, MoreHorizontal, Sparkles } from "lucide-react";
import { SourceType } from "@/utils/recommendation/types";
import { lightHaptic } from "@/utils/ios/haptics";
import SourcePill from "@/components/ui/SourcePill";

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
    const isRemoving = values.includes(source);
    const newValues = isRemoving
      ? values.filter((s) => s !== source)
      : [...values, source];
    onChange(newValues);

    if (isRemoving) {
      const typeNamesToRemove = [source, source.charAt(0).toUpperCase() + source.slice(1)];
      const newSourceNames = sourceNames.filter(
        name => !typeNamesToRemove.includes(name) && name.toLowerCase() !== source.toLowerCase()
      );
      if (newSourceNames.length !== sourceNames.length) {
        onSourceNamesChange(newSourceNames);
      }
    }
  };

  const handleSourceNameToggle = (name: string) => {
    lightHaptic();
    const newValues = sourceNames.includes(name)
      ? sourceNames.filter((n) => n !== name)
      : [...sourceNames, name];
    onSourceNamesChange(newValues);
  };

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

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Source</h3>
      <div className="flex flex-wrap gap-2">
        {orderedSources.map((source) => {
          const isSelected = values.includes(source);
          return (
            <SourcePill
              key={source}
              label={sourceLabels[source]}
              icon={sourceIcons[source]}
              isActive={isSelected}
              onClick={() => handleToggle(source)}
            />
          );
        })}
      </div>

      {values.includes('friend') && availableSourceNames.length > 0 && (
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400">Filter by Friend</h4>
          <div className="flex flex-wrap gap-2">
            {availableSourceNames.map((name) => {
              const isSelected = sourceNames.includes(name);
              return (
                <SourcePill
                  key={name}
                  label={name}
                  isActive={isSelected}
                  onClick={() => handleSourceNameToggle(name)}
                  className="h-8 min-h-0 py-1"
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SourceSection;
