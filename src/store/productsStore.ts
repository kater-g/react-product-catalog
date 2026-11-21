import { create } from "zustand";
import { getProducts } from "../api/products.ts";
import type { Product } from "../types/product.ts";

type LoadingStatus = "idle" | "loading" | "success" | "error";

interface ProductsStore {
  products: Product[];
  status: LoadingStatus;
  error: string | null;
  fetchProducts: () => Promise<void>;
}

export const useProductsStore = create<ProductsStore>()((set, get) => ({
  products: [],
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
}));
