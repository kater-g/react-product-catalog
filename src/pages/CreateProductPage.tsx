import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { useProductsStore } from "../store/productsStore.ts";
import type { NewProduct } from "../types/product.ts";
import styles from "./CreateProductPage.module.css";

type ProductFormValues = Omit<NewProduct, "price"> & { price: string };

function trimValue(value: string) {
  return value.trim();
}

function validatePrice(value: string) {
  const price = Number(value.replace(",", "."));

  return (
    (/^\d+(?:[.,]\d{1,2})?$/.test(value) &&
      Number.isFinite(price) &&
      Number.isSafeInteger(Math.round(price * 100))) ||
    "Введите неотрицательную цену: до 2 знаков после запятой."
  );
}

function validateImageSource(value: string) {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" ||
      url.protocol === "http:" ||
      "Укажите ссылку на изображение с http:// или https://."
    );
  } catch {
    return "Укажите корректную ссылку на изображение.";
  }
}

function CreateProductPage() {
  const addProduct = useProductsStore((state) => state.addProduct);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      price: "",
      thumbnail: "",
    },
  });

  function onSubmit(values: ProductFormValues) {
    addProduct({
      ...values,
      price: Number(values.price.replace(",", ".")),
      thumbnail: new URL(values.thumbnail).href,
    });
    navigate("/products");
  }

  return (
    <section
      className={styles["create-product"]}
      aria-labelledby="create-product-heading"
    >
      <h1 className="page-title" id="create-product-heading">
        Создание продукта
      </h1>
      <p>Заполните все поля. Цена указывается в долларах США.</p>
      <form
        className={styles["create-product__form"]}
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        {Object.keys(errors).length > 0 && (
          <p className={styles["create-product__error"]} role="alert">
            Проверьте заполнение выделенных полей.
          </p>
        )}
        <div className={styles["create-product__field"]}>
          <label htmlFor="product-title">Название</label>
          <input
            id="product-title"
            {...register("title", {
              required: "Введите название длиной от 2 до 120 символов.",
              minLength: {
                value: 2,
                message: "Название должно содержать не менее 2 символов.",
              },
              maxLength: {
                value: 120,
                message: "Название должно содержать не более 120 символов.",
              },
              setValueAs: trimValue,
            })}
            type="text"
            required
            minLength={2}
            maxLength={120}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "product-title-error" : undefined}
          />
          {errors.title && (
            <p
              className={styles["create-product__error"]}
              id="product-title-error"
            >
              {errors.title.message}
            </p>
          )}
        </div>
        <div className={styles["create-product__field"]}>
          <label htmlFor="product-description">Описание</label>
          <textarea
            id="product-description"
            {...register("description", {
              required: "Введите описание длиной от 10 до 3000 символов.",
              minLength: {
                value: 10,
                message: "Описание должно содержать не менее 10 символов.",
              },
              maxLength: {
                value: 3000,
                message: "Описание должно содержать не более 3000 символов.",
              },
              setValueAs: trimValue,
            })}
            required
            minLength={10}
            maxLength={3000}
            rows={5}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description ? "product-description-error" : undefined
            }
          />
          {errors.description && (
            <p
              className={styles["create-product__error"]}
              id="product-description-error"
            >
              {errors.description.message}
            </p>
          )}
        </div>
        <div className={styles["create-product__row"]}>
          <div className={styles["create-product__field"]}>
            <label htmlFor="product-category">Категория</label>
            <input
              id="product-category"
              {...register("category", {
                required: "Введите категорию длиной от 2 до 80 символов.",
                minLength: {
                  value: 2,
                  message: "Категория должна содержать не менее 2 символов.",
                },
                maxLength: {
                  value: 80,
                  message: "Категория должна содержать не более 80 символов.",
                },
                setValueAs: trimValue,
              })}
              type="text"
              required
              minLength={2}
              maxLength={80}
              aria-invalid={Boolean(errors.category)}
              aria-describedby={
                errors.category ? "product-category-error" : undefined
              }
            />
            {errors.category && (
              <p
                className={styles["create-product__error"]}
                id="product-category-error"
              >
                {errors.category.message}
              </p>
            )}
          </div>
          <div className={styles["create-product__field"]}>
            <label htmlFor="product-price">Цена, $</label>
            <input
              id="product-price"
              {...register("price", {
                required: "Укажите цену продукта.",
                validate: validatePrice,
                setValueAs: trimValue,
              })}
              type="text"
              inputMode="decimal"
              required
              aria-invalid={Boolean(errors.price)}
              aria-describedby={
                errors.price ? "product-price-error" : undefined
              }
            />
            {errors.price && (
              <p
                className={styles["create-product__error"]}
                id="product-price-error"
              >
                {errors.price.message}
              </p>
            )}
          </div>
        </div>
        <div className={styles["create-product__field"]}>
          <label htmlFor="product-thumbnail">Ссылка на изображение</label>
          <input
            id="product-thumbnail"
            {...register("thumbnail", {
              required: "Укажите ссылку на изображение.",
              maxLength: {
                value: 2048,
                message: "Ссылка должна содержать не более 2048 символов.",
              },
              validate: validateImageSource,
              setValueAs: trimValue,
            })}
            type="url"
            required
            maxLength={2048}
            placeholder="https://example.com/product.jpg"
            aria-invalid={Boolean(errors.thumbnail)}
            aria-describedby={
              errors.thumbnail ? "product-thumbnail-error" : undefined
            }
          />
          {errors.thumbnail && (
            <p
              className={styles["create-product__error"]}
              id="product-thumbnail-error"
            >
              {errors.thumbnail.message}
            </p>
          )}
        </div>
        <div className={styles["create-product__actions"]}>
          <button className={styles["create-product__submit"]} type="submit">
            Создать продукт
          </button>
          <Link className="text-link" to="/products">
            Вернуться в каталог
          </Link>
        </div>
      </form>
    </section>
  );
}

export default CreateProductPage;
