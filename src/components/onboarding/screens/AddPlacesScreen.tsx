import React from 'react';
import { motion } from 'framer-motion';
import {
  Utensils,
  Bed,
  Eye,
  ShoppingBag,
  Music,
  Palmtree,
  MapPin,
  Plus,
  MessageSquare,
  Globe
} from 'lucide-react';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingScreenProps } from '../types';

const categories = [
  { id: 'food', label: 'Food', icon: Utensils, color: '#FEC6A1' },
  { id: 'lodging', label: 'Lodging', icon: Bed, color: '#E5DEFF' },
  { id: 'attractions', label: 'Attractions', icon: Eye, color: '#FFDEE2' },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag, color: '#D3E4FD' },
  { id: 'nightlife', label: 'Nightlife', icon: Music, color: '#accbee' },
  { id: 'outdoors', label: 'Outdoors', icon: Palmtree, color: '#F2FCE2' },
  { id: 'general', label: 'General', icon: MapPin, color: '#eef1f5' },
];

export const AddPlacesScreen: React.FC<OnboardingScreenProps> = ({ onNext, onBack, onSkip }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col h-full px-6 pt-16 pb-8"
    >
      {/* Skip link at top */}
      <div className="flex justify-end">
        <button
          onClick={onSkip}
          className="text-muted-foreground text-sm font-medium py-2 px-4"
        >
          Skip
        </button>
      </div>

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
            Save Places You Love
          </h1>
          <p className="text-body text-muted-foreground">
            Add recommendations from friends, blogs, or your own discoveries
          </p>
        </motion.div>

        {/* Category grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-4 gap-3 mb-8"
        >
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: category.color }}
                >
                  <Icon className="w-6 h-6 text-gray-700" />
                </div>
                <span className="text-caption text-muted-foreground text-center">
                  {category.label}
                </span>
              </motion.div>
            );
          })}
          {/* Add button placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.65 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-dashed" style={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', borderColor: 'rgba(102, 126, 234, 0.3)' }}>
              <Plus className="w-6 h-6" style={{ color: '#667eea' }} />
            </div>
            <span className="text-caption font-medium" style={{ color: '#667eea' }}>Add</span>
          </motion.div>
        </motion.div>

        {/* Features list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4 flex-1"
        >
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/50">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
              <MessageSquare className="w-5 h-5" style={{ color: '#667eea' }} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Track who recommended</h3>
              <p className="text-sm text-muted-foreground">
                Remember which friend, blog, or article suggested each place
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/50">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
              <Globe className="w-5 h-5" style={{ color: '#667eea' }} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Organized by city</h3>
              <p className="text-sm text-muted-foreground">
                All your places automatically sorted by destination
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-3"
      >
        <OnboardingButton onClick={onNext}>
          Continue
        </OnboardingButton>
        <OnboardingButton onClick={onBack} variant="ghost">
          Back
        </OnboardingButton>
      </motion.div>
    </motion.div>
  );
};
