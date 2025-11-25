import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OnboardingButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  disabled?: boolean;
}

export const OnboardingButton: React.FC<OnboardingButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  className,
  disabled = false,
}) => {
  const baseStyles = 'w-full py-4 px-6 rounded-2xl font-semibold text-base transition-all';

  const variants = {
    primary: 'bg-primary text-primary-foreground shadow-lg',
    secondary: 'bg-muted text-foreground',
    ghost: 'bg-transparent text-muted-foreground',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseStyles,
        variants[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </motion.button>
  );
};
