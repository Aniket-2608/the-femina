import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProductVariantDocument extends Document {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  sku: string;
  color: {
    name: string;
    hexCode: string;
  };
  size: string;
  price: number;
  compareAtPrice?: number;
  costPrice: number;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  barcode?: string;
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariantDocument>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    color: {
      name: { type: String, required: true, trim: true },
      hexCode: { type: String, required: true, uppercase: true, trim: true },
    },
    size: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    costPrice: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, required: true, default: 0, min: 0 },
    reservedQuantity: { type: Number, default: 0, min: 0 },
    availableQuantity: { type: Number, default: 0, min: 0 },
    barcode: { type: String },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProductVariantSchema.index({ productId: 1, 'color.name': 1, size: 1 }, { unique: true });

export const ProductVariant = mongoose.model<IProductVariantDocument>('ProductVariant', ProductVariantSchema);
