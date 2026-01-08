import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Checkout = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [items, setItems] = useState([]);
  const [requiredFields, setRequiredFields] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const [activationDetails, setActivationDetails] = useState({
    email: "",
    phone: "",
    username: "",
    uid: "",
  });

  // Load checkout summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get("/checkout/summary");
        setItems(data.items);
        setRequiredFields(data.requiredFields || []);
        setTotalPrice(data.totalPrice);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load checkout");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const handleChange = (field, value) => {
    setActivationDetails((prev) => ({ ...prev, [field]: value }));
  };

  const placeOrder = async () => {
    setError("");

    try {
      const { data } = await api.post("/orders", {
        activationDetails,
        paymentMethod: "esewa_qr",
      });

      navigate(`/order-success/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Order failed");
    }
  };

  if (loading) return <p>Loading checkout...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>Checkout</h2>

      <h3>Items</h3>
      <ul>
        {items.map((item) => (
          <li key={item.productId}>
            {item.title} × {item.qty} — NPR {item.price * item.qty}
          </li>
        ))}
      </ul>

      <h3>Total: NPR {totalPrice}</h3>

      <h3>Activation Details</h3>

      {requiredFields.includes("email") && (
        <div>
          <label>Email</label>
          <input
            type="email"
            value={activationDetails.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
        </div>
      )}

      {requiredFields.includes("phone") && (
        <div>
          <label>Phone</label>
          <input
            type="text"
            value={activationDetails.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>
      )}

      {requiredFields.includes("username") && (
        <div>
          <label>Username</label>
          <input
            type="text"
            value={activationDetails.username}
            onChange={(e) => handleChange("username", e.target.value)}
          />
        </div>
      )}

      {requiredFields.includes("uid") && (
        <div>
          <label>UID</label>
          <input
            type="text"
            value={activationDetails.uid}
            onChange={(e) => handleChange("uid", e.target.value)}
          />
        </div>
      )}

      <br />

      <button onClick={placeOrder}>Place Order</button>
    </div>
  );
};

export default Checkout;
