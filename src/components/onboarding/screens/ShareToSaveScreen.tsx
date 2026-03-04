import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Compass, Instagram, MapPin, Sparkles, Check } from 'lucide-react';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingScreenProps } from '../types';

const steps = [
  {
    num: '1',
    icon: Compass,
    iconColor: 'text-blue-400',
    title: 'Find it anywhere',
    sub: 'Safari, Instagram, Maps…',
  },
  {
    num: '2',
    icon: Share2,
    iconColor: 'text-[#667eea]',
    title: 'Tap Share → Travelist',
    sub: "In any app's share sheet",
  },
  {
    num: '3',
    icon: Check,
    iconColor: 'text-green-400',
    title: 'Saved & organized',
    sub: 'AI extracts all the details',
  },
];

export const ShareToSaveScreen: React.FC<OnboardingScreenProps> = ({ onNext, onBack, onSkip }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ type: 'spring', stiffness: 80, damping: 18 }}
      className="flex flex-col h-full px-6 pt-4 pb-2 relative overflow-hidden"
    >
      {/* Background glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(102,126,234,0.1) 0%, transparent 70%)' }}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">

        {/* Icon */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 140, damping: 14, delay: 0.1 }}
          className="mb-8 relative"
        >
          <motion.div
            className="absolute inset-[-10px] rounded-[32px] pointer-events-none"
            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', filter: 'blur(24px)', opacity: 0.3 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <div
            className="w-20 h-20 rounded-[24px] flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 12px 36px rgba(102,126,234,0.4)',
            }}
          >
            <Share2 className="w-9 h-9 text-white" />
            <motion.div
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shadow-lg"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, type: 'spring', stiffness: 100, damping: 14 }}
          className="text-[34px] font-bold text-foreground leading-tight mb-3 text-center"
        >
          Save from<br />anywhere.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="text-[16px] text-muted-foreground text-center mb-9 max-w-[260px]"
        >
          Found a place online? One tap and our AI captures every detail.
        </motion.p>

        {/* Steps */}
        <div className="w-full max-w-[300px] space-y-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.42 + i * 0.1, type: 'spring', stiffness: 120, damping: 16 }}
              className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm px-4 py-3"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
              >
                {step.num}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.sub}</p>
              </div>
              <step.icon className={`w-4 h-4 shrink-0 ${step.iconColor}`} />
            </motion.div>
          ))}
        </div>
      </div>

    </motion.div>
  );
};
