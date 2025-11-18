import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Folder, UserCircle } from "lucide-react"; // Changed Bookmark → Folder
import { motion } from "framer-motion";
import { haptics } from "@/utils/ios/haptics";

const Navbar = () => {
  const navItems = [
    { path: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
    { path: "/collections", label: "Collections", icon: <Folder className="h-5 w-5" /> },
    { path: "/profile", label: "Profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      }}
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* iOS 26 Liquid Glass Floating Tab Bar */}
      <nav className="liquid-glass-float px-1.5 py-1.5">
        <ul className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map((item) => (
            <li key={item.path} className="flex-1">
              <NavLink
                to={item.path}
                onClick={() => haptics.light()}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl ios26-transition-smooth ${
                    isActive
                      ? "text-[#667eea]"
                      : "text-gray-500 dark:text-gray-400 hover:text-[#667eea] dark:hover:text-[#667eea]"
                  }`
                }
              >
                {item.icon}
                <span className="text-[10px] font-semibold">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </motion.div>
  );
};

export default Navbar;