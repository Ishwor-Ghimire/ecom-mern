import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import api from "../api/axios";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchCartCount();
    }
  }, [user]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCartCount = async () => {
    try {
      const { data } = await api.get("/cart");
      const count = data.items?.reduce((sum, item) => sum + item.qty, 0) || 0;
      setCartCount(count);
    } catch (err) {
      // Silently fail
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="bg-primary-700 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0" onClick={closeMobile}>
            <div className="text-xl sm:text-3xl font-display font-bold tracking-tight group-hover:scale-105 transition-transform">
              CheapGPT
            </div>
          </Link>

          {/* Search Bar - Desktop only */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2.5 pr-12 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-md transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Right Side - Desktop */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Cart - Always visible */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
              <span className="hidden sm:inline text-sm">Cart</span>
            </Link>

            {/* Auth - Desktop only */}
            <div className="hidden md:flex items-center gap-3">
              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors font-medium text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-white/90 transition-colors font-medium text-sm"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-semibold text-sm">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="hidden lg:inline font-medium text-sm">{user.name}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-card-hover overflow-hidden z-50">
                      <Link to="/profile" onClick={() => setProfileOpen(false)} className="block px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                        My Profile
                      </Link>
                      <Link to="/orders" onClick={() => setProfileOpen(false)} className="block px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                        My Orders
                      </Link>
                      {user.role === "admin" && (
                        <>
                          <Link to="/admin/orders" onClick={() => setProfileOpen(false)} className="block px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                            Admin Orders
                          </Link>
                          <Link to="/admin/products" onClick={() => setProfileOpen(false)} className="block px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                            Admin Products
                          </Link>
                        </>
                      )}
                      <button
                        onClick={() => { logout(); setProfileOpen(false); }}
                        className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors font-medium"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hamburger - Mobile only */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/20 bg-primary-800">
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Search */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-2.5 pr-12 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-md transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Mobile Links */}
            <div className="space-y-1">
              {!user ? (
                <>
                  <Link to="/login" onClick={closeMobile} className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors font-medium text-sm">
                    Login
                  </Link>
                  <Link to="/register" onClick={closeMobile} className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors font-medium text-sm">
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 mb-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-semibold text-sm">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="font-medium text-sm">{user.name}</span>
                  </div>
                  <Link to="/profile" onClick={closeMobile} className="block px-4 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm">
                    My Profile
                  </Link>
                  <Link to="/orders" onClick={closeMobile} className="block px-4 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm">
                    My Orders
                  </Link>
                  {user.role === "admin" && (
                    <>
                      <Link to="/admin/orders" onClick={closeMobile} className="block px-4 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm">
                        Admin Orders
                      </Link>
                      <Link to="/admin/products" onClick={closeMobile} className="block px-4 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm">
                        Admin Products
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => { logout(); closeMobile(); }}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-red-300 hover:bg-white/10 transition-colors font-medium text-sm"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
