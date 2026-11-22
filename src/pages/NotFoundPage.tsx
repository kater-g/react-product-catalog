import { Link } from "react-router";

function NotFoundPage() {
  return (
    <>
      <h1 className="page-title">Страница не найдена</h1>
      <p>Проверьте адрес или вернитесь в каталог.</p>
      <Link className="text-link" to="/products">
        Вернуться в каталог
      </Link>
    </>
  );
}

export default NotFoundPage;
