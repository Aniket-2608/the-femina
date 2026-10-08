import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/index.js';
import { PriceDisplay } from '../common/PriceDisplay.js';
import { Badge } from '../common/Badge.js';
import { Sparkles, Eye, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickAdd?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const primaryImg = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url;
  const hoverImg = product.images[1]?.url || primaryImg;

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-femina-200/70 shadow-luxury hover:shadow-luxury-hover transition-all duration-300 hover:-translate-y-1">
      {/* Image & Badges Container */}
      <Link to={`/shop/${product.slug}`} className="relative aspect-[3/4] overflow-hidden bg-femina-100 block">
        <img
          src={primaryImg}
          alt={product.name}
          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {hoverImg && hoverImg !== primaryImg && (
          <img
            src={hoverImg}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover object-top opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            loading="lazy"
          />
        )}

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isBestSeller && (
            <Badge variant="wine" size="sm" className="shadow-md">
              <Sparkles className="w-3 h-3 mr-1 inline" /> Best Seller
            </Badge>
          )}
          {product.isNewArrival && !product.isBestSeller && (
            <Badge variant="gold" size="sm" className="shadow-md">
              New Drop
            </Badge>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {!product.isInStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-white/95 text-luxury-wine font-semibold text-xs tracking-widest uppercase px-4 py-2 rounded-md shadow-lg">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick View Button on Hover */}
        <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex gap-2 z-10">
          <button className="flex-1 bg-white/95 hover:bg-white text-luxury-wine py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wider uppercase shadow-lg flex items-center justify-center gap-1.5 backdrop-blur transition-all">
            <Eye className="w-3.5 h-3.5" /> View Details
          </button>
        </div>
      </Link>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Fabric & Occasion Tag */}
          <div className="flex items-center justify-between text-[11px] text-femina-700 font-medium tracking-wider uppercase mb-1.5">
            <span>{product.attributes.fabric}</span>
            {product.attributes.occasion?.[0] && (
              <span className="text-gray-400 font-normal">
                {product.attributes.occasion[0].split(' ')[0]}
              </span>
            )}
          </div>

          {/* Product Title */}
          <Link
            to={`/shop/${product.slug}`}
            className="block font-serif text-base sm:text-lg font-semibold text-luxury-dark group-hover:text-femina-700 transition-colors line-clamp-1 mb-1.5"
          >
            {product.name}
          </Link>

          {/* Craftsmanship Snippet */}
          <p className="text-xs text-gray-500 line-clamp-1 mb-3">
            {product.attributes.workType?.join(', ') || product.shortDescription}
          </p>
        </div>

        <div>
          {/* Color & Size Swatches */}
          <div className="flex items-center justify-between gap-2 mb-3">
            {product.availableColors && product.availableColors.length > 0 ? (
              <div className="flex items-center gap-1">
                {product.availableColors.slice(0, 4).map((c, i) => (
                  <span
                    key={i}
                    title={c.name}
                    className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-xs"
                    style={{ backgroundColor: c.hexCode }}
                  />
                ))}
                {product.availableColors.length > 4 && (
                  <span className="text-[10px] text-gray-400 font-medium">
                    +{product.availableColors.length - 4}
                  </span>
                )}
              </div>
            ) : (
              <div />
            )}

            {product.availableSizes && product.availableSizes.length > 0 && (
              <div className="text-[10px] text-gray-500 font-medium">
                Sizes: {product.availableSizes.join(', ')}
              </div>
            )}
          </div>

          {/* Price & Action */}
          <div className="pt-2 border-t border-femina-100 flex items-center justify-between">
            <PriceDisplay
              price={product.basePrice}
              compareAtPrice={product.compareAtPrice}
              size="md"
            />
            <Link
              to={`/shop/${product.slug}`}
              className="text-luxury-wine hover:text-femina-800 p-2 rounded-full hover:bg-femina-50 transition-colors"
              title="Shop Now"
            >
              <ShoppingBag className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
