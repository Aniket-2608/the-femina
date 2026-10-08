import React from 'react';
import { useGetBranchesQuery } from '../../../store/api/apiSlice.js';
import { Button } from '../../../components/common/Button.js';
import { MapPin, Phone, Mail, Clock, ExternalLink, Sparkles } from 'lucide-react';

export const BranchesPage: React.FC = () => {
  const { data, isLoading } = useGetBranchesQuery();
  const branches = data?.data || [];

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <section className="bg-luxury-gradient text-white py-16 px-4 text-center border-b border-gold-900/30">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1 rounded-full text-gold-300 text-xs font-semibold uppercase tracking-widest border border-gold-400/30">
            <MapPin className="w-3.5 h-3.5 text-gold-400" />
            <span>Maison Boutiques</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold">
            Visit Our Luxury Boutiques
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 font-light max-w-xl mx-auto leading-relaxed">
            Experience our private bridal suites, master tailoring ateliers, and handloom galleries across India.
          </p>
        </div>
      </section>

      {/* Branches List */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 bg-femina-200/50 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {branches.map((branch) => (
              <div
                key={branch._id}
                className={`bg-white rounded-3xl overflow-hidden border shadow-luxury flex flex-col justify-between transition-all hover:-translate-y-1 ${
                  branch.isFlagship ? 'border-gold-400/80 ring-2 ring-gold-200' : 'border-femina-200'
                }`}
              >
                <div>
                  <div className="aspect-[16/9] bg-femina-100 relative overflow-hidden">
                    <img
                      src={branch.images?.[0] || 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=800&auto=format&fit=crop'}
                      alt={branch.name}
                      className="w-full h-full object-cover"
                    />
                    {branch.isFlagship && (
                      <span className="absolute top-3 left-3 bg-gold-400 text-luxury-dark text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                        Flagship Boutique
                      </span>
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <span className="text-[11px] font-bold text-femina-700 tracking-wider uppercase">
                        {branch.city}
                      </span>
                      <h3 className="font-serif text-xl font-bold text-luxury-dark mt-0.5">{branch.name}</h3>
                    </div>

                    <div className="space-y-2.5 text-xs text-gray-600">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-femina-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{branch.address}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Phone className="w-4 h-4 text-femina-600 shrink-0" />
                        <span>{branch.phone}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-femina-600 shrink-0" />
                        <span>{branch.email}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-femina-600 shrink-0" />
                        <span>{branch.openingHours}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  {branch.googleMapsUrl && (
                    <a href={branch.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="w-full justify-center" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                        Get Directions on Google Maps
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
