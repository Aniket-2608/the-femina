import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProductImage {
  url: string;
  altText: string;
  viewType: 'front' | 'back' | 'side' | 'texture_closeup' | 'model';
  isPrimary: boolean;
}

export interface IProductDocument extends Document {
  _id: Types.ObjectId;
  articleCode: string;
  name: string;
  slug: string;
  shortDescription: string;
  detailedDescription: string;
  category: Types.ObjectId;
  subcategory?: string;
  collectionName?: string;
  
  attributes: {
    fabric: string;
    materialComposition?: string;
    texture?: string;
    weave?: string;
    pattern: string;
    workType: string[];
    style: string;
    fit: string;
    occasion: string[];
    season?: string;
    neckType?: string;
    sleeveLength?: string;
    closureType?: string;
    washCare: string[];
  };

  basePrice: number;
  compareAtPrice?: number;
  costPrice: number; // For accounting & valuation
  
  images: IProductImage[];
  videoUrl?: string;
  tags: string[];
  
  isPublished: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  lowStockThreshold: number;
  totalStock: number;
  
  ratingSummary: {
    average: number;
    count: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const ProductImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    altText: { type: String, default: '' },
    viewType: {
      type: String,
      enum: ['front', 'back', 'side', 'texture_closeup', 'model'],
      default: 'front',
    },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProductDocument>(
  {
    articleCode: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    shortDescription: { type: String, required: true },
    detailedDescription: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    subcategory: { type: String, trim: true },
    collectionName: { type: String, trim: true },
    
    attributes: {
      fabric: { type: String, required: true, index: true },
      materialComposition: { type: String },
      texture: { type: String },
      weave: { type: String },
      pattern: { type: String, default: 'Solid', index: true },
      workType: [{ type: String, index: true }],
      style: { type: String, index: true },
      fit: { type: String, default: 'Regular Fit' },
      occasion: [{ type: String, index: true }],
      season: { type: String },
      neckType: { type: String },
      sleeveLength: { type: String },
      closureType: { type: String },
      washCare: [{ type: String }],
    },

    basePrice: { type: Number, required: true, min: 0, index: true },
    compareAtPrice: { type: Number, min: 0 },
    costPrice: { type: Number, required: true, min: 0 },
    
    images: [ProductImageSchema],
    videoUrl: { type: String },
    tags: [{ type: String, index: true }],
    
    isPublished: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    lowStockThreshold: { type: Number, default: 5 },
    totalStock: { type: Number, default: 0, index: true },
    
    ratingSummary: {
      average: { type: Number, default: 5.0 },
      count: { type: Number, default: 1 },
    },
  },
  { timestamps: true }
);

// Compound text index for powerful fashion search
ProductSchema.index({
  name: 'text',
  shortDescription: 'text',
  'attributes.fabric': 'text',
  'attributes.workType': 'text',
  'attributes.occasion': 'text',
  'attributes.pattern': 'text',
  'attributes.style': 'text',
  tags: 'text',
});

export const Product = mongoose.model<IProductDocument>('Product', ProductSchema);
