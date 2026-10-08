import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetProductsQuery, useGetTaxonomyQuery, useGetStoreContentQuery } from '../../../store/api/apiSlice.js';
import { ProductCard } from '../../../components/display/ProductCard.js';
import { Button } from '../../../components/common/Button.js';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Gem,
  Volume2,
  VolumeX,
  Play,
  HeartHandshake,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const { data: storeContentData } = useGetStoreContentQuery();
  const { data: featuredData, isLoading: isFeaturedLoading } = useGetProductsQuery({ isFeatured: true, limit: 4 });
  const { data: newArrivalsData, isLoading: isNewArrivalsLoading } = useGetProductsQuery({ isNewArrival: true, limit: 4 });
  const { data: taxonomyData } = useGetTaxonomyQuery();

  const storeContent = storeContentData?.data;

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO VIDEO SECTION */}
      <section className="relative w-full h-[85vh] min-h-[580px] max-h-[850px] overflow-hidden bg-luxury-dark">
        {/* Background Video */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          poster={storeContent?.heroVideoPoster || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1600&auto=format&fit=crop'}
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
        >
          <source
            src={storeContent?.heroVideoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-pink-silk-dress-41139-large.mp4'}
            type="video/mp4"
          />
        </video>

        {/* Gradient Overlay for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />

        {/* Hero Content Overlay */}
        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 sm:pb-24 z-10">
          <div className="max-w-2xl space-y-4 animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-gold-400/40 px-3.5 py-1.5 rounded-full text-gold-300 text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Couture 2026 Festive Unveiling</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1]">
              {storeContent?.heroTitle || 'Royal Elegance Redefined'}
            </h1>

            <p className="text-sm sm:text-base text-gray-200 font-light leading-relaxed max-w-xl">
              {storeContent?.heroSubtitle ||
                'Discover Handcrafted Sarees, Bespoke Lehengas & Pure Silk Haute Couture tailored for royal occasions.'}
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-4">
              <Link to="/shop">
                <Button variant="gold" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  {storeContent?.heroCtaText || 'Explore Royal Collection'}
                </Button>
              </Link>
              <Link to="/shop?category=sarees">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-luxury-wine">
                  Banarasi Silk Drops
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Video Audio Control */}
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={toggleMute}
            className="p-3 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 transition-all"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </section>

      {/* 2. CURATED CATEGORY TILES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-bold text-femina-700 tracking-[0.25em] uppercase">Maison Curations</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-dark">Explore By Silhouette</h2>
          <div className="w-16 h-0.5 bg-gold-400 mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {taxonomyData?.data?.categories?.map((category) => (
            <Link
              key={category._id}
              to={`/shop?category=${category.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-femina-100 shadow-luxury hover:shadow-luxury-hover transition-all duration-300 hover:-translate-y-1 block"
            >
              <img
                src={category.imageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop'}
                alt={category.name}
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-center">
                <h3 className="font-serif text-sm sm:text-base font-bold text-white tracking-wide group-hover:text-gold-300 transition-colors">
                  {category.name}
                </h3>
                <span className="text-[10px] text-gray-300 uppercase tracking-widest mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  Discover →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED COUTURE SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-femina-700 tracking-[0.25em] uppercase">Exclusive Drops</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-dark mt-1">Featured Masterpieces</h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-bold text-luxury-wine uppercase tracking-wider hover:underline inline-flex items-center gap-1 self-start md:self-auto"
          >
            <span>View All Creations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isFeaturedLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-[3/4] bg-femina-200/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredData?.data?.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. SHOP BY FABRIC SPOTLIGHT */}
      <section className="bg-femina-100/70 py-16 border-y border-femina-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <span className="text-xs font-bold text-femina-700 tracking-[0.25em] uppercase">Textile Purity</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-dark">Shop By Pure Fabric</h2>
            <p className="text-xs text-gray-600 max-w-lg mx-auto">
              We exclusively source certified handloom katan silks, Chanderi cottons, and royal micro-velvets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {taxonomyData?.data?.fabrics?.slice(0, 3).map((fabric) => (
              <div
                key={fabric._id}
                className="bg-white rounded-2xl p-6 border border-femina-200 shadow-luxury flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-femina-100 text-luxury-wine flex items-center justify-center mb-4">
                    <Gem className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-luxury-dark mb-2">{fabric.name}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed mb-3">{fabric.description}</p>
                  <div className="text-[11px] text-femina-800 bg-femina-50 p-2.5 rounded-lg border border-femina-200/60 mb-4">
                    <strong>Handfeel:</strong> {fabric.textureDescription}
                  </div>
                </div>
                <Link to={`/shop?fabric=${encodeURIComponent(fabric.name)}`}>
                  <Button variant="secondary" size="sm" className="w-full justify-center">
                    Explore {fabric.name} Pieces
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS DROP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-femina-700 tracking-[0.25em] uppercase">Fresh Ateliers</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-dark mt-1">New Arrivals</h2>
          </div>
          <Link
            to="/shop?sort=newest"
            className="text-xs font-bold text-luxury-wine uppercase tracking-wider hover:underline inline-flex items-center gap-1 self-start md:self-auto"
          >
            <span>View Latest Drop</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isNewArrivalsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-[3/4] bg-femina-200/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivalsData?.data?.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 6. BESPOKE KEEPSAKE BOX EXPERIENCE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-luxury-gradient text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl border border-gold-500/30">
          <div className="max-w-xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 bg-gold-400/20 text-gold-300 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider border border-gold-400/30">
              <Award className="w-3.5 h-3.5" />
              <span>The Femina Unboxing Ritual</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Delivered In Hand-Crafted Keepsake Luxury Boxes
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
              Every heirloom piece is wrapped in pure scented muslin, packed in our signature gold-embossed rigid keepsake box, and shipped via insured express couriers directly to your doorstep.
            </p>
            <div className="pt-2">
              <Link to="/about">
                <Button variant="gold" size="md">
                  Read Our Craftsmanship Story
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
