import { Link, useParams } from "react-router";

function ProductPage() {
  const { id } = useParams();

  return (
    <>
      <h1 className="page-title">Продукт №{id}</h1>
      <Link className="text-link" to="/products">
        Вернуться в каталог
      </Link>
    </>
  );
}

export default ProductPage;
