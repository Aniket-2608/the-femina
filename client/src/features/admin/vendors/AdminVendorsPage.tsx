import React, { useState } from 'react';
import {
  useGetVendorsQuery,
  useCreateVendorMutation,
  useCreatePurchaseOrderMutation,
  useGetAdminProductsQuery,
} from '../../../store/api/apiSlice.js';
import { Button } from '../../../components/common/Button.js';
import { Badge } from '../../../components/common/Badge.js';
import { PriceDisplay } from '../../../components/common/PriceDisplay.js';
import { useAppDispatch } from '../../../store/index.js';
import { addToast } from '../../../store/slices/uiSlice.js';

export const AdminVendorsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);

  // Vendor Form
  const [vendorName, setVendorName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [gstin, setGstin] = useState('');
  const [categorySpecialization, setCategorySpecialization] = useState('Pure Silk & Banarasi Weaves');

  // Purchase Order / Inward Form
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [inwardQuantity, setInwardQuantity] = useState<number | ''>('');
  const [unitCostPrice, setUnitCostPrice] = useState<number | ''>('');
  const [shippingCost, setShippingCost] = useState<number | ''>('');
  const [poNotes, setPoNotes] = useState('');

  const { data: vendorsData, isLoading: isVendorsLoading } = useGetVendorsQuery();
  const { data: productsData } = useGetAdminProductsQuery({ page: 1, limit: 100 });
  const [createVendor, { isLoading: isCreatingVendor }] = useCreateVendorMutation();
  const [createPurchaseOrder, { isLoading: isCreatingPO }] = useCreatePurchaseOrderMutation();

  const allVariants = productsData?.data?.flatMap((p) =>
    (p.variants || []).map((v) => ({
      ...v,
      productName: p.name,
      articleCode: p.articleCode,
    }))
  ) || [];

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim() || !contactPerson.trim() || !phone.trim()) {
      dispatch(addToast({ message: 'Please fill in mandatory vendor details', type: 'error' }));
      return;
    }

    try {
      await createVendor({
        name: vendorName.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        city: city.trim() || undefined,
        gstin: gstin.trim() || undefined,
        categorySpecialization: categorySpecialization.trim(),
      }).unwrap();

      dispatch(addToast({ message: 'Vendor added to master directory', type: 'success' }));
      setIsVendorModalOpen(false);
      setVendorName('');
      setContactPerson('');
      setPhone('');
      setEmail('');
      setCity('');
      setGstin('');
    } catch (err: any) {
      dispatch(addToast({ message: err?.data?.message || 'Failed to add vendor', type: 'error' }));
    }
  };

  const handlePOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorId || !selectedVariantId || !inwardQuantity || !unitCostPrice) {
      dispatch(addToast({ message: 'Please complete all purchase inward fields', type: 'error' }));
      return;
    }

    const selectedVariant = allVariants.find((v) => v._id === selectedVariantId);
    if (!selectedVariant) return;

    try {
      await createPurchaseOrder({
        vendorId: selectedVendorId,
        items: [
          {
            variantId: selectedVariantId,
            sku: selectedVariant.sku,
            productName: selectedVariant.productName,
            color: selectedVariant.color.name,
            size: selectedVariant.size,
            quantity: Number(inwardQuantity),
            unitCostPrice: Number(unitCostPrice),
          },
        ],
        shippingCost: shippingCost ? Number(shippingCost) : 0,
        notes: poNotes.trim() || undefined,
      }).unwrap();

      dispatch(addToast({ message: 'Stock inward recorded & inventory auto-updated!', type: 'success' }));
      setIsPOModalOpen(false);
      setSelectedVendorId('');
      setSelectedVariantId('');
      setInwardQuantity('');
      setUnitCostPrice('');
      setShippingCost('');
      setPoNotes('');
    } catch (err: any) {
      dispatch(addToast({ message: err?.data?.message || 'Failed to inward stock', type: 'error' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Artisans, Weavers & Vendors</h1>
          <p className="text-sm text-gray-600">Manage textile supplier partnerships, raw inventory inward, and procurement orders</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsVendorModalOpen(true)}
            className="flex items-center gap-2"
          >
            Add Artisan / Vendor
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsPOModalOpen(true)}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Inward Stock (PO)
          </Button>
        </div>
      </div>

      {/* Vendors Directory */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-gray-900">Approved Textile Suppliers & Craft Clusters</h2>
          <span className="text-xs text-gray-500">{vendorsData?.data?.length || 0} Registered Partners</span>
        </div>

        {isVendorsLoading ? (
          <div className="p-12 text-center text-gray-400">Loading vendor directory...</div>
        ) : !vendorsData?.data || vendorsData.data.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No vendors registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Vendor / Firm Name</th>
                  <th className="px-6 py-3">Contact Person</th>
                  <th className="px-6 py-3">Phone & Email</th>
                  <th className="px-6 py-3">City / Cluster</th>
                  <th className="px-6 py-3">Craft Specialization</th>
                  <th className="px-6 py-3">GSTIN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {vendorsData.data.map((vendor: any) => (
                  <tr key={vendor._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {vendor.name}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {vendor.contactPerson}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div>{vendor.phone}</div>
                      <div className="text-gray-400">{vendor.email || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-700">
                      {vendor.city || 'India'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="gold">{vendor.categorySpecialization || 'Traditional Weaves'}</Badge>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500">
                      {vendor.gstin || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Vendor Modal */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif text-xl font-bold text-gray-900">Register New Supplier / Weaver</h3>
              <button
                onClick={() => setIsVendorModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleVendorSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Firm / Weaver Guild Name
                </label>
                <input
                  type="text"
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
                  placeholder="e.g. Varanasi Silk Craft Guild"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
                    placeholder="e.g. Master Weaver Ramesh"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold font-mono"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
                    placeholder="vendor@guild.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    City / Cluster Hub
                  </label>
                  <input
                    type="text"
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
                    placeholder="e.g. Varanasi, Surat, Jaipur"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Craft Specialization
                  </label>
                  <input
                    type="text"
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
                    placeholder="e.g. Zardozi, Banarasi, Bandhani"
                    value={categorySpecialization}
                    onChange={(e) => setCategorySpecialization(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    GSTIN Number
                  </label>
                  <input
                    type="text"
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold font-mono uppercase"
                    placeholder="09AAAAA0000A1Z5"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsVendorModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isCreatingVendor}
                >
                  Save Vendor
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Inward (PO) Modal */}
      {isPOModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif text-xl font-bold text-gray-900">Inward Purchase Order Stock</h3>
              <button
                onClick={() => setIsPOModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePOSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Select Supplier
                </label>
                <select
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Artisan / Supplier --</option>
                  {vendorsData?.data?.map((v: any) => (
                    <option key={v._id} value={v._id}>
                      {v.name} ({v.city || 'India'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Target Product Variant / SKU
                </label>
                <select
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
                  value={selectedVariantId}
                  onChange={(e) => {
                    setSelectedVariantId(e.target.value);
                    const v = allVariants.find((varItem) => varItem._id === e.target.value);
                    if (v && v.costPrice) {
                      setUnitCostPrice(v.costPrice);
                    }
                  }}
                  required
                >
                  <option value="">-- Choose Target SKU --</option>
                  {allVariants.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.sku} | {v.productName} ({v.color.name}, Size: {v.size}) - Current Stock: {v.stockQuantity}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Inward Quantity (pcs)
                  </label>
                  <input
                    type="number"
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold font-mono"
                    placeholder="e.g. 20"
                    value={inwardQuantity}
                    onChange={(e) => setInwardQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Unit Cost Price (INR)
                  </label>
                  <input
                    type="number"
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold font-mono"
                    placeholder="e.g. 4500"
                    value={unitCostPrice}
                    onChange={(e) => setUnitCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Freight / Transit Cost (Optional)
                </label>
                <input
                  type="number"
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold font-mono"
                  placeholder="e.g. 500"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  PO Inward Remarks
                </label>
                <textarea
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
                  rows={2}
                  placeholder="e.g. Festive Diwali Season Artisan Inward Batch"
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                />
              </div>

              {inwardQuantity && unitCostPrice && (
                <div className="bg-gray-50 p-3 rounded-lg flex justify-between text-xs">
                  <span className="font-semibold text-gray-700">Total Inward Value:</span>
                  <span className="font-bold text-luxury-gold">
                    <PriceDisplay amount={Number(inwardQuantity) * Number(unitCostPrice) + (Number(shippingCost) || 0)} />
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPOModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isCreatingPO}
                >
                  Commit Inward Stock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
