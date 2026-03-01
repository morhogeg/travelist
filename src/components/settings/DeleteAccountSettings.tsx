import React, { useState, useEffect } from "react";
import { Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth, db } from "@/lib/firebase";
import {
  signOut,
  onAuthStateChanged,
  User,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { heavyHaptic } from "@/utils/ios/haptics";
import {
  AlertDialog,
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
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!auth) return;

    setUser(auth.currentUser);

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenDialog = () => {
    setPassword("");
    setError(null);
    setMessage(null);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteAccount = async () => {
    if (!auth || !db) return;
    setDeleteLoading(true);
    setError(null);
    setMessage(null);

    try {
      heavyHaptic();

      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        setError("No user found to delete.");
        setDeleteLoading(false);
        return;
      }

      // 1. Re-authenticate to satisfy Firebase's recent-login requirement
      //    (deleteUser is a sensitive operation and will fail without this)
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);

      // 2. Delete user's places from Firestore
      try {
        const q = query(
          collection(db, 'places'),
          where('user_id', '==', currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(placeDoc =>
          deleteDoc(doc(db, 'places', placeDoc.id))
        );
        await Promise.all(deletePromises);
      } catch (dataError: any) {
        if (import.meta.env.DEV) {
          console.warn("[Settings] Could not delete user records:", dataError.message);
        }
      }

      // 3. Delete the Firebase Auth account
      await deleteUser(currentUser);

      // 4. Clear all local storage data
      const keysToRemove = [
        'recommendations',
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
      setMessage("Your account has been permanently deleted.");

    } catch (err: any) {
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        setError("Incorrect password. Please try again.");
      } else if (err?.code === 'auth/too-many-requests') {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError(err?.message ?? "Could not delete account. Please try again.");
      }
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
          onClick={handleOpenDialog}
          className="border-destructive text-destructive hover:bg-destructive/10"
        >
          Delete My Account
        </Button>

        {message && <p className="text-xs text-green-600">{message}</p>}
        {error && !isDeleteDialogOpen && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account and all cloud-synced data. This cannot be undone.
              {"\n\n"}Enter your password to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && password && !deleteLoading) handleDeleteAccount();
              }}
              disabled={deleteLoading}
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <Button
              onClick={handleDeleteAccount}
              disabled={deleteLoading || !password}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? "Deleting..." : "Delete Account"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteAccountSettings;
