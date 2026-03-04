import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ProblemScreen } from './screens/ProblemScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { ShareToSaveScreen } from './screens/ShareToSaveScreen';
import { AIMagicScreen } from './screens/AIMagicScreen';
import { GestureTutorialScreen } from './screens/GestureTutorialScreen';
import { SignInScreen } from './screens/SignInScreen';
import { OnboardingProgress } from './components/OnboardingProgress';
import { OnboardingButton } from './components/OnboardingButton';
import { markOnboardingComplete } from './types';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const TOTAL_STEPS = 6;
const SIGN_IN_STEP = 5;

// Per-step CTA config (not used for SignInScreen which owns its own buttons)
const STEP_CTA: { label: string; variant: 'primary' | 'secondary'; showBack: boolean }[] = [
  { label: 'There\'s a better way →', variant: 'secondary', showBack: false },
  { label: 'Get Started', variant: 'primary', showBack: false },
  { label: 'Continue', variant: 'primary', showBack: true },
  { label: 'Continue', variant: 'primary', showBack: true },
  { label: 'Got it, let\'s go', variant: 'primary', showBack: true },
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      markOnboardingComplete(false);
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSkip = () => {
    markOnboardingComplete(true);
    onComplete();
  };

  const renderScreen = () => {
    switch (currentStep) {
      case 0: return <ProblemScreen onNext={handleNext} onSkip={handleSkip} />;
      case 1: return <WelcomeScreen onNext={handleNext} onSkip={handleSkip} />;
      case 2: return <ShareToSaveScreen onNext={handleNext} onBack={handleBack} onSkip={handleSkip} />;
      case 3: return <AIMagicScreen onNext={handleNext} onBack={handleBack} onSkip={handleSkip} />;
      case 4: return <GestureTutorialScreen onNext={handleNext} onBack={handleBack} onSkip={handleSkip} />;
      case 5: return <SignInScreen onNext={handleNext} onBack={handleBack} />;
      default: return null;
    }
  };

  const cta = STEP_CTA[currentStep];
  const isSignIn = currentStep === SIGN_IN_STEP;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Progress + X button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-between px-6 pt-14 pb-3"
      >
        <div className="flex-1">
          <OnboardingProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        </div>
        {!isSignIn && (
          <button
            onClick={handleSkip}
            className="ml-4 p-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
        )}
      </motion.div>

      {/* Screen content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} className="h-full">
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed CTA — stable position across all non-SignIn steps */}
      {!isSignIn && (
        <div className="px-6 pb-10 pt-2 space-y-2">
          <OnboardingButton onClick={handleNext} variant={cta.variant}>
            {cta.label}
          </OnboardingButton>
          <OnboardingButton
            onClick={handleBack}
            variant="ghost"
            className={cta.showBack ? '' : 'invisible'}
          >
            Back
          </OnboardingButton>
        </div>
      )}
    </div>
  );
};

export default OnboardingFlow;
