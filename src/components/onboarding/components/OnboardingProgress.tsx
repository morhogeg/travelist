import React from 'react';
import { motion } from 'framer-motion';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <motion.div
          key={index}
          className="rounded-full"
          initial={false}
          animate={{
            width: index === currentStep ? 24 : 8,
            height: 8,
            backgroundColor:
              index === currentStep
                ? '#667eea'
                : index < currentStep
                  ? 'rgba(102,126,234,0.5)'
                  : 'rgba(255,255,255,0.2)',
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />
      ))}
    </div>
  );
};
