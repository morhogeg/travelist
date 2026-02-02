import React, { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth, isFirebaseReady } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";

const AuthSettings = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load current auth session
  useEffect(() => {
    if (!auth) return;

    // Initial check
    setUser(auth.currentUser);

    // Listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
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
      // 1. Try sign-in first
      try {
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
        setAuthMessage("Signed in!");
      } catch (signInErr: any) {
        // 2. If user not found (auth/user-not-found) or wrong password, try sign-up if it looks like a new user
        // Note: Firebase v9+ doesn't always distinguish for security, but we can attempt signup
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, trimmedEmail, password);
            setAuthMessage("Account created and signed in!");
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
    setAuthLoading(true);
    setAuthError(null);
    setAuthMessage(null);
    try {
      await signOut(auth);
      setEmail("");
      setPassword("");
      setAuthMessage("Signed out.");
    } catch (err: any) {
      setAuthError(err?.message ?? "Could not sign out");
    } finally {
      setAuthLoading(false);
    }
  };

  const userEmail = user?.email;

  return (
    <div className="w-full py-3 px-1 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Sparkles className="h-5 w-5 shrink-0" style={{ color: '#667eea' }} />
        <div className="flex-1 text-left min-w-0">
          <p className="font-medium text-[15px]">Cloud Sync (Firebase)</p>
          <p className="text-xs text-muted-foreground">
            Sign in to sync your recommendations across devices.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {!userEmail && (
          <>
            <div className="relative">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
              <Mail className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
              />
              <Lock className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </>
        )}

        <div className="flex items-center gap-2">
          {!userEmail && (
            <Button
              onClick={handleSignInOrUp}
              disabled={authLoading}
              className="flex-1 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
            >
              {authLoading ? "Working..." : "Sign in / Create account"}
            </Button>
          )}
          {userEmail && (
            <Button
              onClick={handleSignOut}
              disabled={authLoading}
              className="flex-1 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
            >
              {authLoading ? "Working..." : "Sign out"}
            </Button>
          )}
        </div>
        {userEmail && (
          <p className="text-xs text-muted-foreground">
            Signed in as <span className="font-semibold">{userEmail}</span>
          </p>
        )}
        {authMessage && <p className="text-xs text-green-600">{authMessage}</p>}
        {authError && <p className="text-xs text-destructive">{authError}</p>}
      </div>
    </div>
  );
};

export default AuthSettings;
