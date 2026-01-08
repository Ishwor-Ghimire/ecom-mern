import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders");
      setOrders(data);
    } catch {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updatePayment = async (orderId, status) => {
    await api.put(`/orders/${orderId}/payment`, { status });
    fetchOrders();
  };

  const updateStatus = async (orderId, status) => {
    await api.put(`/orders/${orderId}/status`, { status });
    fetchOrders();
  };

  // 🔍 Filtered result
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        order._id.toLowerCase().includes(searchText) ||
        order.user?.email?.toLowerCase().includes(searchText);

      const matchesPayment =
        paymentFilter === "all" ||
        order.payment.status === paymentFilter;

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesPayment && matchesStatus;
    });
  }, [orders, search, paymentFilter, statusFilter]);

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin — Orders</h2>

      {/* 🔍 Filters */}
      <div style={{ marginBottom: 16 }}>
        <input
          placeholder="Search Order ID or Email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 6, marginRight: 10 }}
        />

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          style={{ padding: 6, marginRight: 10 }}
        >
          <option value="all">All Payments</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: 6 }}
        >
          <option value="all">All Status</option>
          <option value="pending_payment">Pending</option>
          <option value="processing">Processing</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button
          onClick={() => {
            setSearch("");
            setPaymentFilter("all");
            setStatusFilter("all");
          }}
          style={{ marginLeft: 10 }}
        >
          Reset
        </button>
      </div>

      {/* 📦 Orders Table */}
      <table border="1" cellPadding="8" cellSpacing="0" width="100%">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User</th>
            <th>Items</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredOrders.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No orders found
              </td>
            </tr>
          )}

          {filteredOrders.map((order) => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.user?.email}</td>
              <td>
                {order.orderItems.map((i) => (
                  <div key={i.product}>
                    {i.title} × {i.qty}
                  </div>
                ))}
              </td>
              <td>NPR {order.totalPrice}</td>
              <td>{order.payment.status}</td>
              <td>{order.status}</td>
              <td>
                <button onClick={() => updatePayment(order._id, "paid")}>
                  Paid
                </button>
                <button onClick={() => updatePayment(order._id, "unpaid")}>
                  Unpaid
                </button>
                <br />
                <select
                  value={order.status}
                  onChange={(e) =>
                    updateStatus(order._id, e.target.value)
                  }
                >
                  <option value="pending_payment">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrders;
