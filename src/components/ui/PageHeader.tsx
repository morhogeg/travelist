
import React from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode; // Add icon prop
}

const PageHeader = ({ title, subtitle, icon }: PageHeaderProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="px-6 md:px-12 py-6"
    >
      <div className="flex items-center gap-3">
        {icon && icon}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
      </div>
      {subtitle && (
        <p className="text-muted-foreground mt-2 text-lg">{subtitle}</p>
      )}
    </motion.div>
  );
};

export default PageHeader;
