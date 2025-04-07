import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Folder, UserCircle } from "lucide-react"; // Changed Bookmark → Folder
import { motion } from "framer-motion";

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
      transition={{ duration: 0.5, delay: 0.3 }}
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2"
    >
      <nav className="mx-auto max-w-lg glass-card dark:bg-[#222222] dark:border-gray-700/30 shadow-lg px-4 py-3 rounded-full">
        <ul className="flex items-center justify-around">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? "text-primary bg-white/30 dark:bg-white/10"
                      : "text-muted-foreground hover:text-primary dark:hover:text-white"
                  }`
                }
              >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </motion.div>
  );
};

export default Navbar;