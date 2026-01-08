import Product from "../models/Product.js";

// GET /api/products
// Public – list all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/products
// Admin only – create product
export const createProduct = async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      price,
      images,
      category,
      brand,
      countInStock,
    } = req.body;

    if (!title || !slug || !description || !price || !category) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const exists = await Product.findOne({ slug });
    if (exists) {
      return res.status(409).json({ message: "Product slug already exists" });
    }

    const product = await Product.create({
      title,
      slug,
      description,
      price,
      images,
      category,
      brand,
      countInStock,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

  
};

// GET /api/products/:slug
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// PUT /api/products/:id
// Admin only – update product (tags, requiredFields, etc.)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const allowedFields = [
      "title",
      "slug",
      "description",
      "price",
      "images",
      "category",
      "brand",
      "countInStock",
      "isFeatured",
      "tags",
      "requiredFields",
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // sanitize arrays
    if (updates.tags) {
      updates.tags = Array.isArray(updates.tags)
        ? updates.tags.map((t) => String(t).trim()).filter(Boolean)
        : [];
    }

    if (updates.requiredFields) {
      const allowedReq = ["email", "phone", "username", "uid"];
      updates.requiredFields = Array.isArray(updates.requiredFields)
        ? updates.requiredFields
            .map((f) => String(f).trim())
            .filter((f) => allowedReq.includes(f))
        : [];
    }

    // slug uniqueness check (if changing slug)
    if (updates.slug) {
      const exists = await Product.findOne({ slug: updates.slug, _id: { $ne: id } });
      if (exists) return res.status(409).json({ message: "Product slug already exists" });
    }

    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
