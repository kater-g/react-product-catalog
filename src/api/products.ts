import type { Product } from "../types/product.ts";

const PRODUCTS_URL =
  "https://dummyjson.com/products?limit=0&select=id,title,description,price,thumbnail,category";
const REQUEST_TIMEOUT_MS = 15_000;

function isProduct(value: unknown): value is Product {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "number" &&
    Number.isSafeInteger(value.id) &&
    value.id > 0 &&
    "title" in value &&
    typeof value.title === "string" &&
    "description" in value &&
    typeof value.description === "string" &&
    "price" in value &&
    typeof value.price === "number" &&
    Number.isFinite(value.price) &&
    value.price >= 0 &&
    "thumbnail" in value &&
    typeof value.thumbnail === "string" &&
    "category" in value &&
    typeof value.category === "string"
  );
}

export async function getProducts(): Promise<Product[]> {
  const controller = new AbortController();
  // Тайм-аут действует и во время чтения тела ответа.
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(PRODUCTS_URL, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Не удалось загрузить товары (код ${response.status}).`);
    }

    const data: unknown = await response.json();

    if (
      typeof data !== "object" ||
      data === null ||
      !("products" in data) ||
      !Array.isArray(data.products) ||
      !data.products.every(isProduct)
    ) {
      throw new Error("Сервер вернул некорректный список товаров.");
    }

    const productIds = new Set(data.products.map((product) => product.id));

    if (productIds.size !== data.products.length) {
      throw new Error(
        "Сервер вернул товары с повторяющимися идентификаторами.",
      );
    }

    return data.products;
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error("Сервер не ответил вовремя. Попробуйте ещё раз.", {
        cause: error,
      });
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
