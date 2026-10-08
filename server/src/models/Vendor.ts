import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IVendorDocument extends Document {
  _id: Types.ObjectId;
  vendorName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
  };
  totalPurchased: number;
  outstandingBalance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema = new Schema<IVendorDocument>(
  {
    vendorName: { type: String, required: true, trim: true, index: true },
    contactPerson: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    address: { type: String },
    gstNumber: { type: String, trim: true },
    bankDetails: {
      accountName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
    },
    totalPurchased: { type: Number, default: 0 },
    outstandingBalance: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Vendor = mongoose.model<IVendorDocument>('Vendor', VendorSchema);
