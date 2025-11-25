// Onboarding types

export interface OnboardingData {
  version: string;
  completedAt: string;
  skipped: boolean;
}

export interface OnboardingScreenProps {
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
}

export const ONBOARDING_VERSION = '1.0';
export const ONBOARDING_STORAGE_KEY = 'travelist-onboarding-completed';

export const isOnboardingComplete = (): boolean => {
  const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
  if (!stored) return false;

  try {
    const data: OnboardingData = JSON.parse(stored);
    return data.version === ONBOARDING_VERSION;
  } catch {
    return stored === 'true'; // Legacy fallback
  }
};

export const markOnboardingComplete = (skipped: boolean = false): void => {
  const data: OnboardingData = {
    version: ONBOARDING_VERSION,
    completedAt: new Date().toISOString(),
    skipped,
  };
  localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data));
};

export const resetOnboarding = (): void => {
  localStorage.removeItem(ONBOARDING_STORAGE_KEY);
};
