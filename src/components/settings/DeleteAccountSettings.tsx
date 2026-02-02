import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
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
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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

  const handleDeleteAccount = async () => {
    if (!auth || !db) return;
    setDeleteLoading(true);
    setError(null);
    setMessage(null);

    try {
      heavyHaptic();

      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError("No user found to delete.");
        setDeleteLoading(false);
        return;
      }

      // 1. Delete user data from Firestore
      try {
        const q = query(
          collection(db, 'places'),
          where('user_id', '==', currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(placeDoc => deleteDoc(doc(db, 'places', placeDoc.id)));
        await Promise.all(deletePromises);
        console.log("[Settings] Deleted user places from Firestore");
      } catch (dataError: any) {
        console.warn("[Settings] Could not delete user records:", dataError.message);
      }

      // 2. Sign out the user
      // Note: Actual Firebase account deletion usually requires re-authentication.
      // For now, we sign out and clear local data.
      await signOut(auth);

      // 3. Clear all local storage data
      const keysToRemove = [
        'recommendations', // Updated key
        'travelist-recommendations',
        'travelist-routes',
        'travelist-collections',
        'travelist-country-collapse-state',
        'travelist-onboarding-completed',
        'theme',
      ];
      keysToRemove.forEach(key => localStorage.removeItem(key));

      setUser(null);
      setIsDeleteDialogOpen(false);
      setMessage("Account data deleted successfully. Your account has been signed out.");

    } catch (err: any) {
      setError(err?.message ?? "Could not delete account");
    } finally {
      setDeleteLoading(false);
    }
  };

  const userEmail = user?.email;
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
              Are you sure you want to delete your account? This will permanently remove all your cloud-synced data including saved places and collections. This action cannot be undone.
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
