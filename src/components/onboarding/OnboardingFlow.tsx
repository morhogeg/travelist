import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ProblemScreen } from './screens/ProblemScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { ShareToSaveScreen } from './screens/ShareToSaveScreen';
import { AIMagicScreen } from './screens/AIMagicScreen';
import { ProximityAlertsScreen } from './screens/ProximityAlertsScreen';
import { GestureTutorialScreen } from './screens/GestureTutorialScreen';
import { NavigateScreen } from './screens/NavigateScreen';
import { SignInScreen } from './screens/SignInScreen';
import { OnboardingProgress } from './components/OnboardingProgress';
import { markOnboardingComplete } from './types';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const TOTAL_STEPS = 8;

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      markOnboardingComplete(false);
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    markOnboardingComplete(true);
    onComplete();
  };

  const renderScreen = () => {
    switch (currentStep) {
      case 0:
        return (
          <ProblemScreen
            onNext={handleNext}
            onSkip={handleSkip}
          />
        );
      case 1:
        return (
          <WelcomeScreen
            onNext={handleNext}
            onSkip={handleSkip}
          />
        );
      case 2:
        return (
          <ShareToSaveScreen
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        );
      case 3:
        return (
          <AIMagicScreen
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        );
      case 4:
        return (
          <ProximityAlertsScreen
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        );
      case 5:
        return (
          <GestureTutorialScreen
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        );
      case 6:
        return (
          <NavigateScreen
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        );
      case 7:
        return (
          <SignInScreen
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Progress indicator */}
      <div className="pt-safe-area-top">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-4 px-6"
        >
          <OnboardingProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        </motion.div>
      </div>

      {/* Screen content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            className="h-full"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Safe area padding at bottom */}
      <div className="pb-safe-area-bottom" />
    </div>
  );
};

export default OnboardingFlow;
