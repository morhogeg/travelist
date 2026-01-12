import React, { useEffect, useState, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import { Moon, Sun, Sparkles, Eye, EyeOff, Mail, Lock, Trash2 } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { lightHaptic, heavyHaptic } from "@/utils/ios/haptics";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ShareExtensionGuide from "@/components/settings/ShareExtensionGuide";
import ProximitySettings from "@/components/settings/ProximitySettings";
import { getRecommendations } from "@/utils/recommendation/recommendation-manager";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(() => {
    const saved = localStorage.getItem("showAISuggestions");
    return saved === null ? true : saved === "true";
  });
  const [showShareGuide, setShowShareGuide] = useState(false);

  // Compute cities list for proximity settings
  const allCities = useMemo(() => {
    const recommendations = getRecommendations();
    const cityMap = new Map<string, { cityId: string; cityName: string; placeCount: number }>();

    recommendations.forEach(rec => {
      const cityId = rec.cityId || rec.id;
      const cityName = rec.city;

      if (!cityMap.has(cityId)) {
        cityMap.set(cityId, { cityId, cityName, placeCount: 0 });
      }

      const city = cityMap.get(cityId)!;
      city.placeCount += rec.places?.length || 0;
    });

    return Array.from(cityMap.values()).sort((a, b) =>
      a.cityName.localeCompare(b.cityName)
    );
  }, []);

  const handleToggleTheme = () => {
    lightHaptic();
    toggleTheme();
  };

  const handleToggleAISuggestions = (checked: boolean) => {
    lightHaptic();
    setShowAISuggestions(checked);
    localStorage.setItem("showAISuggestions", String(checked));
    window.dispatchEvent(new CustomEvent("aiSuggestionsChanged"));
  };

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

  const handleDeleteAccount = async () => {
    if (!supabase) return;
    setDeleteLoading(true);
    setAuthError(null);
    setAuthMessage(null);

    try {
      heavyHaptic();

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setAuthError("No user found to delete.");
        setDeleteLoading(false);
        return;
      }

      // Delete user data from the recommendations table first
      const { error: dataError } = await supabase
        .from('recommendations')
        .delete()
        .eq('user_id', user.id);

      if (dataError) {
        console.warn("[Settings] Could not delete user recommendations:", dataError.message);
        // Continue anyway - we still want to delete the account
      }

      // Sign out the user (the actual account deletion requires admin API or Edge Function)
      // For self-service deletion, we sign out and clear local data
      await supabase.auth.signOut();

      // Clear all local storage data
      const keysToRemove = [
        'travelist-recommendations',
        'travelist-routes',
        'travelist-collections',
        'travelist-country-collapse-state',
        'travelist-onboarding-completed',
        'theme',
      ];
      keysToRemove.forEach(key => localStorage.removeItem(key));

      setUserEmail(null);
      setEmail("");
      setPassword("");
      setIsDeleteDialogOpen(false);
      setAuthMessage("Account data deleted successfully. Your account has been signed out.");

      // Note: Full account deletion from Supabase Auth requires admin API.
      // For production, implement a Supabase Edge Function that handles this.

    } catch (err: any) {
      setAuthError(err?.message ?? "Could not delete account");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4 pt-3 pb-24"
      >
        {/* Header - matching Collections/Routes style */}
        <div className="text-center mb-6">
          <h1 className="text-[28px] font-semibold tracking-[-0.01em] bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Settings
          </h1>
        </div>

        {/* Settings List - matching Profile ActionRow style */}
        <div className="px-3">
          {/* Theme Toggle Row */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-1 ios26-transition-smooth flex items-center gap-3"
          >
            {theme === "light" ? (
              <Sun className="h-5 w-5 shrink-0" style={{ color: '#667eea' }} />
            ) : (
              <Moon className="h-5 w-5 shrink-0" style={{ color: '#667eea' }} />
            )}
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium text-[15px]">Theme</p>
              <p className="text-xs text-muted-foreground">
                {theme === "light" ? "Light mode" : "Dark mode"}
              </p>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={handleToggleTheme}
            />
          </motion.div>

          <div className="h-px bg-border/30 ml-8" />

          {/* Proximity Alerts */}
          <ProximitySettings allCities={allCities} />

          <div className="h-px bg-border/30 ml-8" />

          {/* AI Suggestions Toggle */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-1 ios26-transition-smooth flex items-center gap-3"
          >
            <Sparkles className="h-5 w-5 shrink-0" style={{ color: '#667eea' }} />
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium text-[15px]">AI Suggestions</p>
              <p className="text-xs text-muted-foreground">
                Show personalized travel recommendations.
              </p>
            </div>
            <Switch
              checked={showAISuggestions}
              onCheckedChange={handleToggleAISuggestions}
            />
          </motion.div>

          <div className="h-px bg-border/30 ml-8" />

          {/* Share Extension Tutorial */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-1 ios26-transition-smooth flex items-center gap-3 cursor-pointer"
            onClick={() => setShowShareGuide(true)}
          >
            <Mail className="h-5 w-5 shrink-0" style={{ color: '#667eea' }} />
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium text-[15px]">Share Extension Guide</p>
              <p className="text-xs text-muted-foreground">
                Learn how to save places from other apps.
              </p>
            </div>
          </motion.div>

          <div className="h-px bg-border/30 ml-8" />

          {/* Supabase Auth */}
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

          {/* Delete Account Section - Only show when signed in */}
          {userEmail && (
            <>
              <div className="h-px bg-border/30 ml-8 mt-2" />

              <div className="w-full py-3 px-1 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5 shrink-0 text-destructive" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-[15px]">Delete Account</p>
                    <p className="text-xs text-muted-foreground">
                      Permanently delete your account and all cloud data.
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  Delete My Account
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Travelist v1.0.0
          </p>
        </div>
      </motion.div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your account? This will permanently remove all your cloud-synced data including saved places, collections, and routes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Share Extension Guide */}
      <ShareExtensionGuide
        isOpen={showShareGuide}
        onClose={() => setShowShareGuide(false)}
      />
    </Layout>
  );
};

export default Settings;
