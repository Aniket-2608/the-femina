import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPurchaseOrderItem {
  productId: Types.ObjectId;
  variantId: Types.ObjectId;
  sku: string;
  quantityReceived: number;
  costPricePerUnit: number;
  taxRate: number;
  totalAmount: number;
}

export interface IPurchaseOrderDocument extends Document {
  _id: Types.ObjectId;
  poNumber: string;
  vendorId: Types.ObjectId;
  invoiceNumber: string;
  items: IPurchaseOrderItem[];
  totalCost: number;
  taxAmount: number;
  grandTotal: number;
  paymentStatus: 'PAID' | 'PARTIALLY_PAID' | 'PENDING';
  status: 'DRAFT' | 'CONFIRMED' | 'STOCKED';
  receivedDate: Date;
  recordedBy: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseOrderItemSchema = new Schema<IPurchaseOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
    sku: { type: String, required: true },
    quantityReceived: { type: Number, required: true, min: 1 },
    costPricePerUnit: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
  },
  { _id: false }
);

const PurchaseOrderSchema = new Schema<IPurchaseOrderDocument>(
  {
    poNumber: { type: String, required: true, unique: true, uppercase: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    invoiceNumber: { type: String, required: true, trim: true },
    items: [PurchaseOrderItemSchema],
    totalCost: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'PARTIALLY_PAID', 'PENDING'],
      default: 'PENDING',
    },
    status: {
      type: String,
      enum: ['DRAFT', 'CONFIRMED', 'STOCKED'],
      default: 'STOCKED',
      index: true,
    },
    receivedDate: { type: Date, default: Date.now },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const PurchaseOrder = mongoose.model<IPurchaseOrderDocument>('PurchaseOrder', PurchaseOrderSchema);
