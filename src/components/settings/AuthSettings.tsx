import React, { useState, useEffect } from "react";
import { Cloud, Mail, Lock, Eye, EyeOff, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, isFirebaseReady } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { lightHaptic } from "@/utils/ios/haptics";

const AuthSettings = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!auth) return;
    setUser(auth.currentUser);
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) setExpanded(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignInOrUp = async () => {
    if (!isFirebaseReady() || !auth) {
      setAuthError("Firebase is not configured.");
      return;
    }
    setAuthLoading(true);
    setAuthMessage(null);
    setAuthError(null);

    const trimmedEmail = email.trim();
    try {
      try {
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
        setAuthMessage("Signed in!");
      } catch (signInErr: any) {
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, trimmedEmail, password);
            setAuthMessage("Account created!");
          } catch (signUpErr: any) {
            setAuthError(signUpErr.message);
          }
        } else {
          setAuthError(signInErr.message);
        }
      }
    } catch (err: any) {
      setAuthError(err?.message ?? "Unknown error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    lightHaptic();
    setAuthLoading(true);
    try {
      await signOut(auth);
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setAuthError(err?.message ?? "Could not sign out");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleToggleExpand = () => {
    lightHaptic();
    setExpanded(v => !v);
  };

  const userEmail = user?.email;

  // Signed-in state
  if (userEmail) {
    return (
      <div className="py-3 px-1 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
          <Cloud className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[15px]">Cloud Sync</p>
          <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
        </div>
        <button
          onClick={handleSignOut}
          disabled={authLoading}
          className="text-xs font-medium text-muted-foreground/70 h-8 px-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 ios26-transition-smooth shrink-0"
        >
          {authLoading ? "..." : "Sign Out"}
        </button>
      </div>
    );
  }

  // Signed-out: collapsed row with expandable form
  return (
    <div>
      {/* Header row - tappable */}
      <motion.div
        whileTap={{ scale: 0.99 }}
        className="py-3 px-1 flex items-center gap-3 cursor-pointer"
        onClick={handleToggleExpand}
      >
        <div className="w-8 h-8 rounded-lg bg-[#667eea]/15 flex items-center justify-center shrink-0">
          <Cloud className="h-4 w-4" style={{ color: '#667eea' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[15px]">Cloud Sync</p>
          <p className="text-xs text-muted-foreground">
            {expanded ? "Enter your credentials below" : "Tap to sign in or create an account"}
          </p>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground/50 shrink-0" />
        </motion.div>
      </motion.div>

      {/* Expandable form */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-1 pb-3 pt-1 flex flex-col gap-2.5 pl-[44px]">
              {/* Email field */}
              <div className="relative">
                <Mail className="h-3.5 w-3.5 text-muted-foreground/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 text-sm rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.07] outline-none focus:border-[#667eea]/50 transition-colors placeholder:text-muted-foreground/40"
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>

              {/* Password field */}
              <div className="relative">
                <Lock className="h-3.5 w-3.5 text-muted-foreground/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 pl-9 pr-10 text-sm rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.07] outline-none focus:border-[#667eea]/50 transition-colors placeholder:text-muted-foreground/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Sign in button */}
              <button
                onClick={handleSignInOrUp}
                disabled={authLoading || !email || !password}
                className="h-10 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] disabled:opacity-35 ios26-transition-smooth"
              >
                {authLoading ? "Working..." : "Continue"}
              </button>

              {authMessage && <p className="text-xs text-emerald-500">{authMessage}</p>}
              {authError && <p className="text-xs text-destructive/80">{authError}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthSettings;
