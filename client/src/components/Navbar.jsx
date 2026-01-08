import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const Navbar = ({ onSearch }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const submitSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
    navigate("/");
  };

  return (
    <header className="border-b">
      {/* TOP NAV */}
      <div className="bg-black text-white px-6 py-4 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold whitespace-nowrap">
          CheapGPT
        </Link>

        {/* Search */}
        <form
          onSubmit={submitSearch}
          className="flex-1 flex justify-center"
        >
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2 rounded text-black"
          />
        </form>

        {/* Right */}
        <div className="flex items-center gap-4 whitespace-nowrap">
          <Link to="/cart">🛒 Cart</Link>

          {!user ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <div className="relative group">
              <button className="flex items-center gap-2">
                <img
                  src={user.avatar || "https://i.pravatar.cc/40"}
                  alt="profile"
                  className="w-8 h-8 rounded-full"
                />
                <span>{user.name}</span>
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 mt-2 hidden group-hover:block bg-white text-black rounded shadow w-40">
                <Link
                  to="/orders"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  My Orders
                </Link>
                {user.role === "admin" && (
                  <Link
                    to="/admin/orders"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TAG BAR */}
      <div className="bg-gray-100 px-6 py-2 flex gap-4 overflow-x-auto">
        {["All", "AI", "Entertainment", "Education", "VPN"].map((tag) => (
          <button
            key={tag}
            onClick={() => onSearch?.("", tag)}
            className="px-4 py-1 rounded-full bg-white border hover:bg-black hover:text-white transition"
          >
            {tag}
          </button>
        ))}
      </div>
    </header>
  );
};

export default Navbar;
