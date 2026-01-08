import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    const { data } = await api.get("/products");
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <p>Loading products...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin — Products</h2>

      <Link to="/admin/products/new">
        <button>Create Product</button>
      </Link>

      <table border="1" cellPadding="8" cellSpacing="0" width="100%">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Tags</th>
            <th>Required Fields</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>{p.title}</td>
              <td>NPR {p.price}</td>
              <td>{p.countInStock}</td>
              <td>{p.tags?.join(", ")}</td>
              <td>{p.requiredFields?.join(", ")}</td>
              <td>
                <Link to={`/admin/products/${p._id}/edit`}>
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProducts;
