import { Link, useParams } from "react-router";

function ProductPage() {
  const { id } = useParams();

  return (
    <>
      <h1>Продукт №{id}</h1>
      <Link to="/products">Вернуться в каталог</Link>
    </>
  );
}

export default ProductPage;
