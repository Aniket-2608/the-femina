import React, { useState } from 'react';
import {
  useGetAdminProductsQuery,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useGetTaxonomyQuery,
} from '../../../store/api/apiSlice.js';
import { useDispatch } from 'react-redux';
import { addToast } from '../../../store/slices/uiSlice.js';
import { Button } from '../../../components/common/Button.js';
import { Badge } from '../../../components/common/Badge.js';
import {
  Plus,
  Search,
  Shirt,
  Sparkles,
  Edit2,
  CheckCircle2,
  XCircle,
  X,
  Layers,
} from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Queries & Mutations
  const { data: productsData, isLoading } = useGetAdminProductsQuery({ page, limit: 15, search: searchTerm });
  const { data: taxonomyData } = useGetTaxonomyQuery();
  const [createProductMutation, { isLoading: isCreating }] = useCreateAdminProductMutation();
  const [updateProductMutation] = useUpdateAdminProductMutation();

  // Create Article Form State
  const [newArticle, setNewArticle] = useState({
    articleCode: '',
    name: '',
    slug: '',
    shortDescription: '',
    detailedDescription: '',
    category: '',
    basePrice: 0,
    compareAtPrice: 0,
    costPrice: 0,
    attributes: {
      fabric: 'Banarasi Katan Silk',
      pattern: 'Solid Handloom',
      workType: ['Zari Woven'],
      style: 'Royal Saree',
      occasion: ['Festive Celebrations'],
      fit: 'Regular Fit',
      washCare: ['Dry Clean Only'],
    },
    images: [{ url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop', altText: 'Front', viewType: 'front', isPrimary: true }],
    variants: [
      {
        sku: '',
        color: { name: 'Royal Crimson', hexCode: '#8B0000' },
        size: 'FreeSize',
        costPrice: 0,
        price: 0,
        stockQuantity: 10,
      },
    ],
  });

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await updateProductMutation({ id, data: { isPublished: !currentStatus } }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Article publication status updated.' }));
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to update article status.' }));
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      await updateProductMutation({ id, data: { isFeatured: !currentStatus } }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Article featured status updated.' }));
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to update featured flag.' }));
    }
  };

  const handleAddVariantRow = () => {
    setNewArticle((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          sku: `${prev.articleCode}-VAR-${prev.variants.length + 1}`,
          color: { name: 'Emerald Green', hexCode: '#0D382A' },
          size: 'M',
          costPrice: prev.costPrice,
          price: prev.basePrice,
          stockQuantity: 5,
        },
      ],
    }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArticle.articleCode || !newArticle.name || !newArticle.category) {
      dispatch(addToast({ type: 'error', message: 'Please fill in required fields.' }));
      return;
    }

    try {
      await createProductMutation(newArticle).unwrap();
      setIsModalOpen(false);
      dispatch(addToast({ type: 'success', message: `Master Article ${newArticle.name} created.` }));
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err?.data?.message || 'Creation failed.' }));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-femina-200">
        <div>
          <span className="text-[11px] font-bold text-femina-700 tracking-[0.25em] uppercase">
            Master Data Registry
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-dark mt-0.5">
            Articles & Fashion Products
          </h1>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          variant="gold"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Master Article
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-femina-200 shadow-luxury">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Article Code, Name, Fabric..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-femina-50 border border-femina-200 rounded-xl text-xs focus:outline-none focus:border-luxury-wine"
          />
        </div>
        <div className="text-xs text-gray-500 font-medium">
          Total Registered Articles: <strong>{productsData?.meta?.total || 0}</strong>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-3xl border border-femina-200 shadow-luxury overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-femina-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-femina-200">
              <tr>
                <th className="py-3 px-4">Article / SKU</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Fabric</th>
                <th className="py-3 px-4">Cost Price</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Margin %</th>
                <th className="py-3 px-4">Total Stock</th>
                <th className="py-3 px-4">Featured</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-femina-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-gray-400">Loading articles registry...</td>
                </tr>
              ) : productsData?.data?.map((art) => {
                const marginPercent = art.basePrice > 0 ? Math.round(((art.basePrice - art.costPrice) / art.basePrice) * 100) : 0;
                return (
                  <tr key={art._id} className="hover:bg-femina-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-luxury-wine">{art.articleCode}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-luxury-dark">{art.name}</div>
                      <div className="text-[11px] text-gray-400">{art.category?.name}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-700">{art.attributes?.fabric}</td>
                    <td className="py-3.5 px-4 font-mono">₹{art.costPrice.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-luxury-wine">
                      ₹{art.basePrice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                        {marginPercent}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          art.totalStock <= 5 ? 'bg-amber-100 text-amber-800' : 'bg-femina-100 text-femina-900'
                        }`}
                      >
                        {art.totalStock} Units
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleFeatured(art._id, art.isFeatured)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                          art.isFeatured ? 'bg-gold-100 text-gold-900' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {art.isFeatured ? 'Featured' : 'Regular'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleTogglePublish(art._id, art.isPublished)}
                        className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                          art.isPublished ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                        }`}
                      >
                        {art.isPublished ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{art.isPublished ? 'Live' : 'Draft'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Article Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-xs" />
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 z-10 animate-slide-up border border-femina-200">
            <div className="flex items-center justify-between pb-4 border-b border-femina-200">
              <div>
                <h3 className="font-serif text-xl font-bold text-luxury-wine uppercase tracking-wider">
                  New Master Article & Variant Matrix
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Register a bespoke female fashion article with attributes.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-6 h-6 text-gray-400 hover:text-luxury-wine" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-6 text-xs">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Article Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TFE-2026-SR-010"
                    value={newArticle.articleCode}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setNewArticle({
                        ...newArticle,
                        articleCode: val,
                        variants: newArticle.variants.map((v, i) => ({ ...v, sku: `${val}-VAR-${i + 1}` })),
                      });
                    }}
                    className="w-full px-3 py-2 bg-femina-50 border border-femina-200 rounded-xl font-mono uppercase font-bold text-luxury-wine"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Article Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maharani Royal Banarasi Katan Silk Saree"
                    value={newArticle.name}
                    onChange={(e) =>
                      setNewArticle({
                        ...newArticle,
                        name: e.target.value,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                      })
                    }
                    className="w-full px-3 py-2 bg-femina-50 border border-femina-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Category & Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Category</label>
                  <select
                    required
                    value={newArticle.category}
                    onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                    className="w-full px-3 py-2 bg-femina-50 border border-femina-200 rounded-xl"
                  >
                    <option value="">Select Category</option>
                    {taxonomyData?.data?.categories?.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Cost Price (COGS)</label>
                  <input
                    type="number"
                    required
                    value={newArticle.costPrice}
                    onChange={(e) => {
                      const cost = Number(e.target.value);
                      setNewArticle({
                        ...newArticle,
                        costPrice: cost,
                        variants: newArticle.variants.map((v) => ({ ...v, costPrice: cost })),
                      });
                    }}
                    className="w-full px-3 py-2 bg-femina-50 border border-femina-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Selling Price (Base)</label>
                  <input
                    type="number"
                    required
                    value={newArticle.basePrice}
                    onChange={(e) => {
                      const price = Number(e.target.value);
                      setNewArticle({
                        ...newArticle,
                        basePrice: price,
                        variants: newArticle.variants.map((v) => ({ ...v, price })),
                      });
                    }}
                    className="w-full px-3 py-2 bg-femina-50 border border-femina-200 rounded-xl font-bold text-luxury-wine"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Compare Price</label>
                  <input
                    type="number"
                    value={newArticle.compareAtPrice}
                    onChange={(e) => setNewArticle({ ...newArticle, compareAtPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-femina-50 border border-femina-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Short Description</label>
                  <input
                    type="text"
                    required
                    value={newArticle.shortDescription}
                    onChange={(e) => setNewArticle({ ...newArticle, shortDescription: e.target.value })}
                    className="w-full px-3 py-2 bg-femina-50 border border-femina-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Detailed Description</label>
                  <textarea
                    rows={3}
                    required
                    value={newArticle.detailedDescription}
                    onChange={(e) => setNewArticle({ ...newArticle, detailedDescription: e.target.value })}
                    className="w-full px-3 py-2 bg-femina-50 border border-femina-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Variants Matrix */}
              <div className="p-4 bg-femina-50 rounded-2xl border border-femina-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-luxury-wine uppercase tracking-wider">
                    Variant Stock Matrix ({newArticle.variants.length} SKUs)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="text-xs font-semibold text-luxury-wine hover:underline"
                  >
                    + Add Variant
                  </button>
                </div>

                {newArticle.variants.map((v, i) => (
                  <div key={i} className="grid grid-cols-5 gap-2 bg-white p-3 rounded-xl border border-femina-200">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase block">SKU</span>
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => {
                          const updated = [...newArticle.variants];
                          updated[i].sku = e.target.value;
                          setNewArticle({ ...newArticle, variants: updated });
                        }}
                        className="w-full font-mono text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase block">Color Name</span>
                      <input
                        type="text"
                        value={v.color.name}
                        onChange={(e) => {
                          const updated = [...newArticle.variants];
                          updated[i].color.name = e.target.value;
                          setNewArticle({ ...newArticle, variants: updated });
                        }}
                        className="w-full text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase block">Size</span>
                      <input
                        type="text"
                        value={v.size}
                        onChange={(e) => {
                          const updated = [...newArticle.variants];
                          updated[i].size = e.target.value;
                          setNewArticle({ ...newArticle, variants: updated });
                        }}
                        className="w-full text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase block">Selling Price</span>
                      <input
                        type="number"
                        value={v.price}
                        onChange={(e) => {
                          const updated = [...newArticle.variants];
                          updated[i].price = Number(e.target.value);
                          setNewArticle({ ...newArticle, variants: updated });
                        }}
                        className="w-full text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase block">Initial Stock</span>
                      <input
                        type="number"
                        value={v.stockQuantity}
                        onChange={(e) => {
                          const updated = [...newArticle.variants];
                          updated[i].stockQuantity = Number(e.target.value);
                          setNewArticle({ ...newArticle, variants: updated });
                        }}
                        className="w-full text-xs font-bold text-luxury-wine"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-femina-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-luxury-wine font-medium"
                >
                  Cancel
                </button>
                <Button type="submit" variant="gold" size="md" isLoading={isCreating}>
                  Publish Master Article
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
