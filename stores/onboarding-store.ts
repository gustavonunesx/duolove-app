import { create } from 'zustand';

type Theme = 'rose' | 'lilac' | 'wine';

interface OnboardingState {
  name: string;
  avatarUri: string | null;
  relationshipStart: Date | null;
  theme: Theme;
  setName: (name: string) => void;
  setAvatarUri: (uri: string | null) => void;
  setRelationshipStart: (date: Date) => void;
  setTheme: (theme: Theme) => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  name: '',
  avatarUri: null,
  relationshipStart: null,
  theme: 'rose',
  setName: (name) => set({ name }),
  setAvatarUri: (avatarUri) => set({ avatarUri }),
  setRelationshipStart: (relationshipStart) => set({ relationshipStart }),
  setTheme: (theme) => set({ theme }),
}));
