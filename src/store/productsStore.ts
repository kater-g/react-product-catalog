import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getProducts, isProduct } from "../api/products.ts";
import type { NewProduct, Product } from "../types/product.ts";

const PRODUCTS_PER_BATCH = 12;

export type ProductFilter = "all" | "favorites";

type LoadingStatus = "idle" | "loading" | "success" | "error";

interface ProductsStore {
  products: Product[];
  createdProductIds: Product["id"][];
  favoriteIds: Product["id"][];
  visibleCount: number;
  filter: ProductFilter;
  status: LoadingStatus;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product: NewProduct) => void;
  showMoreProducts: () => void;
  setFilter: (filter: ProductFilter) => void;
  toggleFavorite: (id: Product["id"]) => void;
  deleteProduct: (id: Product["id"]) => void;
}

function restoreCreatedProducts(
  persistedState: unknown,
  currentState: ProductsStore,
): ProductsStore {
  if (
    typeof persistedState !== "object" ||
    persistedState === null ||
    !("products" in persistedState) ||
    !Array.isArray(persistedState.products) ||
    !persistedState.products.every(isProduct)
  ) {
    return currentState;
  }

  const products = persistedState.products;
  const createdProductIds = products.map((product) => product.id);

  if (new Set(createdProductIds).size !== products.length) {
    return currentState;
  }

  return { ...currentState, products, createdProductIds };
}

export const useProductsStore = create<ProductsStore>()(
  persist(
    (set, get) => ({
      products: [],
      createdProductIds: [],
      favoriteIds: [],
      visibleCount: PRODUCTS_PER_BATCH,
      filter: "all",
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
          set((state) => {
            const createdIds = new Set(state.createdProductIds);

            return {
              products: [
                ...state.products.filter((product) =>
                  createdIds.has(product.id),
                ),
                ...products.filter((product) => !createdIds.has(product.id)),
              ],
              status: "success",
            };
          });
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

      addProduct: (product) => {
        set((state) => {
          let id = Date.now();

          while (state.products.some((item) => item.id === id)) {
            id += 1;
          }

          return {
            products: [{ ...product, id }, ...state.products],
            createdProductIds: [...state.createdProductIds, id],
            filter: "all",
            visibleCount: PRODUCTS_PER_BATCH,
          };
        });
      },

      setFilter: (filter) => {
        set((state) => {
          if (state.filter === filter) {
            return state;
          }

          return { filter, visibleCount: PRODUCTS_PER_BATCH };
        });
      },

      showMoreProducts: () => {
        set((state) => {
          const totalCount =
            state.filter === "favorites"
              ? state.products.filter((product) =>
                  state.favoriteIds.includes(product.id),
                ).length
              : state.products.length;

          if (state.visibleCount >= totalCount) {
            return state;
          }

          return {
            visibleCount: Math.min(
              state.visibleCount + PRODUCTS_PER_BATCH,
              totalCount,
            ),
          };
        });
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
          createdProductIds: state.createdProductIds.filter(
            (createdId) => createdId !== id,
          ),
          favoriteIds: state.favoriteIds.filter(
            (favoriteId) => favoriteId !== id,
          ),
        }));
      },
    }),
    {
      name: "product-catalog-created-products",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        products: state.products.filter((product) =>
          state.createdProductIds.includes(product.id),
        ),
      }),
      merge: restoreCreatedProducts,
    },
  ),
);
