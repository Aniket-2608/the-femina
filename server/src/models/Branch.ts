import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBranchDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  googleMapsUrl?: string;
  images: string[];
  isFlagship: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema = new Schema<IBranchDocument>(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    openingHours: { type: String, default: '10:30 AM – 09:00 PM (All Days)' },
    googleMapsUrl: { type: String },
    images: [{ type: String }],
    isFlagship: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Branch = mongoose.model<IBranchDocument>('Branch', BranchSchema);
