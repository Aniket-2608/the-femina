import React, { useState, useEffect } from 'react';
import {
  useGetStoreContentQuery,
  useUpdateStoreContentMutation,
} from '../../../store/api/apiSlice.js';
import { Button } from '../../../components/common/Button.js';
import { useAppDispatch } from '../../../store/index.js';
import { addToast } from '../../../store/slices/uiSlice.js';

export const AdminContentPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: contentData, isLoading } = useGetStoreContentQuery();
  const [updateContent, { isLoading: isUpdating }] = useUpdateStoreContentMutation();

  const [formData, setFormData] = useState({
    heroVideoUrl: '',
    heroVideoPoster: '',
    heroTitle: '',
    heroSubtitle: '',
    heroCtaText: '',
    heroCtaLink: '',
    announcementText: '',
    aboutUsText: '',
    aboutUsVision: '',
    aboutUsCraftsmanship: '',
    noReturnPolicyNotice: '',
    shippingInfoText: '',
  });

  useEffect(() => {
    if (contentData?.data) {
      setFormData({
        heroVideoUrl: contentData.data.heroVideoUrl || '',
        heroVideoPoster: contentData.data.heroVideoPoster || '',
        heroTitle: contentData.data.heroTitle || '',
        heroSubtitle: contentData.data.heroSubtitle || '',
        heroCtaText: contentData.data.heroCtaText || '',
        heroCtaLink: contentData.data.heroCtaLink || '',
        announcementText: contentData.data.announcementText || '',
        aboutUsText: contentData.data.aboutUsText || '',
        aboutUsVision: contentData.data.aboutUsVision || '',
        aboutUsCraftsmanship: contentData.data.aboutUsCraftsmanship || '',
        noReturnPolicyNotice: contentData.data.noReturnPolicyNotice || '',
        shippingInfoText: contentData.data.shippingInfoText || '',
      });
    }
  }, [contentData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateContent(formData).unwrap();
      dispatch(addToast({ message: 'Storefront CMS content updated successfully', type: 'success' }));
    } catch (err: any) {
      dispatch(addToast({ message: err?.data?.message || 'Failed to update store content', type: 'error' }));
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-gray-400">Loading CMS content...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Content & Media CMS</h1>
        <p className="text-sm text-gray-600">Customize the homepage hero video banner, promotional captions, brand story & policies</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Hero Video & Showcase */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
            1. Hero Cinematic Video & Promotional Banner
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Hero Video MP4 URL
              </label>
              <input
                type="url"
                className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold font-mono"
                value={formData.heroVideoUrl}
                onChange={(e) => setFormData({ ...formData, heroVideoUrl: e.target.value })}
                required
              />
              <span className="text-[11px] text-gray-400">Direct CDN or HTTPS MP4 video link</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Hero Video Poster (Fallback Image)
              </label>
              <input
                type="url"
                className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold font-mono"
                value={formData.heroVideoPoster}
                onChange={(e) => setFormData({ ...formData, heroVideoPoster: e.target.value })}
                required
              />
              <span className="text-[11px] text-gray-400">Displayed while video buffers</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Hero Title
              </label>
              <input
                type="text"
                className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
                value={formData.heroTitle}
                onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Hero Subtitle
              </label>
              <input
                type="text"
                className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
                value={formData.heroSubtitle}
                onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                CTA Button Text
              </label>
              <input
                type="text"
                className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
                value={formData.heroCtaText}
                onChange={(e) => setFormData({ ...formData, heroCtaText: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                CTA Target Link
              </label>
              <input
                type="text"
                className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold font-mono"
                value={formData.heroCtaLink}
                onChange={(e) => setFormData({ ...formData, heroCtaLink: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Top Announcement Bar Text
            </label>
            <input
              type="text"
              className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
              value={formData.announcementText}
              onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
            />
          </div>
        </div>

        {/* Section 2: Brand Heritage & Story */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
            2. Brand Narrative, Vision & Craftsmanship
          </h2>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Brand Story / About Us Main Text
            </label>
            <textarea
              className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
              rows={3}
              value={formData.aboutUsText}
              onChange={(e) => setFormData({ ...formData, aboutUsText: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Brand Vision
            </label>
            <textarea
              className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
              rows={2}
              value={formData.aboutUsVision}
              onChange={(e) => setFormData({ ...formData, aboutUsVision: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Handcrafted Artisanship & Craftsmanship Description
            </label>
            <textarea
              className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
              rows={3}
              value={formData.aboutUsCraftsmanship}
              onChange={(e) => setFormData({ ...formData, aboutUsCraftsmanship: e.target.value })}
            />
          </div>
        </div>

        {/* Section 3: Legal Policy Notice */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
            3. Legal Notice & No Returns Policy
          </h2>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              No Return / Exchange Policy Statement
            </label>
            <textarea
              className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
              rows={3}
              value={formData.noReturnPolicyNotice}
              onChange={(e) => setFormData({ ...formData, noReturnPolicyNotice: e.target.value })}
              required
            />
            <span className="text-[11px] text-gray-400">
              Mandatory disclosure presented during customer checkout & order confirmation
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Velvet Keepsake Packaging & Insured Shipping Notice
            </label>
            <textarea
              className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
              rows={2}
              value={formData.shippingInfoText}
              onChange={(e) => setFormData({ ...formData, shippingInfoText: e.target.value })}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isUpdating}
          >
            Publish Live Storefront Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
