import { create } from 'zustand';
import rightsService from '../api/rightsService';

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
    set({ status: STATUS.LOADING });
    try {
      const data = await rightsService.getRights();
      set({ rightsConfig: data || [], status: STATUS.SUCCESS });
    } catch (error) {
      console.error('Failed to load rights config:', error);
      // 에러가 발생해도 기본 설정으로 계속 진행
      set({
        rightsConfig: [
          { key: 'member', label: 'Member', color: '#3b82f6', bgColor: '#dbeafe' },
          { key: 'admin', label: 'Admin', color: '#8b5cf6', bgColor: '#ede9fe' }
        ],
        status: STATUS.ERROR
      });
    }
  },
  getRightConfig: (key) => {
    const { rightsConfig } = get();
    return rightsConfig.find(r => r.key === key);
  },
  addRight: async (right) => {
    const created = await rightsService.createRight(right);
    set((s) => ({
      rightsConfig: [...s.rightsConfig, created],
    }));
    return created;
  },
  updateRight: async (id, updatedRight) => {
    const updated = await rightsService.updateRight(id, updatedRight);
    set((s) => ({
      rightsConfig: s.rightsConfig.map((r) => (r.id === id ? updated : r)),
    }));
    return updated;
  },
  deleteRight: async (id) => {
    await rightsService.deleteRight(id);
    set((s) => ({
      rightsConfig: s.rightsConfig.filter((r) => r.id !== id),
    }));
  },
}));

export default useStore;
