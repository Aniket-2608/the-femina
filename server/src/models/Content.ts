import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IContentDocument extends Document {
  _id: Types.ObjectId;
  heroVideoUrl: string;
  heroVideoPoster: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
  announcementText?: string;
  aboutUsText: string;
  aboutUsVision: string;
  aboutUsCraftsmanship: string;
  aboutUsImages: string[];
  noReturnPolicyNotice: string;
  shippingInfoText: string;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema<IContentDocument>(
  {
    heroVideoUrl: {
      type: String,
      default: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-pink-silk-dress-41139-large.mp4',
    },
    heroVideoPoster: {
      type: String,
      default: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1600&auto=format&fit=crop',
    },
    heroTitle: { type: String, default: 'Royal Elegance Redefined' },
    heroSubtitle: { type: String, default: 'Discover Handcrafted Sarees, Bespoke Lehengas & Pure Silk Haute Couture' },
    heroCtaText: { type: String, default: 'Explore Festive Collection' },
    heroCtaLink: { type: String, default: '/shop' },
    announcementText: { type: String, default: 'Complimentary Pan-India Insured Express Shipping on All Orders' },
    aboutUsText: {
      type: String,
      default:
        'The Femina Exclusive is dedicated to celebrating the timeless grandeur of Indian craftsmanship and contemporary haute couture.',
    },
    aboutUsVision: {
      type: String,
      default:
        'Empowering the modern woman with bespoke artisanal elegance, intricate handloom weaves, and royal luxury.',
    },
    aboutUsCraftsmanship: {
      type: String,
      default:
        'Each silhouette is brought to life with hand-spun Chanderi, Banarasi silk, intricate Zardozi, Gotta Patti, and Chikankari master artisans.',
    },
    aboutUsImages: [
      {
        type: String,
      },
    ],
    noReturnPolicyNotice: {
      type: String,
      default:
        'Due to the delicate artisanal hand-embroidery and pure fabric craftsmanship of our exclusive pieces, all sales are strictly final. We do not accept returns or exchanges.',
    },
    shippingInfoText: {
      type: String,
      default:
        'All orders are carefully inspected, hand-packed in bespoke luxury keepsake boxes, and dispatched via premium insured express couriers within 24-48 business hours.',
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Content = mongoose.model<IContentDocument>('Content', ContentSchema);
