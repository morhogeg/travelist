
import React from "react";
import Navbar from "./Navbar";
import { motion } from "framer-motion";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="flex-1 pb-24"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        {children}
      </motion.div>
      <Navbar />
    </div>
  );
};

export default Layout;
