import { create } from 'zustand';
import { User, Petition, PetitionStatus, LegalDeadline } from './types';

interface AppState {
  user: User | null;
  isLoading: boolean;
  petitions: Petition[];
  activePetitionForFiling: Petition | null; // Petition currently being "filed" in simulator
  deadlines: LegalDeadline[];
  
  // Actions
  login: (email: string) => Promise<void>;
  logout: () => void;
  acceptDisclaimer: () => void;
  addPetition: (petition: Petition) => void;
  setLoading: (loading: boolean) => void;
  setPetitionForFiling: (petition: Petition | null) => void;
  addDeadline: (deadline: LegalDeadline) => void;
  toggleDeadline: (id: string) => void;
  removeDeadline: (id: string) => void;
}

// Mock initial data
const MOCK_PETITIONS: Petition[] = [
  {
    id: '1',
    title: 'Ação de Indenização por Danos Morais',
    type: 'Cível',
    clientName: 'João da Silva',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: PetitionStatus.DRAFT,
    content: 'Excelentíssimo Senhor Doutor Juiz...',
  },
  {
    id: '2',
    title: 'Divórcio Consensual',
    type: 'Família',
    clientName: 'Maria Oliveira',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    status: PetitionStatus.COMPLETED,
  }
];

const MOCK_DEADLINES: LegalDeadline[] = [
  {
    id: '1',
    processNumber: '1009876-55.2024.8.26.0100',
    description: 'Prazo para Réplica',
    deadlineDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
    notifyDaysBefore: 2,
    isCompleted: false,
  },
  {
    id: '2',
    processNumber: '0004561-12.2023.8.26.0050',
    description: 'Audiência de Instrução',
    deadlineDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
    notifyDaysBefore: 5,
    isCompleted: false,
  }
];

export const useStore = create<AppState>((set) => ({
  user: null,
  isLoading: false,
  petitions: MOCK_PETITIONS,
  activePetitionForFiling: null,
  deadlines: MOCK_DEADLINES,

  login: async (email: string) => {
    set({ isLoading: true });
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock user login - In production, this would use Supabase Auth
    set({
      user: {
        id: 'user_123',
        email,
        name: 'Dr. Roberto Almeida',
        oab: 'SP 123.456',
        acceptedLegalDisclaimer: false, // Default to false to show modal
      },
      isLoading: false,
    });
  },

  logout: () => {
    set({ user: null });
  },

  acceptDisclaimer: () => {
    set((state) => {
      if (!state.user) return state;
      // In production, update Supabase DB here
      return {
        user: {
          ...state.user,
          acceptedLegalDisclaimer: true,
        }
      };
    });
  },

  addPetition: (petition: Petition) => {
    set((state) => ({
      petitions: [petition, ...state.petitions]
    }));
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  
  setPetitionForFiling: (petition) => set({ activePetitionForFiling: petition }),

  addDeadline: (deadline: LegalDeadline) => {
    set((state) => ({
      deadlines: [...state.deadlines, deadline]
    }));
  },

  toggleDeadline: (id: string) => {
    set((state) => ({
      deadlines: state.deadlines.map(d => 
        d.id === id ? { ...d, isCompleted: !d.isCompleted } : d
      )
    }));
  },

  removeDeadline: (id: string) => {
    set((state) => ({
      deadlines: state.deadlines.filter(d => d.id !== id)
    }));
  }
}));