import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";
import { getLeafCategories } from "../utils/helper";
import dayjs from 'dayjs';

export const useStore = createWithEqualityFn((set) => ({
  isSidebarCollapsed: false,
  setIsSidebarCollapsed: (status) => set({ isSidebarCollapsed: status }),
  toggleSidebarCollapsed: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  isLoggedIn: false, // Initialize login status as false
  setIsLoggedIn: (status) => set({ isLoggedIn: status }),

  user: null,
  setUser: (userData) => set({ user: userData }),

  isAccountMenuOpen: false,
  setIsAccountMenuOpen: (isAccountMenuOpen) => set({ isAccountMenuOpen }),

  searchKeyword: '',
	setSearchKeyword: (state) => set({ searchKeyword: state }),

  shouldReFetch: false,
	setShouldReFetch: (state) => set({ shouldReFetch: state }),

  orders: [],
  setOrders: (orders) => set({ orders }),

  apiKeys: [],
  setApiKeys: (apiKeys) => set({ apiKeys }),

  products: [],
  setProducts: (products) => set({ products }),

  serialNumbers: [],
  setSerialNumbers: (serialNumbers) => set({ serialNumbers }),

  showEditModal: false,
  setShowEditModal: (status) => set({ showEditModal: status }),

  suppliers: [],
  setSuppliers: (suppliers) => {
    set({suppliers})
  },

  noticia: { message: '' , type: '' },
  setNoticia: ({ message, type}) => set({ noticia: { message, type } }),

  categories: [],
  setCategories: (categories) => {
    const categoryTree = getLeafCategories(categories);
    set({ categories: categoryTree });
  },

  roles: [],
  setRoles: (roles) => set({ roles }),

  selectedDateMultiDash: [dayjs().startOf('month'), dayjs().endOf('month')],
  setSelectedDateMultiDash: (dates) => set({ selectedDateMultiDash: dates }),


}), shallow);
