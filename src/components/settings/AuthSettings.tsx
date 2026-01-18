import React, { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

const AuthSettings = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load current auth session
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const currentEmail = data.session?.user?.email ?? null;
      setUserEmail(currentEmail);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentEmail = session?.user?.email ?? null;
      setUserEmail(currentEmail);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleSignInOrUp = async () => {
    if (!supabase) {
      setAuthError("Supabase is not configured.");
      return;
    }
    setAuthLoading(true);
    setAuthMessage(null);
    setAuthError(null);

    try {
      // Try sign-in first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        // If credentials invalid, attempt sign-up
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (signUpError) {
          setAuthError(signUpError.message);
        } else {
          setAuthMessage("Check your email to confirm your account, then sign in.");
        }
      } else {
        setAuthMessage("Signed in!");
      }
    } catch (err: any) {
      setAuthError(err?.message ?? "Unknown error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    setAuthLoading(true);
    setAuthError(null);
    setAuthMessage(null);
    try {
      await supabase.auth.signOut();
      setUserEmail(null);
      setEmail("");
      setPassword("");
      setAuthMessage("Signed out.");
    } catch (err: any) {
      setAuthError(err?.message ?? "Could not sign out");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="w-full py-3 px-1 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Sparkles className="h-5 w-5 shrink-0" style={{ color: '#667eea' }} />
        <div className="flex-1 text-left min-w-0">
          <p className="font-medium text-[15px]">Sync (Supabase)</p>
          <p className="text-xs text-muted-foreground">
            Sign in to sync your recommendations securely.
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
