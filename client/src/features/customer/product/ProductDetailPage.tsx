import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGetProductBySlugQuery } from '../../../store/api/apiSlice.js';
import { addToCart } from '../../../store/slices/cartSlice.js';
import { addToast } from '../../../store/slices/uiSlice.js';
import { PriceDisplay } from '../../../components/common/PriceDisplay.js';
import { Button } from '../../../components/common/Button.js';
import { ProductCard } from '../../../components/display/ProductCard.js';
import {
  ShoppingBag,
  Zap,
  MessageCircle,
  ShieldCheck,
  Truck,
  Sparkles,
  Award,
  Scissors,
  CheckCircle2,
  ChevronRight,
  Info,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data, isLoading, error } = useGetProductBySlugQuery(slug || '');
  const product = data?.data?.product;
  const relatedProducts = data?.data?.relatedProducts;

  // Selected Variant States
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  // Initialize selected color & size when product loads
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      setSelectedColor(product.variants[0].color.name);
      setSelectedSize(product.variants[0].size);
      setSelectedImageIndex(0);
      setQuantity(1);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-[3/4] bg-femina-200/60 rounded-3xl" />
          <div className="space-y-6">
            <div className="h-8 bg-femina-200/60 rounded-lg w-3/4" />
            <div className="h-6 bg-femina-200/60 rounded-lg w-1/4" />
            <div className="h-24 bg-femina-200/60 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-luxury-dark">Master Article Unavailable</h2>
        <p className="text-xs text-gray-500">The requested creation could not be found or has been archived.</p>
        <Link to="/shop">
          <Button variant="primary" size="md">
            Return to Catalogue
          </Button>
        </Link>
      </div>
    );
  }

  // Find active variant matching selected color & size
  const activeVariant =
    product.variants?.find(
      (v) => v.color.name === selectedColor && v.size === selectedSize && v.isActive
    ) || product.variants?.[0];

  const currentPrice = activeVariant ? activeVariant.price : product.basePrice;
  const currentCompareAt = activeVariant ? activeVariant.compareAtPrice : product.compareAtPrice;
  const availableStock = activeVariant ? activeVariant.availableQuantity : 0;
  const isInStock = availableStock > 0;

  // Available distinct colors and sizes for this product
  const distinctColors = Array.from(
    new Map(product.variants?.map((v) => [v.color.name, v.color])).values()
  );
  const distinctSizes = Array.from(
    new Set(product.variants?.filter((v) => v.color.name === selectedColor).map((v) => v.size))
  );

  const handleAddToCart = () => {
    if (!activeVariant) return;

    dispatch(
      addToCart({
        productId: product._id,
        variantId: activeVariant._id,
        productName: product.name,
        slug: product.slug,
        sku: activeVariant.sku,
        color: activeVariant.color.name,
        colorHex: activeVariant.color.hexCode,
        size: activeVariant.size,
        image: activeVariant.images?.[0] || product.images[0]?.url || '',
        unitPrice: activeVariant.price,
        quantity,
        availableStock: activeVariant.availableQuantity,
        subtotal: activeVariant.price * quantity,
      })
    );

    dispatch(
      addToast({
        type: 'success',
        message: `Added ${product.name} (${activeVariant.size}) to your bag.`,
      })
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent(
      `Hello The Femina Exclusive, I am interested in inquiring about "${product.name}" (SKU: ${activeVariant?.sku || product.articleCode}). Link: ${window.location.href}`
    );
    window.open(`https://wa.me/919876543210?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-xs text-gray-500 gap-1.5 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-luxury-wine">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <Link to="/shop" className="hover:text-luxury-wine">
          Shop
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <Link to={`/shop?category=${product.category?.slug}`} className="hover:text-luxury-wine">
          {product.category?.name}
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="text-luxury-wine font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Presentation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails list */}
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:w-20 shrink-0">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative aspect-[3/4] w-16 sm:w-full rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  selectedImageIndex === idx
                    ? 'border-luxury-wine shadow-md ring-2 ring-femina-300'
                    : 'border-femina-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img.url} alt={img.altText || product.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Primary Zoomable Stage */}
          <div className="flex-1 relative aspect-[3/4] rounded-3xl overflow-hidden bg-femina-100 border border-femina-200 shadow-luxury">
            <img
              src={product.images[selectedImageIndex]?.url || product.images[0]?.url}
              alt={product.name}
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-semibold text-femina-800 uppercase tracking-widest border border-femina-200">
              {product.images[selectedImageIndex]?.viewType?.replace('_', ' ') || 'Front View'}
            </div>
          </div>
        </div>

        {/* Right: Master Article Details */}
        <div className="lg:col-span-5 space-y-6">
          {/* Article Header */}
          <div>
            <div className="flex items-center justify-between gap-2 text-xs font-semibold text-femina-700 tracking-widest uppercase mb-1">
              <span>{product.attributes.fabric}</span>
              <span className="text-gray-400 font-mono text-[11px]">SKU: {activeVariant?.sku || product.articleCode}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-dark leading-snug">
              {product.name}
            </h1>

            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              {product.shortDescription}
            </p>
          </div>

          {/* Pricing Block */}
          <div className="p-4 rounded-2xl bg-femina-50/80 border border-femina-200">
            <PriceDisplay price={currentPrice} compareAtPrice={currentCompareAt} size="xl" />
            <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-gold-500" />
              <span>Inclusive of all statutory taxes. Complimentary Insured Shipping.</span>
            </div>
          </div>

          {/* Variant Color Selector */}
          {distinctColors.length > 0 && (
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-gray-800 uppercase tracking-wider flex items-center justify-between">
                <span>Color Palette</span>
                <span className="font-bold text-luxury-wine">{selectedColor}</span>
              </div>
              <div className="flex items-center gap-3">
                {distinctColors.map((col, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(col.name)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                      selectedColor === col.name
                        ? 'border-luxury-wine bg-femina-100 text-luxury-wine shadow-xs ring-1 ring-luxury-wine'
                        : 'border-femina-200 hover:border-femina-300 text-gray-700'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: col.hexCode }}
                    />
                    <span>{col.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Variant Size Selector */}
          {distinctSizes.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-800 uppercase tracking-wider">
                <span>Select Size</span>
                {isInStock && availableStock <= 5 && (
                  <span className="text-[11px] text-amber-700 font-bold animate-pulse">
                    ⚡ Only {availableStock} pieces available
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {distinctSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] py-2 px-3.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedSize === size
                        ? 'bg-luxury-wine text-white border-luxury-wine shadow-sm'
                        : 'bg-white text-gray-700 border-femina-200 hover:border-femina-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-femina-300 rounded-xl bg-white overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-2 text-gray-600 hover:bg-femina-100 transition-colors"
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold text-luxury-dark">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                  disabled={quantity >= availableStock}
                  className="px-3.5 py-2 text-gray-600 hover:bg-femina-100 disabled:opacity-30 transition-colors"
                >
                  +
                </button>
              </div>
              <span className="text-[11px] text-gray-500">Max {availableStock} per bespoke order</span>
            </div>
          </div>

          {/* Primary CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={!isInStock}
                variant="primary"
                size="lg"
                className="flex-1 justify-center"
                leftIcon={<ShoppingBag className="w-4 h-4" />}
              >
                {isInStock ? 'Add To Bag' : 'Out of Stock'}
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={!isInStock}
                variant="gold"
                size="lg"
                className="flex-1 justify-center"
                leftIcon={<Zap className="w-4 h-4" />}
              >
                Instant Buy
              </Button>
            </div>

            <Button
              onClick={handleWhatsAppInquiry}
              variant="outline"
              size="md"
              className="w-full justify-center border-emerald-700 text-emerald-800 hover:bg-emerald-50"
              leftIcon={<MessageCircle className="w-4 h-4 text-emerald-700" />}
            >
              Consult Stylist On WhatsApp
            </Button>
          </div>

          {/* Assurance & Final Sale Policy Box */}
          <div className="p-4 rounded-2xl bg-gold-50/70 border border-gold-300/60 space-y-2.5 text-xs text-gold-950">
            <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-gold-900">
              <ShieldCheck className="w-4 h-4 text-gold-700" />
              <span>Artisanal Heirloom Guarantee</span>
            </div>
            <p className="text-[11px] text-gold-900 leading-relaxed">
              <strong>Final Sale Policy:</strong> Due to pure silk handlooms and delicate hand-embroidery work, this creation is strictly non-returnable.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Specifications & Craftsmanship Grid */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-femina-200 shadow-luxury space-y-8">
        <div>
          <span className="text-xs font-bold text-femina-700 tracking-[0.25em] uppercase">Master Specifications</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-dark mt-1">
            Artisanal Craftsmanship & Fabric Details
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          <div className="p-4 rounded-2xl bg-femina-50/60 border border-femina-200 space-y-1">
            <span className="font-semibold text-gray-500 uppercase tracking-wider block">Pure Fabric & Weave</span>
            <span className="font-serif text-sm font-bold text-luxury-wine block">{product.attributes.fabric}</span>
            <span className="text-gray-600 block">{product.attributes.materialComposition || product.attributes.weave}</span>
          </div>

          <div className="p-4 rounded-2xl bg-femina-50/60 border border-femina-200 space-y-1">
            <span className="font-semibold text-gray-500 uppercase tracking-wider block">Work & Embroidery</span>
            <span className="font-serif text-sm font-bold text-luxury-wine block">
              {product.attributes.workType?.join(', ') || 'Handloom Woven'}
            </span>
            <span className="text-gray-600 block">{product.attributes.pattern}</span>
          </div>

          <div className="p-4 rounded-2xl bg-femina-50/60 border border-femina-200 space-y-1">
            <span className="font-semibold text-gray-500 uppercase tracking-wider block">Occasion & Styling</span>
            <span className="font-serif text-sm font-bold text-luxury-wine block">
              {product.attributes.occasion?.join(', ') || 'Festive Celebrations'}
            </span>
            <span className="text-gray-600 block">Fit: {product.attributes.fit}</span>
          </div>
        </div>

        <div className="pt-6 border-t border-femina-100 space-y-3">
          <h3 className="font-serif text-lg font-bold text-luxury-dark">Artisan Note & Description</h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {product.detailedDescription}
          </p>
        </div>

        {product.attributes.washCare && product.attributes.washCare.length > 0 && (
          <div className="pt-4 border-t border-femina-100">
            <h4 className="font-serif text-sm font-bold text-luxury-dark mb-2">Wash & Garment Care</h4>
            <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
              {product.attributes.washCare.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Related Creations */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="space-y-8">
          <div>
            <span className="text-xs font-bold text-femina-700 tracking-[0.25em] uppercase">Curated Pairings</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-dark mt-1">
              You May Also Admire
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
