import { create } from 'zustand';

export const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

const useStore = create((set, get) => ({
  status: STATUS.IDLE,
  setStatus: (s) => set({ status: s }),
  selectedItem: null,
  setSelectedItem: (item) => set({ selectedItem: item }),

  showSidebar: false,
  setShowSidebar: (v) => set({ showSidebar: v }),
  toggleSidebar: () => set((s) => ({ showSidebar: !s.showSidebar })),

  // tag filter state
  selectedTags: [],
  setSelectedTags: (tags) => set({ selectedTags: tags }),
  toggleTag: (tag) => set((s) => {
    const exists = s.selectedTags.includes(tag);
    return { selectedTags: exists ? s.selectedTags.filter(t => t !== tag) : [...s.selectedTags, tag] };
  }),

  // rights configuration
  rightsConfig: [],
  setRightsConfig: (rights) => set({ rightsConfig: rights }),
  loadRightsConfig: async () => {
    try {
      const response = await fetch('/data/rights.json');
      const data = await response.json();
      set({ rightsConfig: data });
    } catch (error) {
      console.error('Failed to load rights config:', error);
    }
  },
  getRightConfig: (key) => {
    const { rightsConfig } = get();
    return rightsConfig.find(r => r.key === key);
  },
  addRight: (right) => set((s) => ({
    rightsConfig: [...s.rightsConfig, { ...right, id: Date.now() }]
  })),
  updateRight: (id, updatedRight) => set((s) => ({
    rightsConfig: s.rightsConfig.map(r => r.id === id ? { ...r, ...updatedRight } : r)
  })),
  deleteRight: (id) => set((s) => ({
    rightsConfig: s.rightsConfig.filter(r => r.id !== id)
  })),
}));

export default useStore;