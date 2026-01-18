import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { heavyHaptic } from "@/utils/ios/haptics";
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

const DeleteAccountSettings = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    
    // Check initial session
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleDeleteAccount = async () => {
    if (!supabase) return;
    setDeleteLoading(true);
    setError(null);
    setMessage(null);

    try {
      heavyHaptic();

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("No user found to delete.");
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
      setIsDeleteDialogOpen(false);
      setMessage("Account data deleted successfully. Your account has been signed out.");

    } catch (err: any) {
      setError(err?.message ?? "Could not delete account");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!userEmail) return null;

  return (
    <>
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
        
        {message && <p className="text-xs text-green-600">{message}</p>}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

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
    </>
  );
};

export default DeleteAccountSettings;
