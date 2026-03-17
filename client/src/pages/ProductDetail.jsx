import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Badge from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";

const ProductDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [showCartModal, setShowCartModal] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/products/slug/${slug}`);
                setProduct(data);

                // Auto-select initial variant and plan
                if (data.variants && data.variants.length > 0) {
                    const initialVariant = data.variants[0];
                    setSelectedVariant(initialVariant);
                    const activePlans = initialVariant.pricingPlans?.filter(p => p.isActive !== false) || [];
                    const recommended = activePlans.find(p => p.isRecommended);
                    setSelectedPlan(recommended || activePlans[0] || null);
                } else if (data.pricingPlans && data.pricingPlans.length > 0) {
                    const activePlans = data.pricingPlans.filter(p => p.isActive !== false);
                    const recommended = activePlans.find(p => p.isRecommended);
                    setSelectedPlan(recommended || activePlans[0] || null);
                }
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load product");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

    const addToCart = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        setAddingToCart(true);
        try {
            await api.put("/cart/item", {
                productId: product._id,
                qty: quantity,
                planId: selectedPlan?.planId || "monthly",
                planLabel: selectedPlan?.label || "1 Month",
                durationInDays: selectedPlan?.durationInDays || 30,
                price: selectedPlan?.price || product.price,
                variantLabel: selectedVariant?.label, // Send variant info if present
            });
            setShowCartModal(true);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add to cart");
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        setAddingToCart(true);
        try {
            navigate("/checkout", {
                state: {
                    buyNowItem: {
                        productId: product._id,
                        title: product.title,
                        slug: product.slug,
                        image: product.images?.[0] || "",
                        qty: quantity,
                        price: selectedPlan?.price || product.price,
                        planId: selectedPlan?.planId || "monthly",
                        planLabel: selectedPlan?.label || "1 Month",
                        durationInDays: selectedPlan?.durationInDays || 30,
                        variantLabel: selectedVariant?.label || "",
                        requiredFields: product.requiredFields || [],
                    },
                },
            });
        } catch (err) {
            alert(err.response?.data?.message || "Failed to process Buy Now");
        } finally {
            setAddingToCart(false);
        }
    };

    const getTagVariant = (tag) => {
        const tagLower = tag.toLowerCase();
        if (tagLower === "ai") return "ai";
        if (tagLower === "entertainment") return "entertainment";
        if (tagLower === "education") return "education";
        if (tagLower === "vpn") return "vpn";
        if (tagLower === "productivity") return "productivity";
        return "default";
    };

    // Calculate savings compared to monthly
    const calculateSavings = (plan) => {
        const plansToSearch = selectedVariant ? selectedVariant.pricingPlans : product?.pricingPlans;
        if (!plansToSearch) return null;

        const monthlyPlan = plansToSearch.find(p => p.planId === "monthly" && p.isActive !== false);
        if (!monthlyPlan || plan.planId === "monthly") return null;

        const months = plan.durationInDays / 30;
        const equivalentMonthly = monthlyPlan.price * months;
        const savings = equivalentMonthly - plan.price;

        if (savings > 0) {
            const percentSaved = Math.round((savings / equivalentMonthly) * 100);
            return { amount: savings, percent: percentSaved };
        }
        return null;
    };

    // Get effective price per month
    const getMonthlyEquivalent = (plan) => {
        const months = plan.durationInDays / 30;
        return Math.round(plan.price / months);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="xl" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Product Not Found</h2>
                <p className="text-neutral-600 mb-6">{error}</p>
                <Button onClick={() => navigate("/")}>Back to Home</Button>
            </div>
        );
    }

    const activePlans = selectedVariant
        ? (selectedVariant.pricingPlans?.filter(p => p.isActive !== false) || [])
        : (product.pricingPlans?.filter(p => p.isActive !== false) || []);

    const hasPlans = activePlans.length > 0;
    const currentPrice = selectedPlan?.price || product.price;

    return (
        <div className="min-h-screen bg-neutral-50 py-6 sm:py-12">
            {showCartModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50 px-4 backdrop-blur-sm"
                    onClick={() => setShowCartModal(false)}
                >
                    <div
                        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 p-6 text-white">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-display font-bold">Added to cart</h2>
                            <p className="mt-1 text-sm text-white/90">
                                Your selection is saved and ready for checkout.
                            </p>
                        </div>

                        <div className="p-6">
                            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                                <p className="font-semibold text-neutral-900">{product.title}</p>
                                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-neutral-700">
                                    <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-neutral-200">
                                        Qty: {quantity}
                                    </span>
                                    {selectedPlan && (
                                        <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-neutral-200">
                                            Plan: {selectedPlan.label}
                                        </span>
                                    )}
                                    {selectedVariant && (
                                        <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-neutral-200">
                                            Variant: {selectedVariant.label}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-4 text-sm text-neutral-600">
                                    Total: <span className="font-bold text-primary-600">NPR {(currentPrice * quantity).toLocaleString()}</span>
                                </p>
                            </div>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowCartModal(false)}
                                    className="flex-1 border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100"
                                >
                                    Continue Shopping
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => navigate("/cart")}
                                    className="flex-1"
                                >
                                    View Cart
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Back Button */}
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-neutral-600 hover:text-primary-600 mb-8 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Products
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12">
                    {/* Product Image — always first */}
                    <div className="order-1 bg-white rounded-2xl shadow-card overflow-hidden">
                        <div className="aspect-square bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-6 sm:p-12">
                            <img
                                src={product.images?.[0] || "https://via.placeholder.com/600?text=No+Image"}
                                alt={product.title}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>

                    {/* Product Info (Title + Plans + Buttons) — on mobile: order-2, on desktop: right column */}
                    <div className="order-2 lg:row-span-2">
                        {/* Title */}
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-display font-bold text-neutral-900 mb-2 leading-tight">
                                {product.title}
                            </h1>
                            {product.purchaseCount > 0 && (
                                <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1">
                                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span><strong>{product.purchaseCount.toLocaleString()}</strong> people bought this</span>
                                </div>
                            )}
                        </div>

                        {/* Variant Selection */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-3">Select Version</h2>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map((variant, index) => {
                                        const isSelected = selectedVariant?.label === variant.label;
                                        const itemWidth = `calc(${100 / product.variants.length}% - ${(product.variants.length - 1) * 0.5 / product.variants.length}rem)`;
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setSelectedVariant(variant);
                                                    const vPlans = variant.pricingPlans?.filter(p => p.isActive !== false) || [];
                                                    const rec = vPlans.find(p => p.isRecommended);
                                                    setSelectedPlan(rec || vPlans[0] || null);
                                                }}
                                                className={`px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${isSelected
                                                    ? "border-primary-600 bg-primary-50 text-primary-700"
                                                    : "border-neutral-200 bg-white text-neutral-700 hover:border-primary-300 hover:bg-neutral-50"
                                                    }`}
                                                style={{ width: itemWidth }}
                                            >
                                                {variant.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Plan Selection */}
                        {hasPlans && (
                            <div className="mb-6">
                                <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-3">Choose Plan</h2>
                                <div className="grid gap-2">
                                    {activePlans.map((plan) => {
                                        const savings = calculateSavings(plan);
                                        const isSelected = selectedPlan?.planId === plan.planId;
                                        const monthlyEquiv = getMonthlyEquivalent(plan);

                                        return (
                                            <button
                                                key={plan.planId}
                                                onClick={() => setSelectedPlan(plan)}
                                                className={`relative w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${isSelected
                                                    ? "border-primary-500 bg-primary-50"
                                                    : "border-neutral-200 bg-white hover:border-neutral-300"
                                                    } ${plan.isRecommended ? "ring-2 ring-primary-300" : ""}`}
                                            >
                                                {plan.isRecommended && (
                                                    <div className="absolute -top-3 left-4 px-3 py-1 bg-primary-600 text-white text-[10px] font-bold tracking-wider uppercase rounded-full shadow-sm">
                                                        Recommended
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-primary-600 bg-primary-600" : "border-neutral-300"
                                                            }`}>
                                                            {isSelected && (
                                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-neutral-900 text-lg">
                                                                {plan.label}
                                                            </div>
                                                            {plan.planId !== "monthly" && (
                                                                <div className="text-sm text-neutral-500">
                                                                    NPR {monthlyEquiv.toLocaleString()}/month
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        {plan.originalPrice && plan.originalPrice > plan.price && (
                                                            <div className="text-sm text-neutral-400 line-through">
                                                                NPR {plan.originalPrice.toLocaleString()}
                                                            </div>
                                                        )}
                                                        <div className="text-2xl font-bold text-primary-600">
                                                            NPR {plan.price.toLocaleString()}
                                                        </div>
                                                        {savings && (
                                                            <div className="text-sm font-semibold text-green-600">
                                                                Save {savings.percent}% (NPR {savings.amount.toLocaleString()})
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Quantity & Add to Cart */}
                        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5 mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <label className="text-sm font-medium text-neutral-700">
                                        Quantity
                                    </label>
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-9 h-9 rounded-lg border-2 border-neutral-300 hover:border-primary-600 text-neutral-700 hover:text-primary-600 font-semibold transition-colors flex items-center justify-center"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        style={{ MozAppearance: "textfield" }}
                                        className="w-14 text-center text-lg font-semibold border-2 border-neutral-300 rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    />
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-9 h-9 rounded-lg border-2 border-neutral-300 hover:border-primary-600 text-neutral-700 hover:text-primary-600 font-semibold transition-colors flex items-center justify-center"
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-neutral-500 block">
                                        {selectedPlan ? `${selectedPlan.label} × ${quantity}` : `Total`}
                                    </span>
                                    <span className="text-2xl font-bold text-primary-600">
                                        NPR {(currentPrice * quantity).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 mb-3">
                                <Button
                                    variant="secondary"
                                    onClick={addToCart}
                                    disabled={addingToCart || product.countInStock === 0}
                                    className="flex-1 py-3"
                                >
                                    {addingToCart ? "Adding..." : product.countInStock === 0 ? "Out of Stock" : <span className="flex items-center justify-center gap-2">Add to Cart <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg></span>}
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleBuyNow}
                                    disabled={addingToCart || product.countInStock === 0}
                                    className="flex-1 py-3 bg-neutral-900 border-neutral-900 hover:bg-neutral-800"
                                >
                                    {addingToCart ? "Processing..." : "Buy Now"}
                                </Button>
                            </div>

                            <a
                                href={`https://wa.me/${product.whatsappNumber || '9779827133449'}?text=Hi%2C%20I%27m%20interested%20in%20${encodeURIComponent(product.title)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl px-6 py-3 transition-colors"
                            >
                                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                WhatsApp
                            </a>

                            {!user && (
                                <p className="text-sm text-neutral-500 text-center mt-3">
                                    You'll be redirected to login
                                </p>
                            )}
                        </div>

                        {/* Required Fields Info */}
                        {product.requiredFields && product.requiredFields.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    Activation Information Required
                                </h3>
                                <p className="text-sm text-blue-800 mb-2">
                                    You'll need to provide the following during checkout:
                                </p>
                                <ul className="space-y-1">
                                    {product.requiredFields.map((field) => (
                                        <li key={field} className="text-sm text-blue-900 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                                            {field.charAt(0).toUpperCase() + field.slice(1)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Delivery Info */}
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                            <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Delivery Timeline
                            </h3>
                            <p className="text-sm text-green-800">
                                ✓ Manual activation within <strong>{product.deliveryTime || "1-6 hours"}</strong> after payment verification
                            </p>
                            <p className="text-sm text-green-800 mt-1">
                                ✓ WhatsApp support available
                            </p>
                        </div>
                    </div>

                    {/* Tags + About this product — on mobile: order-3 (after buy section), on desktop: left column below image */}
                    <div className="order-3 flex flex-col gap-4">
                        {/* Tags */}
                        {((product.tags && product.tags.length > 0) || product.isFeatured) && (
                            <div className="flex flex-wrap gap-2">
                                {product.tags?.map((tag) => (
                                    <Badge key={tag} variant={getTagVariant(tag)}>
                                        {tag}
                                    </Badge>
                                ))}
                                {product.isFeatured && <Badge variant="accent">Featured</Badge>}
                            </div>
                        )}

                        {/* About this product */}
                        <div className="bg-white rounded-2xl shadow-card p-6">
                            <h2 className="text-lg font-semibold text-neutral-900 mb-3">About this product</h2>
                            <p className="text-neutral-700 leading-relaxed">
                                {product.description || "Premium digital product with instant activation."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
