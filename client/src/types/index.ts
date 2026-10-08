export interface User {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'customer' | 'super_admin' | 'inventory_manager' | 'sales_manager' | 'accountant' | 'content_manager';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  savedAddresses: Address[];
  defaultAddressId?: string;
}

export interface Address {
  _id?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface ProductImage {
  url: string;
  altText: string;
  viewType: 'front' | 'back' | 'side' | 'texture_closeup' | 'model';
  isPrimary: boolean;
}

export interface ProductVariant {
  _id: string;
  productId: string;
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
}

export interface Product {
  _id: string;
  articleCode: string;
  name: string;
  slug: string;
  shortDescription: string;
  detailedDescription: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
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
  costPrice: number;
  images: ProductImage[];
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
  availableColors?: { name: string; hexCode: string }[];
  availableSizes?: string[];
  isInStock?: boolean;
  variants?: ProductVariant[];
  createdAt: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  slug: string;
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  image: string;
  unitPrice: number;
  quantity: number;
  availableStock: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    userId: string;
    fullName: string;
    email: string;
    phone: string;
  };
  items: {
    productId: string;
    variantId: string;
    productName: string;
    sku: string;
    color: string;
    size: string;
    image: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }[];
  shippingAddress: Address;
  pricing: {
    itemsSubtotal: number;
    discountAmount: number;
    shippingCharges: number;
    taxAmount: number;
    totalPayable: number;
  };
  paymentInfo: {
    method: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    status: 'PENDING' | 'PAID' | 'FAILED';
    paidAt?: string;
  };
  orderStatus: 'PAYMENT_PENDING' | 'PAID' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  statusHistory: {
    status: string;
    timestamp: string;
    note?: string;
  }[];
  policyAcknowledgement: {
    noReturnAcknowledged: boolean;
    acknowledgedAt: string;
  };
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  subcategories: string[];
}

export interface Fabric {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  textureDescription?: string;
  careInstructions?: string;
  imageUrl?: string;
}

export interface Occasion {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface Branch {
  _id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  googleMapsUrl?: string;
  images: string[];
  isFlagship: boolean;
}

export interface StoreContent {
  _id?: string;
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
}
