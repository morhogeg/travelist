import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Sparkles, Bell } from 'lucide-react';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingScreenProps } from '../types';

const features = [
  { icon: MapPin, label: 'Save any place', color: '#667eea' },
  { icon: Sparkles, label: 'AI organizes it', color: '#a855f7' },
  { icon: Bell, label: 'Get reminded nearby', color: '#764ba2' },
];

export const WelcomeScreen: React.FC<OnboardingScreenProps> = ({ onNext, onSkip }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ type: 'spring', stiffness: 80, damping: 18 }}
      className="flex flex-col h-full px-6 pt-14 pb-10 relative overflow-hidden"
    >
      {/* Background glow */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(102,126,234,0.13) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Skip */}
      <motion.div className="flex justify-end relative z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
        <button onClick={onSkip} className="text-muted-foreground text-sm font-medium py-2 px-3">Skip</button>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">

        {/* App icon */}
        <motion.div
          initial={{ scale: 0, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.1 }}
          className="mb-10 relative"
        >
          {/* Glow */}
          <motion.div
            className="absolute inset-[-12px] rounded-[36px] pointer-events-none"
            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', filter: 'blur(28px)', opacity: 0.35 }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="w-24 h-24 rounded-[28px] flex items-center justify-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 16px 48px rgba(102,126,234,0.4), 0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            {/* Shimmer */}
            <motion.div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.25) 50%, transparent 65%)' }}
              animate={{ x: ['-150%', '150%'] }}
              transition={{ duration: 2.2, delay: 0.8, repeat: Infinity, repeatDelay: 3.5 }}
            />
            <span className="text-4xl font-black text-white relative z-10">T</span>
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 14, delay: 0.3 }}
          className="text-[34px] font-bold text-foreground leading-tight mb-3"
        >
          Your travel memory,<br />
          <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            supercharged.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.4 }}
          className="text-[17px] text-muted-foreground leading-relaxed mb-10 max-w-[260px]"
        >
          Every place you discover — saved, organized, and waiting when you need it.
        </motion.p>

        {/* Feature pills */}
        <div className="flex flex-col gap-2.5 w-full max-w-[260px]">
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + i * 0.1, type: 'spring', stiffness: 120, damping: 16 }}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 border border-border/50 bg-card/60 backdrop-blur-sm"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${f.color}20` }}>
                <f.icon className="w-4 h-4" style={{ color: f.color }} />
              </div>
              <span className="text-sm font-medium text-foreground">{f.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.88, type: 'spring', stiffness: 80, damping: 14 }}
        className="relative z-10"
      >
        <OnboardingButton onClick={onNext}>Get Started</OnboardingButton>
      </motion.div>
    </motion.div>
  );
};
