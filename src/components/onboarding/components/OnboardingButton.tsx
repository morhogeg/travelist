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
    primary: 'text-white shadow-lg',
    secondary: 'bg-muted text-foreground',
    ghost: 'bg-transparent text-muted-foreground',
  };

  const primaryStyle = variant === 'primary' ? {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
  } : undefined;

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
      style={primaryStyle}
    >
      {children}
    </motion.button>
  );
};
