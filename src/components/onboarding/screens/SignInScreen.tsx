import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, Shield, Smartphone } from 'lucide-react';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingScreenProps } from '../types';

// Apple logo SVG component
const AppleLogo = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

export const SignInScreen: React.FC<OnboardingScreenProps> = ({ onNext, onBack }) => {
  // For now, this is a placeholder - sign-in will be implemented with Supabase
  const handleAppleSignIn = () => {
    // TODO: Implement Apple Sign-In with Supabase
    // For now, just proceed to complete onboarding
    onNext();
  };

  const handleEmailSignIn = () => {
    // TODO: Implement Email Sign-In with Supabase
    // For now, just proceed to complete onboarding
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col h-full px-6 pt-16 pb-8"
    >
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-title-1 font-bold text-foreground mb-2">
            Create Your Account
          </h1>
          <p className="text-body text-muted-foreground">
            Sign in to save your places across all your devices
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 mb-10"
        >
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Cloud className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Sync everywhere</h3>
              <p className="text-sm text-muted-foreground">
                Access your places on any device
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Never lose data</h3>
              <p className="text-sm text-muted-foreground">
                Your recommendations are backed up securely
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Works offline</h3>
              <p className="text-sm text-muted-foreground">
                Browse and edit without internet
              </p>
            </div>
          </div>
        </motion.div>

        {/* Sign in buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3 flex-1 flex flex-col justify-end"
        >
          {/* Apple Sign In - Primary */}
          <button
            onClick={handleAppleSignIn}
            className="w-full py-4 px-6 rounded-2xl bg-foreground text-background font-semibold text-base flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
          >
            <AppleLogo />
            Sign in with Apple
          </button>

          {/* Email Sign In - Secondary */}
          <button
            onClick={handleEmailSignIn}
            className="w-full py-4 px-6 rounded-2xl bg-muted text-foreground font-semibold text-base transition-all active:scale-[0.98]"
          >
            Sign in with Email
          </button>

          {/* Temporary: Skip for development */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            Cloud sync coming soon. For now, data is stored locally.
          </p>
        </motion.div>
      </div>

      {/* Bottom navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <OnboardingButton onClick={onBack} variant="ghost">
          Back
        </OnboardingButton>
      </motion.div>
    </motion.div>
  );
};
