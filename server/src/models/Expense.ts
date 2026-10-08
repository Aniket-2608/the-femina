import mongoose, { Schema, Document, Types } from 'mongoose';

export const ExpenseCategories = [
  'RENT',
  'SALARY',
  'UTILITY',
  'MARKETING',
  'PACKAGING',
  'SHIPPING',
  'PAYMENT_GATEWAY_FEE',
  'VENDOR_PAYMENT',
  'MAINTENANCE',
  'MISCELLANEOUS',
] as const;

export type ExpenseCategoryType = (typeof ExpenseCategories)[number];

export interface IExpenseDocument extends Document {
  _id: Types.ObjectId;
  expenseCode: string;
  category: ExpenseCategoryType;
  description: string;
  amount: number;
  expenseDate: Date;
  paymentMethod: 'BANK_TRANSFER' | 'UPI' | 'CREDIT_CARD' | 'CASH';
  vendorPayee?: string;
  receiptAttachmentUrl?: string;
  recordedBy: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpenseDocument>(
  {
    expenseCode: { type: String, required: true, unique: true, uppercase: true, index: true },
    category: {
      type: String,
      enum: ExpenseCategories,
      required: true,
      index: true,
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    expenseDate: { type: Date, required: true, default: Date.now, index: true },
    paymentMethod: {
      type: String,
      enum: ['BANK_TRANSFER', 'UPI', 'CREDIT_CARD', 'CASH'],
      default: 'BANK_TRANSFER',
    },
    vendorPayee: { type: String },
    receiptAttachmentUrl: { type: String },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Expense = mongoose.model<IExpenseDocument>('Expense', ExpenseSchema);
