import { useState } from "react";
import { Heart, ImageOff, Trash2 } from "lucide-react";
import { Link } from "react-router";
import type { Product } from "../../types/product.ts";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (id: Product["id"]) => void;
  onDelete: (id: Product["id"]) => void;
}

interface ProductImageProps {
  source: string | null;
  title: string;
}

const priceFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "USD",
});

function getImageSource(thumbnail: string): string | null {
  try {
    const url = new URL(thumbnail);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function ProductImage({ source, title }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (source === null || hasError) {
    return (
      <div
        className={styles["product-card__image-placeholder"]}
        role="img"
        aria-label={`Нет изображения товара «${title}»`}
      >
        <ImageOff size={32} aria-hidden="true" />
        <span>Нет изображения</span>
      </div>
    );
  }

  return (
    <img
      className={styles["product-card__image"]}
      src={source}
      alt={title}
      width={240}
      height={180}
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
    />
  );
}

function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  onDelete,
}: ProductCardProps) {
  const imageSource = getImageSource(product.thumbnail);
  const formattedPrice = priceFormatter.format(product.price);
  const favoriteLabel = `Избранное: «${product.title}»`;
  const favoriteTitle = isFavorite
    ? `Убрать «${product.title}» из избранного`
    : `Добавить «${product.title}» в избранное`;
  const deleteLabel = `Удалить «${product.title}»`;

  return (
    <article className={styles["product-card"]}>
      <Link
        className={styles["product-card__link"]}
        to={`/products/${product.id}`}
        aria-label={`Открыть «${product.title}»`}
      >
        <div className={styles["product-card__image-area"]}>
          {/* При смене URL новое изображение получает собственное состояние ошибки. */}
          <ProductImage
            key={imageSource ?? "no-image"}
            source={imageSource}
            title={product.title}
          />
        </div>

        <div className={styles["product-card__content"]}>
          <h2 className={styles["product-card__title"]}>{product.title}</h2>
          <p className={styles["product-card__description"]}>
            {product.description}
          </p>
        </div>
      </Link>

      <div className={styles["product-card__footer"]}>
        <p className={styles["product-card__price"]} title={formattedPrice}>
          {formattedPrice}
        </p>
        <div className={styles["product-card__actions"]}>
          <button
            className={`${styles["product-card__button"]} ${styles["product-card__button--favorite"]}`}
            type="button"
            aria-label={favoriteLabel}
            aria-pressed={isFavorite}
            title={favoriteTitle}
            onClick={() => onToggleFavorite(product.id)}
          >
            <Heart
              size={20}
              fill={isFavorite ? "currentColor" : "none"}
              aria-hidden="true"
            />
          </button>
          <button
            className={`${styles["product-card__button"]} ${styles["product-card__button--delete"]}`}
            type="button"
            aria-label={deleteLabel}
            title={deleteLabel}
            onClick={() => onDelete(product.id)}
          >
            <Trash2 size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
