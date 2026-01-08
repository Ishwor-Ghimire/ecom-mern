import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    price: "",
    countInStock: 999999,
    tags: "",
    requiredFields: [],
  });

  useEffect(() => {
    if (!isEdit) return;

    const loadProduct = async () => {
      const { data } = await api.get(`/products/${id}`);
      setForm({
        title: data.title,
        slug: data.slug,
        description: data.description,
        price: data.price,
        countInStock: data.countInStock,
        tags: (data.tags || []).join(", "),
        requiredFields: data.requiredFields || [],
      });
    };

    loadProduct();
  }, [id, isEdit]);

  const toggleField = (field) => {
    setForm((prev) => ({
      ...prev,
      requiredFields: prev.requiredFields.includes(field)
        ? prev.requiredFields.filter((f) => f !== field)
        : [...prev.requiredFields, field],
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      price: Number(form.price),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    if (isEdit) {
      await api.put(`/products/${id}`, payload);
    } else {
      await api.post("/products", payload);
    }

    navigate("/admin/products");
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>{isEdit ? "Edit" : "Create"} Product</h2>

      <form onSubmit={submitHandler}>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <input
          placeholder="Slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          required
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />

        <input
          type="number"
          placeholder="Stock"
          value={form.countInStock}
          onChange={(e) =>
            setForm({ ...form, countInStock: e.target.value })
          }
        />

        <input
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
        />

        <h4>Required Activation Fields</h4>
        {["email", "phone", "username", "uid"].map((f) => (
          <label key={f} style={{ display: "block" }}>
            <input
              type="checkbox"
              checked={form.requiredFields.includes(f)}
              onChange={() => toggleField(f)}
            />
            {f}
          </label>
        ))}

        <br />
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default AdminProductForm;
