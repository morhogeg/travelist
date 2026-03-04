import React from "react";
import { motion } from "framer-motion";

interface SettingsRowProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  onClick?: () => void;
  iconColor?: string;
  className?: string;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  icon: Icon,
  title,
  subtitle,
  action,
  onClick,
  iconColor = "#667eea",
  className = "",
}) => {
  return (
    <motion.div
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={`w-full py-3 px-1 ios26-transition-smooth flex items-center gap-3 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${iconColor}18` }}
      >
        <Icon className="h-4 w-4" style={{ color: iconColor }} />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="font-medium text-[15px]">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {action}
    </motion.div>
  );
};

export default SettingsRow;
