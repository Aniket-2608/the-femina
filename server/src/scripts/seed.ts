import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Fabric } from '../models/Fabric.js';
import { Occasion } from '../models/Occasion.js';
import { Product } from '../models/Product.js';
import { ProductVariant } from '../models/ProductVariant.js';
import { InventoryTransaction } from '../models/InventoryTransaction.js';
import { Vendor } from '../models/Vendor.js';
import { PurchaseOrder } from '../models/PurchaseOrder.js';
import { Expense } from '../models/Expense.js';
import { Branch } from '../models/Branch.js';
import { Content } from '../models/Content.js';
import { UserRoles } from '../constants/roles.js';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Initializing Master Database Seeding for The Femina Exclusive...');
    await connectDatabase();

    // 1. Clear existing collections
    console.log('[Seed] Cleaning existing data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Fabric.deleteMany({}),
      Occasion.deleteMany({}),
      Product.deleteMany({}),
      ProductVariant.deleteMany({}),
      InventoryTransaction.deleteMany({}),
      Vendor.deleteMany({}),
      PurchaseOrder.deleteMany({}),
      Expense.deleteMany({}),
      Branch.deleteMany({}),
      Content.deleteMany({}),
    ]);

    // 2. Create Staff & Customer Accounts
    console.log('[Seed] Creating staff & customer accounts...');
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Femina@2026', salt);

    const superAdmin = await User.create({
      firstName: 'Aniket',
      lastName: 'Dayal',
      email: 'admin@thefeminaexclusive.com',
      phone: '+919999000001',
      passwordHash: defaultPasswordHash,
      role: UserRoles.SUPER_ADMIN,
      isEmailVerified: true,
      isPhoneVerified: true,
      savedAddresses: [
        {
          fullName: 'Aniket Dayal',
          phone: '+919999000001',
          addressLine1: 'The Femina House, MG Road',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110001',
          isDefault: true,
        },
      ],
    });

    const inventoryManager = await User.create({
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'inventory@thefeminaexclusive.com',
      phone: '+919999000002',
      passwordHash: defaultPasswordHash,
      role: UserRoles.INVENTORY_MANAGER,
      isEmailVerified: true,
      isPhoneVerified: true,
    });

    const accountant = await User.create({
      firstName: 'Rajesh',
      lastName: 'Mehta',
      email: 'accounts@thefeminaexclusive.com',
      phone: '+919999000003',
      passwordHash: defaultPasswordHash,
      role: UserRoles.ACCOUNTANT,
      isEmailVerified: true,
      isPhoneVerified: true,
    });

    const customerUser = await User.create({
      firstName: 'Aarohi',
      lastName: 'Kapoor',
      email: 'customer@femina.com',
      phone: '+919876543210',
      passwordHash: defaultPasswordHash,
      role: UserRoles.CUSTOMER,
      isEmailVerified: true,
      isPhoneVerified: true,
      savedAddresses: [
        {
          fullName: 'Aarohi Kapoor',
          phone: '+919876543210',
          addressLine1: 'B-402, Royal Palms Residency, Bandra West',
          landmark: 'Opp. Bandstand Promenade',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400050',
          isDefault: true,
        },
      ],
    });

    // 3. Create Categories
    console.log('[Seed] Seeding Fashion Categories...');
    const categories = await Category.create([
      {
        name: 'Sarees',
        slug: 'sarees',
        description: 'Heirloom handloom sarees featuring pure Banarasi, Kanjeevaram, and Chanderi silk.',
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
        subcategories: ['Banarasi Silk', 'Kanjeevaram Silk', 'Organza Hand-Painted', 'Chanderi Zari'],
        displayOrder: 1,
      },
      {
        name: 'Lehengas',
        slug: 'lehengas',
        description: 'Bridal & festive bespoke lehengas with royal Zardozi, Gotta Patti, and sequin work.',
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
        subcategories: ['Bridal Lehengas', 'Festive Velvet Lehengas', 'Floral Organza Lehengas'],
        displayOrder: 2,
      },
      {
        name: 'Anarkalis & Suits',
        slug: 'anarkalis-suits',
        description: 'Floor-length flared Anarkalis, Ghararas, and Pakistani suits crafted in pure fabrics.',
        imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop',
        subcategories: ['Silk Anarkalis', 'Chikankari Suit Sets', 'Velvet Ghararas'],
        displayOrder: 3,
      },
      {
        name: 'Kurtis & Tunics',
        slug: 'kurtis-tunics',
        description: 'Everyday elegance and festive statement kurtis with handcrafted neckline accents.',
        imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=800&auto=format&fit=crop',
        subcategories: ['Straight Silk Kurtis', 'A-Line Mulmul Kurtis', 'Embroidered Tunics'],
        displayOrder: 4,
      },
      {
        name: 'Party Gowns',
        slug: 'party-gowns',
        description: 'Contemporary western & Indo-western gowns sculpted for evening cocktails.',
        imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop',
        subcategories: ['Draped Saree Gowns', 'Satin Evening Gowns', 'Embellished Slit Gowns'],
        displayOrder: 5,
      },
      {
        name: 'Co-ord Sets',
        slug: 'coord-sets',
        description: 'Chic modern silhouettes blending artisanal prints with relaxed luxury styling.',
        imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
        subcategories: ['Silk Printed Sets', 'Linen Blazer Sets', 'Festive Draped Sets'],
        displayOrder: 6,
      },
    ]);

    // 4. Create Fabrics & Occasions Master Data
    console.log('[Seed] Seeding Fabrics & Occasions...');
    await Fabric.create([
      {
        name: 'Banarasi Katan Silk',
        slug: 'banarasi-katan-silk',
        description: 'Finest hand-twisted pure mulberry silk woven with antique gold and silver zari threads.',
        textureDescription: 'Rich, smooth handfeel with luminous royal sheen and substantial drape.',
        careInstructions: 'Strictly Dry Clean Only. Store wrapped in pure muslin cloth.',
        displayOrder: 1,
      },
      {
        name: 'Chanderi Silk Cotton',
        slug: 'chanderi-silk-cotton',
        description: 'Traditional heritage weave known for sheer transparency and featherlight texture.',
        textureDescription: 'Airy, crisp, delicate sheen with intricate gold border work.',
        careInstructions: 'Dry Clean Recommended. Mild iron on reverse side.',
        displayOrder: 2,
      },
      {
        name: 'Royal Micro Velvet',
        slug: 'royal-micro-velvet',
        description: 'Plush high-density velvet with dense pile and deep color retention.',
        textureDescription: 'Sumptuous, ultra-soft, heavy drape designed for winter celebrations.',
        careInstructions: 'Professional Steam Clean Only.',
        displayOrder: 3,
      },
      {
        name: 'Pure Mulmul Cotton',
        slug: 'pure-mulmul-cotton',
        description: 'Breathable, ultra-fine handloom cotton cultivated for effortless luxury comfort.',
        textureDescription: 'Featherlight softness that gently softens with every wash.',
        careInstructions: 'Gentle hand wash in cold water with mild organic detergent.',
        displayOrder: 4,
      },
      {
        name: 'Organza Tissue',
        slug: 'organza-tissue',
        description: 'Crisp, structured transparent weave shimmering with metallic zari filaments.',
        textureDescription: 'Structured, sculpted, luminous with graceful ethereal volume.',
        careInstructions: 'Dry Clean Only. Avoid direct contact with steam.',
        displayOrder: 5,
      },
    ]);

    await Occasion.create([
      {
        name: 'Bridal & Wedding Grandeur',
        slug: 'bridal-wedding',
        description: 'Regal masterpieces handcrafted for the bride, sisters, and royal celebrations.',
        displayOrder: 1,
      },
      {
        name: 'Festive Celebrations',
        slug: 'festive-celebrations',
        description: 'Vibrant hues, heritage weaves, and radiant silhouettes for Diwali, Eid & Navratri.',
        displayOrder: 2,
      },
      {
        name: 'Cocktail & Evening Gala',
        slug: 'cocktail-evening',
        description: 'Statement gowns, metallic drapes, and modern Indo-western silhouettes.',
        displayOrder: 3,
      },
      {
        name: 'Sangeet & Mehendi',
        slug: 'sangeet-mehendi',
        description: 'Playful flares, mirror embellishments, and twirl-ready lehengas.',
        displayOrder: 4,
      },
      {
        name: 'Daily Luxury & Office Luxe',
        slug: 'daily-luxury',
        description: 'Sophisticated silk kurtas, tailored co-ord sets, and lightweight breathable sarees.',
        displayOrder: 5,
      },
    ]);

    // 5. Create Vendors & Initial Purchases
    console.log('[Seed] Seeding Vendors & Purchase Orders...');
    const vendor1 = await Vendor.create({
      vendorName: 'Varanasi Heritage Handlooms Co.',
      contactPerson: 'Kailash Nath Verma',
      phone: '+919415001234',
      email: 'sales@varanasiheritageweaves.com',
      address: 'Kunj Gali, Chowk, Varanasi, UP 221001',
      gstNumber: '09AAACH7890D1Z5',
      bankDetails: {
        accountName: 'Varanasi Heritage Handlooms',
        accountNumber: '50200012345678',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank Varanasi',
      },
      totalPurchased: 450000,
      outstandingBalance: 0,
    });

    const vendor2 = await Vendor.create({
      vendorName: 'Jaipur Royals Artisan Guild',
      contactPerson: 'Mahendra Singh Shekhawat',
      phone: '+919829005678',
      email: 'procurement@jaipurroyalsguild.in',
      address: 'Johari Bazaar, Pink City, Jaipur, RJ 302003',
      gstNumber: '08BBBJR4321A1Z9',
      bankDetails: {
        accountName: 'Jaipur Royals Guild',
        accountNumber: '001201509988',
        ifscCode: 'ICIC0000012',
        bankName: 'ICICI Bank Jaipur',
      },
      totalPurchased: 320000,
      outstandingBalance: 25000,
    });

    // 6. Create Master Products & Variants
    console.log('[Seed] Seeding Luxury Products & Variant Matrix...');

    const sareeCat = categories[0];
    const lehengaCat = categories[1];
    const anarkaliCat = categories[2];
    const kurtiCat = categories[3];
    const gownCat = categories[4];
    const coordCat = categories[5];

    const productsData = [
      {
        articleCode: 'TFE-2026-SR-001',
        name: 'Maharani Crimson Banarasi Silk Saree',
        slug: 'maharani-crimson-banarasi-silk-saree',
        shortDescription: 'Pure Katan Silk heirloom saree with intricate antique gold kadwa zari floral jaal.',
        detailedDescription:
          'Handcrafted over 140 artisan hours in the heart of Varanasi, this Crimson Maharani Saree embodies timeless royal opulence. Woven using the authentic Kadwa technique where each gold zari motif is individually engraved without loose floats on the reverse. Accompanied by an unstitched brocade blouse piece with elaborate sleeve borders.',
        category: sareeCat._id,
        subcategory: 'Banarasi Silk',
        collectionName: 'Royal Heritage Heirloom',
        attributes: {
          fabric: 'Banarasi Katan Silk',
          materialComposition: '100% Pure Mulberry Katan Silk with Metallic Gold Zari',
          texture: 'Crisp, rich, and supple with luminous dimensional sheen',
          weave: 'Kadwa Handloom Weave',
          pattern: 'Floral Jaal & Paisley Buta',
          workType: ['Zari Woven', 'Kadwa Handloom', 'Antique Gold Border'],
          style: 'Traditional Royal Saree',
          fit: 'Free Size (5.5m Saree + 0.8m Blouse)',
          occasion: ['Bridal & Wedding Grandeur', 'Festive Celebrations'],
          season: 'All Seasons',
          washCare: ['Strictly Dry Clean Only', 'Store wrapped in muslin cloth', 'Do not spray perfume directly'],
        },
        basePrice: 18999,
        compareAtPrice: 24999,
        costPrice: 9500,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
            altText: 'Maharani Crimson Banarasi Silk Saree Front View',
            viewType: 'front' as const,
            isPrimary: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1200&auto=format&fit=crop',
            altText: 'Intricate Gold Zari Pallu Detail',
            viewType: 'texture_closeup' as const,
            isPrimary: false,
          },
          {
            url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
            altText: 'Draped Silk Saree Model View',
            viewType: 'model' as const,
            isPrimary: false,
          },
        ],
        tags: ['banarasi', 'silk', 'saree', 'bridal', 'crimson', 'wedding', 'zari', 'pure silk'],
        isPublished: true,
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: true,
        lowStockThreshold: 3,
        variants: [
          {
            sku: 'TFE-2026-SR-001-RED-FREE',
            color: { name: 'Royal Crimson Red', hexCode: '#8B0000' },
            size: 'FreeSize',
            price: 18999,
            compareAtPrice: 24999,
            costPrice: 9500,
            stockQuantity: 12,
            reservedQuantity: 0,
            availableQuantity: 12,
          },
          {
            sku: 'TFE-2026-SR-001-EMERALD-FREE',
            color: { name: 'Emerald Forest Green', hexCode: '#0D382A' },
            size: 'FreeSize',
            price: 18999,
            compareAtPrice: 24999,
            costPrice: 9500,
            stockQuantity: 8,
            reservedQuantity: 0,
            availableQuantity: 8,
          },
          {
            sku: 'TFE-2026-SR-001-WINE-FREE',
            color: { name: 'Vintage Wine', hexCode: '#4A0E17' },
            size: 'FreeSize',
            price: 18999,
            compareAtPrice: 24999,
            costPrice: 9500,
            stockQuantity: 6,
            reservedQuantity: 0,
            availableQuantity: 6,
          },
        ],
      },
      {
        articleCode: 'TFE-2026-LH-002',
        name: 'Noor-E-Zardozi Velvet Bridal Lehenga',
        slug: 'noor-e-zardozi-velvet-bridal-lehenga',
        shortDescription: 'Heavy micro-velvet bridal lehenga set adorned with 3D Zardozi, dabka, and micro-pearls.',
        detailedDescription:
          'Created for the discerning bride who values bespoke majesty. The flared 16-kali skirt is rendered in plush French micro-velvet and hand-embellished by master Zardozi craftsmen in Old Delhi using dabka, nakshi, french knots, and gilded sequins. Includes double dupattas: a velvet shoulder drape and an ethereal embroidered tissue head veil.',
        category: lehengaCat._id,
        subcategory: 'Bridal Lehengas',
        collectionName: 'Noor Couture Bridal 2026',
        attributes: {
          fabric: 'Royal Micro Velvet',
          materialComposition: 'Plush Velvet with Pure Silk Dupatta',
          texture: 'Substantial, ultra-plush velvet with weighted regal twirl',
          weave: 'Hand Embroidered Kali Structure',
          pattern: 'Architectural Mughal Jharokha & Floral Vines',
          workType: ['Zardozi', 'Dabka Work', 'Micro Pearls', 'Handcrafted Gotta'],
          style: 'Flared 16-Kali Lehenga',
          fit: 'Bespoke / Semi-Stitched Regular Fit',
          occasion: ['Bridal & Wedding Grandeur'],
          season: 'Autumn / Winter',
          washCare: ['Specialist Dry Clean Only', 'Steam Ironing on Reverse Only'],
        },
        basePrice: 58999,
        compareAtPrice: 75000,
        costPrice: 28000,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
            altText: 'Noor Zardozi Bridal Lehenga Skirt & Blouse',
            viewType: 'front' as const,
            isPrimary: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1200&auto=format&fit=crop',
            altText: 'Intricate 3D Zardozi Hand Embroidery Detail',
            viewType: 'texture_closeup' as const,
            isPrimary: false,
          },
        ],
        tags: ['lehenga', 'velvet', 'bridal', 'zardozi', 'wedding', 'heavy lehenga', 'maroon'],
        isPublished: true,
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: true,
        lowStockThreshold: 2,
        variants: [
          {
            sku: 'TFE-2026-LH-002-MRN-S',
            color: { name: 'Deep Royal Maroon', hexCode: '#4A0E17' },
            size: 'S',
            price: 58999,
            compareAtPrice: 75000,
            costPrice: 28000,
            stockQuantity: 4,
            reservedQuantity: 0,
            availableQuantity: 4,
          },
          {
            sku: 'TFE-2026-LH-002-MRN-M',
            color: { name: 'Deep Royal Maroon', hexCode: '#4A0E17' },
            size: 'M',
            price: 58999,
            compareAtPrice: 75000,
            costPrice: 28000,
            stockQuantity: 5,
            reservedQuantity: 0,
            availableQuantity: 5,
          },
          {
            sku: 'TFE-2026-LH-002-MRN-L',
            color: { name: 'Deep Royal Maroon', hexCode: '#4A0E17' },
            size: 'L',
            price: 58999,
            compareAtPrice: 75000,
            costPrice: 28000,
            stockQuantity: 3,
            reservedQuantity: 0,
            availableQuantity: 3,
          },
          {
            sku: 'TFE-2026-LH-002-MRN-XL',
            color: { name: 'Deep Royal Maroon', hexCode: '#4A0E17' },
            size: 'XL',
            price: 58999,
            compareAtPrice: 75000,
            costPrice: 28000,
            stockQuantity: 2,
            reservedQuantity: 0,
            availableQuantity: 2,
          },
        ],
      },
      {
        articleCode: 'TFE-2026-AK-003',
        name: 'Gulmohar Hand-Block Chanderi Anarkali Set',
        slug: 'gulmohar-hand-block-chanderi-anarkali-set',
        shortDescription: 'Angrakha neckline flared Anarkali paired with silk pants and a sheer organza zari dupatta.',
        detailedDescription:
          'Evoking timeless Jaipur court aesthetics, this Anarkali is crafted from hand-spun Chanderi silk cotton adorned with Bagru-inspired natural dye motifs. The yoke is accentuated with delicate hand-done Gotta Patti laces and potli button details.',
        category: anarkaliCat._id,
        subcategory: 'Silk Anarkalis',
        collectionName: 'Festive Bloom 2026',
        attributes: {
          fabric: 'Chanderi Silk Cotton',
          materialComposition: '60% Silk, 40% Mercerized Cotton',
          texture: 'Lightweight, graceful sheen with structured flare',
          weave: 'Handspun Chanderi',
          pattern: 'Hand Block Botanical Print',
          workType: ['Gotta Patti', 'Potli Buttons', 'Hand Embroidery'],
          style: 'Flared Angrakha Anarkali',
          fit: 'Comfort Fit',
          occasion: ['Festive Celebrations', 'Sangeet & Mehendi'],
          season: 'Spring / Summer / Festive',
          neckType: 'Angrakha V-Neck',
          sleeveLength: 'Three-Quarter Sleeves',
          washCare: ['Dry Clean Recommended', 'Cold Hand Wash Separately'],
        },
        basePrice: 8499,
        compareAtPrice: 11999,
        costPrice: 3800,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1200&auto=format&fit=crop',
            altText: 'Gulmohar Chanderi Anarkali Suit Set',
            viewType: 'front' as const,
            isPrimary: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1200&auto=format&fit=crop',
            altText: 'Gotta Patti Neckline and Sleeve Detailing',
            viewType: 'texture_closeup' as const,
            isPrimary: false,
          },
        ],
        tags: ['anarkali', 'chanderi', 'suit', 'festive', 'gotta patti', 'ethnic set'],
        isPublished: true,
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: false,
        lowStockThreshold: 4,
        variants: [
          {
            sku: 'TFE-2026-AK-003-PNK-S',
            color: { name: 'Gulabi Blush Pink', hexCode: '#F4DDD9' },
            size: 'S',
            price: 8499,
            compareAtPrice: 11999,
            costPrice: 3800,
            stockQuantity: 6,
            reservedQuantity: 0,
            availableQuantity: 6,
          },
          {
            sku: 'TFE-2026-AK-003-PNK-M',
            color: { name: 'Gulabi Blush Pink', hexCode: '#F4DDD9' },
            size: 'M',
            price: 8499,
            compareAtPrice: 11999,
            costPrice: 3800,
            stockQuantity: 8,
            reservedQuantity: 0,
            availableQuantity: 8,
          },
          {
            sku: 'TFE-2026-AK-003-PNK-L',
            color: { name: 'Gulabi Blush Pink', hexCode: '#F4DDD9' },
            size: 'L',
            price: 8499,
            compareAtPrice: 11999,
            costPrice: 3800,
            stockQuantity: 5,
            reservedQuantity: 0,
            availableQuantity: 5,
          },
          {
            sku: 'TFE-2026-AK-003-PNK-XL',
            color: { name: 'Gulabi Blush Pink', hexCode: '#F4DDD9' },
            size: 'XL',
            price: 8499,
            compareAtPrice: 11999,
            costPrice: 3800,
            stockQuantity: 4,
            reservedQuantity: 0,
            availableQuantity: 4,
          },
        ],
      },
      {
        articleCode: 'TFE-2026-KT-004',
        name: 'Avani Chikankari Mulmul Straight Kurti',
        slug: 'avani-chikankari-mulmul-straight-kurti',
        shortDescription: 'Delicate hand-embroidered Lucknowi Chikankari kurta in pure organic breathable mulmul.',
        detailedDescription:
          'Crafted by generational women artisans in Lucknow, this kurta features authentic Bakhiya (shadow work), Phanda, and Keel Kangan stitches. Designed for pristine daily luxury and graceful office wear, paired effortlessly with palazzos or cigarette pants.',
        category: kurtiCat._id,
        subcategory: 'Straight Silk Kurtis',
        collectionName: 'Artisanal Essentials',
        attributes: {
          fabric: 'Pure Mulmul Cotton',
          materialComposition: '100% Breathable Fine Organic Mulmul Cotton',
          texture: 'Whisper-soft, airy, cooling to the skin',
          weave: 'Plain Mulmul Weave',
          pattern: 'Tonal Jaal & Paisley Motifs',
          workType: ['Chikankari', 'Hand Embroidery', 'Shadow Work'],
          style: 'Straight Cut Kurta',
          fit: 'Relaxed Fit',
          occasion: ['Daily Luxury & Office Luxe', 'Festive Celebrations'],
          season: 'Spring / Summer',
          neckType: 'Round Neck with Keyhole Slit',
          sleeveLength: 'Full Sleeves',
          washCare: ['Hand Wash Gently in Cold Water', 'Dry in Shade', 'Warm Iron'],
        },
        basePrice: 3999,
        compareAtPrice: 5499,
        costPrice: 1500,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1200&auto=format&fit=crop',
            altText: 'Avani Chikankari White Kurta Model Shot',
            viewType: 'front' as const,
            isPrimary: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
            altText: 'Close up of shadow Chikankari embroidery',
            viewType: 'texture_closeup' as const,
            isPrimary: false,
          },
        ],
        tags: ['chikankari', 'cotton', 'kurti', 'mulmul', 'white kurta', 'daily luxury', 'summer'],
        isPublished: true,
        isFeatured: true,
        isNewArrival: false,
        isBestSeller: true,
        lowStockThreshold: 5,
        variants: [
          {
            sku: 'TFE-2026-KT-004-WHT-XS',
            color: { name: 'Ivory Pearl', hexCode: '#FAF7F2' },
            size: 'XS',
            price: 3999,
            compareAtPrice: 5499,
            costPrice: 1500,
            stockQuantity: 5,
            reservedQuantity: 0,
            availableQuantity: 5,
          },
          {
            sku: 'TFE-2026-KT-004-WHT-S',
            color: { name: 'Ivory Pearl', hexCode: '#FAF7F2' },
            size: 'S',
            price: 3999,
            compareAtPrice: 5499,
            costPrice: 1500,
            stockQuantity: 10,
            reservedQuantity: 0,
            availableQuantity: 10,
          },
          {
            sku: 'TFE-2026-KT-004-WHT-M',
            color: { name: 'Ivory Pearl', hexCode: '#FAF7F2' },
            size: 'M',
            price: 3999,
            compareAtPrice: 5499,
            costPrice: 1500,
            stockQuantity: 12,
            reservedQuantity: 0,
            availableQuantity: 12,
          },
          {
            sku: 'TFE-2026-KT-004-WHT-L',
            color: { name: 'Ivory Pearl', hexCode: '#FAF7F2' },
            size: 'L',
            price: 3999,
            compareAtPrice: 5499,
            costPrice: 1500,
            stockQuantity: 8,
            reservedQuantity: 0,
            availableQuantity: 8,
          },
          {
            sku: 'TFE-2026-KT-004-WHT-XL',
            color: { name: 'Ivory Pearl', hexCode: '#FAF7F2' },
            size: 'XL',
            price: 3999,
            compareAtPrice: 5499,
            costPrice: 1500,
            stockQuantity: 6,
            reservedQuantity: 0,
            availableQuantity: 6,
          },
        ],
      },
      {
        articleCode: 'TFE-2026-GW-005',
        name: 'Aurelia Draped Satin Evening Gown',
        slug: 'aurelia-draped-satin-evening-gown',
        shortDescription: 'Couture cowl neckline champagne gold satin gown with sculpted corset and thigh-high slit.',
        detailedDescription:
          'A modern fusion of classic Hollywood glamour and contemporary Indo-western draping. Features an internal boned corset that cinches the waist seamlessly, flowing into a liquid-silk floor-skimming skirt with a trailing train.',
        category: gownCat._id,
        subcategory: 'Satin Evening Gowns',
        collectionName: 'Couture Soirée',
        attributes: {
          fabric: 'Organza Tissue',
          materialComposition: '100% Heavy Duchess Satin & Silk Organza',
          texture: 'Liquid smooth, glossy reflective satin drape',
          weave: 'Satin Weave',
          pattern: 'Solid Metallic Glow',
          workType: ['Corsetry', 'Pleated Cowl Draping', 'Crystal Brooch Accent'],
          style: 'Draped Column Gown',
          fit: 'Sculpted Bodycon',
          occasion: ['Cocktail & Evening Gala'],
          season: 'All Seasons',
          neckType: 'Cowl Neck',
          sleeveLength: 'Sleeveless with Spaghetti Straps',
          washCare: ['Dry Clean Only'],
        },
        basePrice: 14999,
        compareAtPrice: 19999,
        costPrice: 6200,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1200&auto=format&fit=crop',
            altText: 'Aurelia Champagne Satin Gown Full Silhouette',
            viewType: 'front' as const,
            isPrimary: true,
          },
        ],
        tags: ['gown', 'satin', 'cocktail', 'champagne gold', 'evening wear', 'slit gown', 'corset'],
        isPublished: true,
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: false,
        lowStockThreshold: 3,
        variants: [
          {
            sku: 'TFE-2026-GW-005-GLD-S',
            color: { name: 'Champagne Gold', hexCode: '#D4AF37' },
            size: 'S',
            price: 14999,
            compareAtPrice: 19999,
            costPrice: 6200,
            stockQuantity: 4,
            reservedQuantity: 0,
            availableQuantity: 4,
          },
          {
            sku: 'TFE-2026-GW-005-GLD-M',
            color: { name: 'Champagne Gold', hexCode: '#D4AF37' },
            size: 'M',
            price: 14999,
            compareAtPrice: 19999,
            costPrice: 6200,
            stockQuantity: 6,
            reservedQuantity: 0,
            availableQuantity: 6,
          },
          {
            sku: 'TFE-2026-GW-005-GLD-L',
            color: { name: 'Champagne Gold', hexCode: '#D4AF37' },
            size: 'L',
            price: 14999,
            compareAtPrice: 19999,
            costPrice: 6200,
            stockQuantity: 3,
            reservedQuantity: 0,
            availableQuantity: 3,
          },
        ],
      },
      {
        articleCode: 'TFE-2026-CD-006',
        name: 'Zephyr Pure Silk Draped Co-ord Set',
        slug: 'zephyr-pure-silk-draped-coord-set',
        shortDescription: 'Tailored silk cropped cape blazer paired with high-waisted pleated dhoti trousers.',
        detailedDescription:
          'Engineered for the jetsetter fashionista. This modern co-ord merges architectural tailoring with the fluid drape of raw silk. Features metallic hand-stitched piping and mother-of-pearl button accents.',
        category: coordCat._id,
        subcategory: 'Silk Printed Sets',
        collectionName: 'Modern Festive Chic',
        attributes: {
          fabric: 'Banarasi Katan Silk',
          materialComposition: '100% Pure Raw Silk',
          texture: 'Textured slub feel with crisp tailored structure',
          weave: 'Raw Silk Twill',
          pattern: 'Geometric Gold Zari Accent',
          workType: ['Hand Tailored', 'Zari Piping'],
          style: 'Crop Cape & Dhoti Trousers',
          fit: 'Tailored Slim Fit',
          occasion: ['Sangeet & Mehendi', 'Cocktail & Evening Gala'],
          season: 'All Seasons',
          washCare: ['Dry Clean Only'],
        },
        basePrice: 9999,
        compareAtPrice: 13999,
        costPrice: 4200,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
            altText: 'Zephyr Silk Co-ord Set Fashion View',
            viewType: 'front' as const,
            isPrimary: true,
          },
        ],
        tags: ['coord', 'silk', 'cape', 'dhoti', 'indo-western', 'sangeet', 'emerald'],
        isPublished: true,
        isFeatured: false,
        isNewArrival: true,
        isBestSeller: false,
        lowStockThreshold: 3,
        variants: [
          {
            sku: 'TFE-2026-CD-006-EMR-S',
            color: { name: 'Emerald Velvet Green', hexCode: '#0D382A' },
            size: 'S',
            price: 9999,
            compareAtPrice: 13999,
            costPrice: 4200,
            stockQuantity: 5,
            reservedQuantity: 0,
            availableQuantity: 5,
          },
          {
            sku: 'TFE-2026-CD-006-EMR-M',
            color: { name: 'Emerald Velvet Green', hexCode: '#0D382A' },
            size: 'M',
            price: 9999,
            compareAtPrice: 13999,
            costPrice: 4200,
            stockQuantity: 7,
            reservedQuantity: 0,
            availableQuantity: 7,
          },
          {
            sku: 'TFE-2026-CD-006-EMR-L',
            color: { name: 'Emerald Velvet Green', hexCode: '#0D382A' },
            size: 'L',
            price: 9999,
            compareAtPrice: 13999,
            costPrice: 4200,
            stockQuantity: 4,
            reservedQuantity: 0,
            availableQuantity: 4,
          },
        ],
      },
    ];

    for (const pData of productsData) {
      const { variants, ...productInfo } = pData;
      const totalStock = variants.reduce((sum, v) => sum + v.stockQuantity, 0);

      const createdProduct = await Product.create({
        ...productInfo,
        totalStock,
      });

      for (const vData of variants) {
        const createdVariant = await ProductVariant.create({
          ...vData,
          productId: createdProduct._id,
        });

        // Create Initial Purchase Inward Inventory Transaction for Audit trail
        await InventoryTransaction.create({
          variantId: createdVariant._id,
          productId: createdProduct._id,
          sku: createdVariant.sku,
          type: 'PURCHASE_INWARD',
          quantityDelta: createdVariant.stockQuantity,
          previousStock: 0,
          newStock: createdVariant.stockQuantity,
          reason: 'Initial Opening Stock from Handloom Guild Inward',
          performedBy: inventoryManager._id,
          costAtTransaction: createdVariant.costPrice,
        });
      }
    }

    // 7. Seed Physical Boutiques / Branches
    console.log('[Seed] Seeding Boutique Locations...');
    await Branch.create([
      {
        name: 'The Femina Exclusive — Flagship Boutique',
        city: 'New Delhi',
        address: 'B-14, Ground & 1st Floor, South Extension Part II, Ring Road, New Delhi, Delhi 110049',
        phone: '+91 11 4123 4567',
        email: 'southex@thefeminaexclusive.com',
        openingHours: '10:30 AM – 09:00 PM (Monday to Sunday)',
        googleMapsUrl: 'https://maps.google.com/?q=South+Extension+Part+II+New+Delhi',
        images: ['https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=800&auto=format&fit=crop'],
        isFlagship: true,
      },
      {
        name: 'The Femina Exclusive — Mumbai Atelier',
        city: 'Mumbai',
        address: 'Plot 42, Waterfield Road, Bandra West, Mumbai, Maharashtra 400050',
        phone: '+91 22 2640 8899',
        email: 'bandra@thefeminaexclusive.com',
        openingHours: '11:00 AM – 09:30 PM (All Days)',
        googleMapsUrl: 'https://maps.google.com/?q=Waterfield+Road+Bandra+West+Mumbai',
        images: ['https://images.unsplash.com/photo-1555529771-7888783a18d3?q=80&w=800&auto=format&fit=crop'],
        isFlagship: false,
      },
      {
        name: 'The Femina Exclusive — Bengaluru Studio',
        city: 'Bengaluru',
        address: '100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038',
        phone: '+91 80 4912 3456',
        email: 'indiranagar@thefeminaexclusive.com',
        openingHours: '10:30 AM – 08:30 PM (All Days)',
        googleMapsUrl: 'https://maps.google.com/?q=100+Feet+Road+Indiranagar+Bengaluru',
        images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop'],
        isFlagship: false,
      },
    ]);

    // 8. Seed Operational Expenses (for Accounting / P&L Module)
    console.log('[Seed] Seeding Sample Operational Expenses...');
    await Expense.create([
      {
        expenseCode: 'EXP-2026-001',
        category: 'PACKAGING',
        description: 'Bespoke Rigid Gold-Embossed Keepsake Boxes (Batch of 500)',
        amount: 45000,
        expenseDate: new Date('2026-02-15'),
        paymentMethod: 'BANK_TRANSFER',
        vendorPayee: 'Imperial Luxury Packaging Solutions',
        recordedBy: accountant._id,
        notes: 'Premium gold foil lining boxes for bridal shipments',
      },
      {
        expenseCode: 'EXP-2026-002',
        category: 'MARKETING',
        description: 'Royal Heritage Festive Campaign & Editorial Fashion Photography',
        amount: 85000,
        expenseDate: new Date('2026-02-20'),
        paymentMethod: 'UPI',
        vendorPayee: 'Studio Luxe Creative Agency',
        recordedBy: accountant._id,
        notes: 'High-res lookbook & video production for website banner',
      },
      {
        expenseCode: 'EXP-2026-003',
        category: 'RENT',
        description: 'South Extension Boutique Monthly Lease - March 2026',
        amount: 220000,
        expenseDate: new Date('2026-03-01'),
        paymentMethod: 'BANK_TRANSFER',
        vendorPayee: 'South Ex Properties Ltd',
        recordedBy: accountant._id,
      },
    ]);

    // 9. Seed Storefront Content Master
    console.log('[Seed] Seeding Content Settings...');
    await Content.create({
      heroVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-pink-silk-dress-41139-large.mp4',
      heroVideoPoster: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1600&auto=format&fit=crop',
      heroTitle: 'Royal Elegance Redefined',
      heroSubtitle: 'Discover Handcrafted Sarees, Bespoke Lehengas & Pure Silk Haute Couture',
      heroCtaText: 'Explore Royal Collection',
      heroCtaLink: '/shop',
      announcementText: 'Complimentary Pan-India Insured Express Shipping on All Orders',
      aboutUsText:
        'The Femina Exclusive is dedicated to celebrating the timeless grandeur of Indian craftsmanship and contemporary haute couture.',
      aboutUsVision:
        'Empowering the modern woman with bespoke artisanal elegance, intricate handloom weaves, and royal luxury.',
      aboutUsCraftsmanship:
        'Each silhouette is brought to life with hand-spun Chanderi, Banarasi silk, intricate Zardozi, Gotta Patti, and Chikankari master artisans.',
      aboutUsImages: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
      ],
      noReturnPolicyNotice:
        'Due to the delicate artisanal hand-embroidery and pure fabric craftsmanship of our exclusive pieces, all sales are strictly final. We do not accept returns or exchanges.',
      shippingInfoText:
        'All orders are carefully inspected, hand-packed in bespoke luxury keepsake boxes, and dispatched via premium insured express couriers within 24-48 business hours.',
      updatedBy: superAdmin._id,
    });

    console.log('\n======================================================');
    console.log('✨ [Seed] Database Seeding Completed Successfully! ✨');
    console.log('======================================================');
    console.log('Default Credentials:');
    console.log('• Super Admin: admin@thefeminaexclusive.com / Femina@2026');
    console.log('• Inventory Manager: inventory@thefeminaexclusive.com / Femina@2026');
    console.log('• Accountant: accounts@thefeminaexclusive.com / Femina@2026');
    console.log('• Sample Customer: customer@femina.com / Femina@2026');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ [Seed] Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
