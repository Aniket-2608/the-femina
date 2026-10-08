import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice.js';
import {
  MessageCircle,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  HeartHandshake,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const dispatch = useDispatch();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    dispatch(
      addToast({
        type: 'success',
        message: 'Thank you for subscribing to The Femina Exclusive Private Gazette.',
      })
    );
    setNewsletterEmail('');
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      'Hello The Femina Exclusive, I would like to inquire about your bespoke couture and bridal collections.'
    );
    window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
  };

  return (
    <footer className="bg-luxury-dark text-white border-t border-gold-900/30">
      {/* Policy & Assurance Banner */}
      <div className="border-b border-white/10 bg-black/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold-900/40 border border-gold-400/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider text-gold-300 uppercase">100% Authentic Handloom</h4>
              <p className="text-xs text-gray-400 mt-0.5">Direct from generational master weavers & artisans.</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold-900/40 border border-gold-400/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider text-gold-300 uppercase">Artisanal Final Sale Policy</h4>
              <p className="text-xs text-gray-400 mt-0.5">Strictly No Returns due to bespoke hand-embroidery.</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold-900/40 border border-gold-400/30 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider text-gold-300 uppercase">Concierge Styling Support</h4>
              <p className="text-xs text-gray-400 mt-0.5">Direct stylist guidance via WhatsApp & Email.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Bio */}
          <div className="lg:col-span-2 space-y-4">
            <span className="font-serif text-2xl font-bold tracking-widest text-gold-shimmer uppercase block">
              The Femina Exclusive
            </span>
            <p className="text-xs text-gray-400 leading-relaxed max-w-md">
              Celebrating the timeless grandeur of Indian handlooms, Banarasi katan silks, fine Chanderi weaves, and bespoke bridal couture. Every garment is handcrafted with generational craftsmanship.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleWhatsAppClick}
                className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Stylist</span>
              </button>
              <a
                href="mailto:contact@thefeminaexclusive.com"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
              >
                <Mail className="w-4 h-4" />
                <span>Email Us</span>
              </a>
            </div>
          </div>

          {/* Quick Collections */}
          <div>
            <h4 className="text-xs font-bold tracking-widest text-gold-400 uppercase mb-4">Couture Collections</h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>
                <Link to="/shop?category=sarees" className="hover:text-gold-300 transition-colors">
                  Pure Banarasi Sarees
                </Link>
              </li>
              <li>
                <Link to="/shop?category=lehengas" className="hover:text-gold-300 transition-colors">
                  Bridal Velvet Lehengas
                </Link>
              </li>
              <li>
                <Link to="/shop?category=anarkalis-suits" className="hover:text-gold-300 transition-colors">
                  Chanderi Anarkali Sets
                </Link>
              </li>
              <li>
                <Link to="/shop?category=kurtis-tunics" className="hover:text-gold-300 transition-colors">
                  Chikankari Mulmul Kurtas
                </Link>
              </li>
              <li>
                <Link to="/shop?category=party-gowns" className="hover:text-gold-300 transition-colors">
                  Evening Satin Gowns
                </Link>
              </li>
            </ul>
          </div>

          {/* Brand & Branches */}
          <div>
            <h4 className="text-xs font-bold tracking-widest text-gold-400 uppercase mb-4">The Maison</h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>
                <Link to="/about" className="hover:text-gold-300 transition-colors">
                  About Our Heritage
                </Link>
              </li>
              <li>
                <Link to="/branches" className="hover:text-gold-300 transition-colors">
                  Delhi Flagship Boutique
                </Link>
              </li>
              <li>
                <Link to="/branches" className="hover:text-gold-300 transition-colors">
                  Mumbai Bandra Atelier
                </Link>
              </li>
              <li>
                <Link to="/branches" className="hover:text-gold-300 transition-colors">
                  Bengaluru Studio
                </Link>
              </li>
              <li>
                <span className="text-gold-400/80 font-medium block">No Return Policy Policy</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div>
            <h4 className="text-xs font-bold tracking-widest text-gold-400 uppercase mb-4">Private Gazette</h4>
            <p className="text-xs text-gray-400 mb-3">
              Receive private invitations to preview limited festive drops and bridal collections.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold-400 transition-colors"
                required
              />
              <button
                type="submit"
                className="w-full bg-gold-gradient hover:brightness-110 text-luxury-dark font-semibold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Copyright & Policy Acknowledgement */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© 2026 The Femina Exclusive. All Rights Reserved. Luxury Female Haute Couture.</p>
          <div className="flex items-center gap-4 text-gray-400">
            <span>Secure Razorpay 256-bit Encrypted Payments</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
