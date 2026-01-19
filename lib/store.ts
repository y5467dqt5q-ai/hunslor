import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Cart Store
interface CartItem {
  id: string
  productId: string
  variantId: string
  title: string
  price: number
  quantity: number
  image?: string
  variantData?: {
    color?: string | null
    memory?: string | null
    size?: string | null
    ram?: string | null
    storage?: string | null
  }
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const id = `${item.productId}-${item.variantId}`
        const currentItems = get().items
        const existing = currentItems.find(i => i.id === id)
        
        if (existing) {
          const updatedItems = currentItems.map(i =>
            i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i
          )
          set({ items: updatedItems })
        } else {
          set({ items: [...currentItems, { ...item, id }] })
        }
      },
      removeItem: (itemId) => {
        set({ items: get().items.filter(i => i.id !== itemId) })
      },
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
        } else {
          set({
            items: get().items.map(i =>
              i.id === itemId ? { ...i, quantity } : i
            )
          })
        }
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'hunslor-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
)

// Auth Store
interface User {
  id: string
  email: string
  name: string
}

interface AuthStore {
  user: User | null
  token: string | null
  setUser: (user: User | null, token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'hunslor-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// Favorites Store
interface FavoriteStore {
  favorites: string[] // Product IDs
  toggleFavorite: (productId: string) => void
  isFavorite: (productId: string) => boolean
}

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (productId) => {
        const favorites = get().favorites
        set({
          favorites: favorites.includes(productId)
            ? favorites.filter(id => id !== productId)
            : [...favorites, productId]
        })
      },
      isFavorite: (productId) => get().favorites.includes(productId),
    }),
    {
      name: 'hunslor-favorites',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// Toast Store
interface Toast {
  id: string
  message: string
  title: string
}

interface ToastStore {
  toasts: Toast[]
  showToast: (title: string, message: string) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  showToast: (title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    
    // Добавляем новое уведомление
    set({
      toasts: [...get().toasts, { id, title, message }]
    })
    
    // Автоматически удаляем через 3 секунды
    setTimeout(() => {
      const currentToasts = get().toasts
      set({
        toasts: currentToasts.filter(t => t.id !== id)
      })
    }, 3000)
  },
  removeToast: (id: string) => {
    set({
      toasts: get().toasts.filter(t => t.id !== id)
    })
  },
}))
