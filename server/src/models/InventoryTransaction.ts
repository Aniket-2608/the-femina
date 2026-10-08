import mongoose, { Schema, Document, Types } from 'mongoose';

export type InventoryTransactionType =
  | 'PURCHASE_INWARD'
  | 'ORDER_RESERVED'
  | 'ORDER_FULFILLED'
  | 'ORDER_CANCELLED'
  | 'MANUAL_ADJUSTMENT'
  | 'DAMAGED_WRITEOFF';

export interface IInventoryTransactionDocument extends Document {
  _id: Types.ObjectId;
  variantId: Types.ObjectId;
  productId: Types.ObjectId;
  sku: string;
  type: InventoryTransactionType;
  quantityDelta: number;
  previousStock: number;
  newStock: number;
  referenceId?: Types.ObjectId;
  reason: string;
  performedBy: Types.ObjectId;
  costAtTransaction: number;
  createdAt: Date;
}

const InventoryTransactionSchema = new Schema<IInventoryTransactionDocument>(
  {
    variantId: { type: Schema.Types.ObjectId, ref: 'ProductVariant', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    sku: { type: String, required: true, uppercase: true, index: true },
    type: {
      type: String,
      required: true,
      enum: [
        'PURCHASE_INWARD',
        'ORDER_RESERVED',
        'ORDER_FULFILLED',
        'ORDER_CANCELLED',
        'MANUAL_ADJUSTMENT',
        'DAMAGED_WRITEOFF',
      ],
      index: true,
    },
    quantityDelta: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    referenceId: { type: Schema.Types.ObjectId },
    reason: { type: String, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    costAtTransaction: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const InventoryTransaction = mongoose.model<IInventoryTransactionDocument>(
  'InventoryTransaction',
  InventoryTransactionSchema
);
