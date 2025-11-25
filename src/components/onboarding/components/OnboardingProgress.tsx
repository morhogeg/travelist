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
                ? 'hsl(var(--primary))'
                : index < currentStep
                  ? 'hsl(var(--primary) / 0.5)'
                  : 'hsl(var(--muted-foreground) / 0.3)',
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
