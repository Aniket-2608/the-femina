import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFabricDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  textureDescription?: string;
  careInstructions?: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

const FabricSchema = new Schema<IFabricDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String },
    textureDescription: { type: String },
    careInstructions: { type: String },
    imageUrl: { type: String },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Fabric = mongoose.model<IFabricDocument>('Fabric', FabricSchema);
