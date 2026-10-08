import React from 'react';
import { useGetStoreContentQuery } from '../../../store/api/apiSlice.js';
import { Sparkles, Award, ShieldCheck, HeartHandshake, Scissors } from 'lucide-react';

export const AboutUsPage: React.FC = () => {
  const { data } = useGetStoreContentQuery();
  const content = data?.data;

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Header */}
      <section className="bg-luxury-gradient text-white py-20 px-4 text-center border-b border-gold-900/30">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1 rounded-full text-gold-300 text-xs font-semibold uppercase tracking-widest border border-gold-400/30">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Maison Heritage</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight">
            The Femina Exclusive
          </h1>
          <p className="text-sm sm:text-base text-gray-300 font-light leading-relaxed max-w-2xl mx-auto">
            {content?.aboutUsVision ||
              'Empowering the modern woman with bespoke artisanal elegance, intricate handloom weaves, and royal luxury.'}
          </p>
        </div>
      </section>

      {/* Brand Story & Craftsmanship Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-femina-700 tracking-[0.25em] uppercase">Artisanal Roots</span>
            <h2 className="font-serif text-3xl font-bold text-luxury-dark">Our Royal Heritage</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {content?.aboutUsText ||
                'The Femina Exclusive is dedicated to celebrating the timeless grandeur of Indian craftsmanship and contemporary haute couture.'}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {content?.aboutUsCraftsmanship ||
                'Each silhouette is brought to life with hand-spun Chanderi, Banarasi silk, intricate Zardozi, Gotta Patti, and Chikankari master artisans.'}
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-luxury border border-femina-200 aspect-[4/3] bg-femina-100">
            <img
              src={content?.aboutUsImages?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop'}
              alt="Artisan Craftsmanship"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          <div className="bg-white rounded-3xl p-8 border border-femina-200 shadow-luxury space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-femina-100 text-luxury-wine flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-luxury-dark">Authentic Master Handlooms</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Direct provenance from certified handloom weaving clusters across Varanasi, Chanderi, and Jaipur.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-femina-200 shadow-luxury space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-femina-100 text-luxury-wine flex items-center justify-center">
              <Scissors className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-luxury-dark">Generational Hand Embroidery</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Preserving authentic Mughal Zardozi, delicate Lucknowi Chikankari, and intricate Gotta Patti embroidery techniques.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-femina-200 shadow-luxury space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-femina-100 text-luxury-wine flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-luxury-dark">Artisanal Final Sale Integrity</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Ensuring each garment received by our patrons is pristine, unworn, and handcrafted to bespoke perfection.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
