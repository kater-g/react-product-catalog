import { useEffect, useState } from "react";
import { ArrowLeft, ImageOff } from "lucide-react";
import { Link, useParams } from "react-router";
import { useProductsStore } from "../store/productsStore.ts";
import styles from "./ProductPage.module.css";

const priceFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "USD",
});

function getImageSource(source: string): string | null {
  try {
    const url = new URL(source);

    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function ProductImage({ source, title }: { source: string; title: string }) {
  const [hasError, setHasError] = useState(false);
  const imageSource = getImageSource(source);

  if (imageSource === null || hasError) {
    return (
      <div
        className={styles["product__image-placeholder"]}
        role="img"
        aria-label={`Нет изображения товара «${title}»`}
      >
        <ImageOff size={40} aria-hidden="true" />
        <span>Нет изображения</span>
      </div>
    );
  }

  return (
    <img
      className={styles["product__image"]}
      src={imageSource}
      alt={title}
      width={480}
      height={480}
      decoding="async"
      onError={() => setHasError(true)}
    />
  );
}

function ProductPage() {
  const { id } = useParams();
  const { products, status, error, fetchProducts } = useProductsStore();
  const productId = Number(id);
  const isValidId =
    /^[1-9]\d*$/.test(id ?? "") && Number.isSafeInteger(productId);
  const product = products.find((item) => item.id === productId);

  useEffect(() => {
    if (isValidId) {
      void fetchProducts();
    }
  }, [id, isValidId, fetchProducts]);

  let content;

  if (!isValidId || (status === "success" && !product)) {
    content = (
      <div className={styles["product__state"]}>
        <h1 className="page-title">Продукт не найден</h1>
        <p>Возможно, продукт был удалён или ссылка указана неверно.</p>
      </div>
    );
  } else if (!product && status === "error") {
    content = (
      <div className={styles["product__state"]}>
        <h1 className="page-title">Не удалось загрузить продукт</h1>
        <p role="alert">{error}</p>
        <button
          className={styles["product__button"]}
          type="button"
          onClick={() => void fetchProducts()}
        >
          Повторить загрузку
        </button>
      </div>
    );
  } else if (!product) {
    content = (
      <div className={styles["product__state"]}>
        <h1 className="page-title">Информация о продукте</h1>
        <p role="status">Загрузка продукта…</p>
      </div>
    );
  } else {
    content = (
      <article className={styles["product__details"]}>
        <div className={styles["product__image-area"]}>
          <ProductImage
            key={`${product.id}:${product.thumbnail}`}
            source={product.thumbnail}
            title={product.title}
          />
        </div>
        <div className={styles["product__content"]}>
          <h1 className="page-title">{product.title}</h1>
          <dl className={styles["product__facts"]}>
            <div>
              <dt>Категория</dt>
              <dd>{product.category}</dd>
            </div>
            <div>
              <dt>Цена</dt>
              <dd className={styles["product__price"]}>
                {priceFormatter.format(product.price)}
              </dd>
            </div>
          </dl>
          <section className={styles["product__description"]}>
            <h2>Описание</h2>
            <p>{product.description}</p>
          </section>
        </div>
      </article>
    );
  }

  return (
    <div className={styles["product"]}>
      <Link className={styles["product__button"]} to="/products">
        <ArrowLeft size={20} aria-hidden="true" />
        Вернуться в каталог
      </Link>
      {content}
    </div>
  );
}

export default ProductPage;
