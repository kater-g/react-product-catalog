import { NavLink, Navigate, Route, Routes } from "react-router";
import ProductsPage from "./pages/ProductsPage.tsx";
import ProductPage from "./pages/ProductPage.tsx";
import CreateProductPage from "./pages/CreateProductPage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import styles from "./App.module.css";

function App() {
  return (
    <div className={styles["app"]}>
      <header className={styles["app__header"]}>
        <span className={styles["app__brand"]}>Каталог продуктов</span>
        <nav className={styles["app__nav"]} aria-label="Основная навигация">
          <NavLink className={styles["app__nav-link"]} to="/products">
            Продукты
          </NavLink>
          <NavLink className={styles["app__nav-link"]} to="/create-product">
            Создать продукт
          </NavLink>
        </nav>
      </header>

      <main className={styles["app__main"]}>
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/create-product" element={<CreateProductPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
