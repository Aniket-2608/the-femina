import { Product } from '../../models/Product.js';
import { ProductVariant } from '../../models/ProductVariant.js';
import { Category } from '../../models/Category.js';
import { Fabric } from '../../models/Fabric.js';
import { Occasion } from '../../models/Occasion.js';
import { AppError } from '../../middlewares/errorHandler.js';

export interface ProductFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  fabric?: string | string[];
  occasion?: string | string[];
  workType?: string | string[];
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'recommended' | 'newest' | 'price_low' | 'price_high' | 'rating' | 'best_seller';
  isNewArrival?: boolean;
  isFeatured?: boolean;
}

export class ProductService {
  static async getProducts(query: ProductFilterQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 12));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { isPublished: true };

    // Text Search
    if (query.search && query.search.trim()) {
      filter.$text = { $search: query.search.trim() };
    }

    // Category filter (support slug or ObjectId)
    if (query.category) {
      const categoryDoc = await Category.findOne({
        $or: [{ slug: query.category }, { name: query.category }],
      });
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      }
    }

    // Fabric filter
    if (query.fabric) {
      const fabrics = Array.isArray(query.fabric) ? query.fabric : [query.fabric];
      filter['attributes.fabric'] = { $in: fabrics };
    }

    // Occasion filter
    if (query.occasion) {
      const occasions = Array.isArray(query.occasion) ? query.occasion : [query.occasion];
      filter['attributes.occasion'] = { $in: occasions };
    }

    // Work / Embroidery filter
    if (query.workType) {
      const workTypes = Array.isArray(query.workType) ? query.workType : [query.workType];
      filter['attributes.workType'] = { $in: workTypes };
    }

    // Price Range Filter
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.basePrice = {};
      if (query.minPrice !== undefined) (filter.basePrice as Record<string, number>).$gte = Number(query.minPrice);
      if (query.maxPrice !== undefined) (filter.basePrice as Record<string, number>).$lte = Number(query.maxPrice);
    }

    // Boolean flags
    if (query.isNewArrival) filter.isNewArrival = true;
    if (query.isFeatured) filter.isFeatured = true;

    // Sorting
    let sortCriteria: Record<string, 1 | -1> = { createdAt: -1 };
    switch (query.sort) {
      case 'price_low':
        sortCriteria = { basePrice: 1 };
        break;
      case 'price_high':
        sortCriteria = { basePrice: -1 };
        break;
      case 'rating':
        sortCriteria = { 'ratingSummary.average': -1 };
        break;
      case 'best_seller':
        sortCriteria = { isBestSeller: -1, createdAt: -1 };
        break;
      case 'newest':
        sortCriteria = { createdAt: -1 };
        break;
      case 'recommended':
      default:
        sortCriteria = { isFeatured: -1, createdAt: -1 };
        break;
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    // Attach variant colors & sizes summary to each product card
    const productIds = products.map((p) => p._id);
    const variants = await ProductVariant.find({
      productId: { $in: productIds },
      isActive: true,
    }).lean();

    const productsWithVariants = products.map((product) => {
      const pVariants = variants.filter((v) => v.productId.toString() === product._id.toString());
      const distinctColors = Array.from(
        new Map(pVariants.map((v) => [v.color.hexCode, v.color])).values()
      );
      const distinctSizes = Array.from(new Set(pVariants.map((v) => v.size)));
      const hasStock = pVariants.some((v) => v.availableQuantity > 0);

      return {
        ...product,
        availableColors: distinctColors,
        availableSizes: distinctSizes,
        isInStock: hasStock,
        variantsCount: pVariants.length,
      };
    });

    return {
      products: productsWithVariants,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getProductBySlug(slug: string) {
    const product = await Product.findOne({ slug, isPublished: true })
      .populate('category', 'name slug')
      .lean();

    if (!product) {
      throw new AppError('Product not found or currently unavailable.', 404, 'PRODUCT_NOT_FOUND');
    }

    const variants = await ProductVariant.find({
      productId: product._id,
      isActive: true,
    }).lean();

    // Related Products (same category or fabric)
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      isPublished: true,
      $or: [{ category: product.category }, { 'attributes.fabric': product.attributes.fabric }],
    })
      .limit(4)
      .lean();

    return {
      product: {
        ...product,
        variants,
      },
      relatedProducts,
    };
  }

  static async getTaxonomy() {
    const [categories, fabrics, occasions, allProducts] = await Promise.all([
      Category.find({ isActive: true }).sort({ displayOrder: 1 }).lean(),
      Fabric.find({ isActive: true }).sort({ displayOrder: 1 }).lean(),
      Occasion.find({ isActive: true }).sort({ displayOrder: 1 }).lean(),
      Product.find({ isPublished: true }).select('attributes basePrice').lean(),
    ]);

    // Aggregate distinct work types and price bounds
    const workTypesSet = new Set<string>();
    let minPrice = Infinity;
    let maxPrice = 0;

    allProducts.forEach((p) => {
      if (p.attributes?.workType) {
        p.attributes.workType.forEach((w) => workTypesSet.add(w));
      }
      if (p.basePrice < minPrice) minPrice = p.basePrice;
      if (p.basePrice > maxPrice) maxPrice = p.basePrice;
    });

    return {
      categories,
      fabrics,
      occasions,
      workTypes: Array.from(workTypesSet),
      priceRange: {
        min: minPrice === Infinity ? 0 : minPrice,
        max: maxPrice === 0 ? 100000 : maxPrice,
      },
    };
  }
}
