import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

const OrderSuccess = () => {
  const { id } = useParams();
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWhatsApp = async () => {
      try {
        const { data } = await api.get(`/checkout/whatsapp/${id}`);
        setWhatsappUrl(data.whatsappUrl);
      } catch (err) {
        setError("Failed to load WhatsApp link");
      } finally {
        setLoading(false);
      }
    };

    fetchWhatsApp();
  }, [id]);

  if (loading) return <p>Preparing your order...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 500, margin: "60px auto", textAlign: "center" }}>
      <h2>🎉 Order Placed Successfully</h2>

      <p>
        <strong>Order ID:</strong>
        <br />
        {id}
      </p>

      <hr />

      <h3>Payment Instructions</h3>
      <p>Please scan the eSewa QR and complete the payment.</p>

      {/* Replace with your real QR image */}
      <img
        src="/esewa-qr.png"
        alt="eSewa QR"
        style={{ width: 220, margin: "20px 0" }}
      />

      <p>After payment, message us on WhatsApp 👇</p>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        style={{
          display: "inline-block",
          padding: "12px 20px",
          background: "#25D366",
          color: "#fff",
          borderRadius: 6,
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        Message us on WhatsApp
      </a>
    </div>
  );
};

export default OrderSuccess;
