import { create } from "zustand";
import { getProducts } from "../api/products.ts";
import type { Product } from "../types/product.ts";

type LoadingStatus = "idle" | "loading" | "success" | "error";

interface ProductsStore {
  products: Product[];
  favoriteIds: Product["id"][];
  status: LoadingStatus;
  error: string | null;
  fetchProducts: () => Promise<void>;
  toggleFavorite: (id: Product["id"]) => void;
  deleteProduct: (id: Product["id"]) => void;
}

export const useProductsStore = create<ProductsStore>()((set, get) => ({
  products: [],
  favoriteIds: [],
  status: "idle",
  error: null,

  fetchProducts: async () => {
    const { status } = get();

    if (status === "loading" || status === "success") {
      return;
    }

    set({ status: "loading", error: null });

    try {
      const products = await getProducts();
      set({ products, status: "success" });
    } catch (error) {
      set({
        status: "error",
        error:
          error instanceof Error
            ? error.message
            : "Не удалось загрузить товары. Попробуйте ещё раз.",
      });
    }
  },

  toggleFavorite: (id) => {
    set((state) => {
      if (!state.products.some((product) => product.id === id)) {
        return state;
      }

      return {
        favoriteIds: state.favoriteIds.includes(id)
          ? state.favoriteIds.filter((favoriteId) => favoriteId !== id)
          : [...state.favoriteIds, id],
      };
    });
  },

  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter((product) => product.id !== id),
      favoriteIds: state.favoriteIds.filter((favoriteId) => favoriteId !== id),
    }));
  },
}));
