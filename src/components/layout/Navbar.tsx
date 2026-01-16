import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Folder, UserCircle, MapPin, Inbox } from "lucide-react"; // Changed Bookmark → Folder
import { motion } from "framer-motion";
import { haptics } from "@/utils/ios/haptics";

const Navbar = () => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const hide = () => setIsVisible(false);
    const show = () => setIsVisible(true);
    window.addEventListener("navbar:hide", hide);
    window.addEventListener("navbar:show", show);
    return () => {
      window.removeEventListener("navbar:hide", hide);
      window.removeEventListener("navbar:show", show);
    };
  }, []);

  const navItems = [
    { path: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
    { path: "/inbox", label: "Inbox", icon: <Inbox className="h-5 w-5" /> },
    { path: "/collections", label: "Collections", icon: <Folder className="h-5 w-5" /> },
    { path: "/routes", label: "Routes", icon: <MapPin className="h-5 w-5" /> },
    { path: "/profile", label: "Profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: isVisible ? 0 : 100, opacity: isVisible ? 1 : 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 40,
        mass: 0.8,
      }}
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        paddingBottom: 0, // flush to bottom, ignore extra safe-area padding
      }}
    >
      {/* Full-width flush tab bar */}
      <nav className="liquid-glass-float w-full px-4 py-2 border-t border-white/10 dark:border-white/10 rounded-none shadow-none backdrop-blur">
        <ul className="flex items-center justify-around max-w-4xl mx-auto">
          {navItems.map((item) => (
            <li key={item.path} className="flex-1">
              <NavLink
                to={item.path}
                onClick={() => haptics.light()}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl ios26-transition-smooth ${isActive
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
