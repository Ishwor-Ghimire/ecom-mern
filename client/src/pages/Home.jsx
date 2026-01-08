import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const Home = ({ searchQuery = "", tagFilter = "" }) => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await api.get("/products");
      setProducts(data);
      setFiltered(data);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;

    if (searchQuery) {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (tagFilter && tagFilter !== "All") {
      result = result.filter((p) =>
        p.tags?.includes(tagFilter)
      );
    }

    setFiltered(result);
  }, [searchQuery, tagFilter, products]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Digital Subscriptions
      </h1>

      {filtered.length === 0 ? (
        <p className="text-gray-500">No products found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <Link
              to={`/product/${p.slug}`}
              key={p._id}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition bg-white"
            >
              <img
                src={
                  p.image ||
                  "https://via.placeholder.com/400x250?text=No+Image"
                }
                alt={p.title}
                className="w-full h-48 object-cover"
              />

              <div className="p-4">
                <h2 className="font-semibold text-lg">
                  {p.title}
                </h2>
                <p className="text-gray-600">
                  NPR {p.price}
                </p>

                <div className="flex flex-wrap gap-2 mt-2">
                  {p.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
