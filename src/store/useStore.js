import { create } from 'zustand';

export const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

const useStore = create((set) => ({
  status: STATUS.IDLE,
  setStatus: (s) => set({ status: s }),
  selectedItem: null,
  setSelectedItem: (item) => set({ selectedItem: item }),
  showSidebar: false,
  setShowSidebar: (v) => set({ showSidebar: v }),
  toggleSidebar: () => set((s) => ({ showSidebar: !s.showSidebar })),
}));

export default useStore;