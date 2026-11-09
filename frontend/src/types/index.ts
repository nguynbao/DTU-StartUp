export type ProductCategory =
  | 'basket'
  | 'bag'
  | 'wallet'
  | 'apparel'
  | 'bracelet'
  | 'accessory';

export type MaterialCategory =
  | 'shell'
  | 'snail'
  | 'charm'
  | 'bead'
  | 'cord';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'in_crafting'
  | 'quality_check'
  | 'shipping'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cod' | 'vietqr';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export type MediaStorageFolder =
  | 'landing'
  | 'products'
  | 'materials'
  | 'custom-previews';

export interface MediaStorageStatus {
  storageMode: 's3' | 'local-fallback';
  isS3Configured: boolean;
  bucket: string;
  region: string;
  publicBaseUrl: string;
  maxFileSizeMb: number;
  folders: string[];
}

export interface MediaUploadResult {
  url: string;
  key: string;
  folder: string;
  storageMode: 's3' | 'local-fallback';
  contentType: string;
  size?: number;
}

export interface PresignedUrlResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  folder: string;
  expiresIn?: number;
}

export interface BraceletConfig {
  wristSizeCm: number; // 14 - 20 cm (default 16)
  slotCount: number; // 6 - 20 slots along perimeter (default 10 or 12)
  cordMaterial?: string;
}

export interface ProductModel3D {
  meshPreset: string;
  glbUrl?: string;
  defaultBaseColor: string;
  defaultStrapColor: string;
  availableColors?: string[];
  allowSurfacePlacement?: boolean;
}

export interface ProductEcoImpact {
  netWeightGrams: number;
  originSea: string;
  recycledPlasticPct: number;
  artisanGroup: string;
  co2SavedGrams?: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  category: ProductCategory;
  shortDescription: string;
  description: string;
  basePrice: number;
  craftFee: number;
  stock: number;
  images: string[];
  thumbnail?: string;
  isCustomizable: boolean;
  isFeatured?: boolean;
  isActive: boolean;
  sizes?: string[];
  colors?: string[];
  model3D: ProductModel3D;
  ecoImpact: ProductEcoImpact;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomMaterial {
  _id: string;
  name: string;
  code?: string;
  materialType: MaterialCategory;
  description?: string;
  unitPrice: number;
  stockQuantity: number;
  colorHex: string;
  thumbnail?: string;
  isActive: boolean;
  model3D: {
    meshPreset: string;
    glbUrl?: string;
    defaultScale?: number;
  };
}

export interface Placement3D {
  placementId: string;
  materialId: string;
  materialName: string;
  materialType?: MaterialCategory | string;
  meshPreset: string;
  glbUrl?: string;
  unitPrice: number;
  position: [number, number, number];
  normal: [number, number, number];
  rotation: number; // 0 - 360 degrees around surface normal
  scale: number; // 0.4 - 2.5
  color: string;
  slotIndex?: number; // Used for sequential bracelet chain slots (0 .. slotCount-1)
  isDanglingCharm?: boolean;
}

export interface CustomDesignSnapshot {
  _id?: string;
  productId: string;
  productName: string;
  productSlug: string;
  meshPreset: string;
  glbUrl?: string;
  baseColor: string;
  strapColor: string;
  braceletConfig?: BraceletConfig;
  previewImageUrl?: string;
  artisanNote?: string;
  placements: Placement3D[];
  basePrice: number;
  craftFee: number;
  materialsTotal: number;
  estimatedPrice: number;
}

export interface BomSummaryItem {
  materialId: string;
  materialName: string;
  meshPreset?: string;
  colorHex?: string;
  unitPrice: number;
  quantityPerUnit: number;
  totalQuantity: number;
  subtotal: number;
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  productSlug: string;
  productName: string;
  productCategory: ProductCategory;
  thumbnail: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  unitPrice: number;
  netWeightGrams: number;
  isCustom: boolean;
  customDesignId?: string;
  customDesign?: CustomDesignSnapshot;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productSlug?: string;
  category?: ProductCategory;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  unitPrice: number;
  subtotal: number;
  isCustom: boolean;
  customDesignId?: string;
  customDesignSnapshot?: CustomDesignSnapshot;
  bomSummary?: BomSummaryItem[];
}

export interface VietQRPaymentInfo {
  bankBin?: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  amount: number;
  transferContent: string;
  qrImageUrl: string;
}

export interface Order {
  _id: string;
  orderCode: string;
  customerInfo: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    note?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  shippingFee: number;
  finalAmount: number;
  totalNetWeightGrams: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  vietQrInfo?: VietQRPaymentInfo;
  status: OrderStatus;
  statusHistory?: Array<{
    status: OrderStatus;
    note?: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface LandingHeroBanner {
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImageUrl: string;
  secondaryImageUrl?: string;
  tertiaryImageUrl?: string;
}

export interface LandingProcessStep {
  stepNumber: number;
  title: string;
  description: string;
  imageUrl: string;
  badgeText?: string;
}

export interface LandingContent {
  heroTitle: string;
  heroSubtitle: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  heroBanner?: LandingHeroBanner;
  impactCounters: {
    netsCollectedKg: number;
    marineLifeSaved: number;
    upcycledProductsCreated: number;
    localArtisansSupported: number;
  };
  recyclingSteps: Array<{
    stepNumber: number;
    title: string;
    description: string;
    badgeText: string;
    imageUrl?: string;
  }>;
  processSteps?: LandingProcessStep[];
  galleryImages?: string[];
  artisanStory: {
    headline: string;
    heading?: string;
    villageName: string;
    quote: string;
    body: string;
    bodyText?: string;
    artisanName: string;
    artisanRole: string;
    avatarUrl?: string;
    workshopImageUrl?: string;
  };
}

export interface AdminDashboardData {
  totalRevenue: number;
  totalOrders: number;
  craftingOrdersCount: number;
  totalNetsRecycledGrams: number;
  lowStockMaterials: CustomMaterial[];
  lowStockProducts: Product[];
  recentOrders: Order[];
}
