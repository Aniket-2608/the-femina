import mongoose, { Schema, Document, Types } from 'mongoose';
import { OrderStatus, OrderStatusType, PaymentStatus, PaymentStatusType } from '../constants/orderStatus.js';

export interface IOrderItem {
  productId: Types.ObjectId;
  variantId: Types.ObjectId;
  productName: string;
  sku: string;
  color: string;
  size: string;
  image: string;
  unitPrice: number;
  unitCost: number; // Snapshot of cost at time of purchase for COGS / P&L
  quantity: number;
  subtotal: number;
}

export interface IOrderDocument extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  customer: {
    userId: Types.ObjectId;
    fullName: string;
    email: string;
    phone: string;
  };
  items: IOrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
  };
  pricing: {
    itemsSubtotal: number;
    discountAmount: number;
    shippingCharges: number;
    taxAmount: number;
    totalPayable: number;
  };
  paymentInfo: {
    method: 'RAZORPAY' | 'MANUAL_TRANSFER';
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    status: PaymentStatusType;
    paidAt?: Date;
  };
  orderStatus: OrderStatusType;
  statusHistory: {
    status: OrderStatusType;
    timestamp: Date;
    note?: string;
    updatedBy?: Types.ObjectId;
  }[];
  internalNotes: {
    note: string;
    authorId: Types.ObjectId;
    createdAt: Date;
  }[];
  policyAcknowledgement: {
    noReturnAcknowledged: boolean;
    acknowledgedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    color: { type: String, required: true },
    size: { type: String, required: true },
    image: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    unitCost: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: { type: String, required: true, unique: true, uppercase: true, index: true },
    customer: {
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    items: [OrderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      landmark: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    pricing: {
      itemsSubtotal: { type: Number, required: true },
      discountAmount: { type: Number, default: 0 },
      shippingCharges: { type: Number, default: 0 },
      taxAmount: { type: Number, default: 0 },
      totalPayable: { type: Number, required: true },
    },
    paymentInfo: {
      method: { type: String, enum: ['RAZORPAY', 'MANUAL_TRANSFER'], default: 'RAZORPAY' },
      razorpayOrderId: { type: String, index: true },
      razorpayPaymentId: { type: String, index: true },
      razorpaySignature: { type: String },
      status: {
        type: String,
        enum: Object.values(PaymentStatus),
        default: PaymentStatus.PENDING,
        index: true,
      },
      paidAt: { type: Date },
    },
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PAYMENT_PENDING,
      index: true,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    internalNotes: [
      {
        note: { type: String, required: true },
        authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    policyAcknowledgement: {
      noReturnAcknowledged: { type: Boolean, default: true },
      acknowledgedAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrderDocument>('Order', OrderSchema);
