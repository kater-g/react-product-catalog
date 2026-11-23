import { useEffect, useRef } from "react";
import ProductCard from "../components/ProductCard/ProductCard.tsx";
import {
  useProductsStore,
  type ProductFilter,
} from "../store/productsStore.ts";
import styles from "./ProductsPage.module.css";

function ProductsPage() {
  const {
    products,
    favoriteIds,
    status,
    error,
    visibleCount,
    filter,
    fetchProducts,
    showMoreProducts,
    setFilter,
    toggleFavorite,
    deleteProduct,
  } = useProductsStore();
  const listRef = useRef<HTMLUListElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const nextFocusIndex = useRef<number | null>(null);

  const filteredProducts =
    filter === "favorites"
      ? products.filter((product) => favoriteIds.includes(product.id))
      : products;
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleProducts.length < filteredProducts.length;
  const emptyMessage =
    filter === "favorites"
      ? "В избранном пока нет продуктов. Добавьте их с помощью сердечка в разделе «Все»."
      : "В каталоге пока нет продуктов.";

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const index = nextFocusIndex.current;

    if (index === null) {
      return;
    }

    const items = listRef.current?.children;
    const targetIndex = Math.min(index, (items?.length ?? 0) - 1);
    const nextLink = items?.[targetIndex]?.querySelector("a");

    (nextLink ?? headingRef.current)?.focus();
    nextFocusIndex.current = null;
  }, [visibleCount, products, favoriteIds, filter]);

  function handleShowMore() {
    nextFocusIndex.current = visibleProducts.length;
    showMoreProducts();
  }

  function handleFilterChange(nextFilter: ProductFilter) {
    nextFocusIndex.current = null;
    setFilter(nextFilter);
  }

  function rememberFocusForRemovedCard(id: number) {
    const index = visibleProducts.findIndex((product) => product.id === id);

    if (index === -1) {
      return;
    }

    const item = listRef.current?.children[index];

    if (item?.contains(document.activeElement)) {
      nextFocusIndex.current = index;
    }
  }

  function handleDeleteProduct(id: number) {
    rememberFocusForRemovedCard(id);
    deleteProduct(id);
  }

  function handleToggleFavorite(id: number) {
    if (filter === "favorites") {
      rememberFocusForRemovedCard(id);
    }

    toggleFavorite(id);
  }

  return (
    <section className={styles["products"]} aria-labelledby="products-heading">
      <h1
        className="page-title"
        id="products-heading"
        ref={headingRef}
        tabIndex={-1}
      >
        Продукты
      </h1>

      <div
        className={styles["products__filters"]}
        role="group"
        aria-label="Фильтр продуктов"
      >
        <button
          className={styles["products__filter-button"]}
          type="button"
          aria-pressed={filter === "all"}
          onClick={() => handleFilterChange("all")}
        >
          Все
        </button>
        <button
          className={styles["products__filter-button"]}
          type="button"
          aria-pressed={filter === "favorites"}
          onClick={() => handleFilterChange("favorites")}
        >
          Избранное
        </button>
      </div>

      {(status === "idle" || status === "loading") && (
        <p role="status">Загрузка продуктов…</p>
      )}

      {status === "error" && (
        <div className={styles["products__state"]} role="alert">
          <p>{error}</p>
          <button
            className={styles["products__retry-button"]}
            type="button"
            onClick={() => void fetchProducts()}
          >
            Повторить загрузку
          </button>
        </div>
      )}

      {status === "success" && filteredProducts.length === 0 && (
        <p role="status">{emptyMessage}</p>
      )}

      {status === "success" && filteredProducts.length > 0 && (
        <>
          <ul
            className={styles["products__list"]}
            id="products-list"
            ref={listRef}
            role="list"
            aria-label={
              filter === "favorites" ? "Избранные продукты" : "Список продуктов"
            }
          >
            {visibleProducts.map((product) => (
              <li className={styles["products__item"]} key={product.id}>
                <ProductCard
                  product={product}
                  isFavorite={favoriteIds.includes(product.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDeleteProduct}
                />
              </li>
            ))}
          </ul>

          <div className={styles["products__pagination"]}>
            <p
              className={styles["products__count"]}
              role="status"
              aria-atomic="true"
            >
              Показано {visibleProducts.length} из {filteredProducts.length}
            </p>
            {hasMoreProducts && (
              <button
                className={styles["products__more-button"]}
                type="button"
                aria-controls="products-list"
                onClick={handleShowMore}
              >
                Показать больше
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default ProductsPage;
