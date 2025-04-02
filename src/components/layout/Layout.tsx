
import React from "react";
import Navbar from "./Navbar";
import ThemeToggle from "./ThemeToggle";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <ThemeToggle />
      <motion.div 
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="flex-1 pt-6 md:pt-10 pb-24"
      >
        {children}
      </motion.div>
      <Navbar />
    </div>
  );
};

export default Layout;
