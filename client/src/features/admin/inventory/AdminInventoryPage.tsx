import React, { useState } from 'react';
import {
  useGetInventoryLedgerQuery,
  useAdjustInventoryMutation,
  useGetAdminProductsQuery,
} from '../../../store/api/apiSlice.js';
import { Button } from '../../../components/common/Button.js';
import { Badge } from '../../../components/common/Badge.js';
import { useAppDispatch } from '../../../store/index.js';
import { addToast } from '../../../store/slices/uiSlice.js';

export const AdminInventoryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [delta, setDelta] = useState<number>(0);
  const [adjType, setAdjType] = useState('MANUAL_ADJUSTMENT');
  const [reason, setReason] = useState('');

  const { data: ledgerData, isLoading: isLedgerLoading } = useGetInventoryLedgerQuery({
    page,
    limit: 15,
  });

  const { data: productsData } = useGetAdminProductsQuery({ page: 1, limit: 100 });
  const [adjustInventory, { isLoading: isAdjusting }] = useAdjustInventoryMutation();

  // Flatten all variants from products for selection
  const allVariants = productsData?.data?.flatMap((p) =>
    (p.variants || []).map((v) => ({
      ...v,
      productName: p.name,
      articleCode: p.articleCode,
    }))
  ) || [];

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariantId) {
      dispatch(addToast({ message: 'Please select a variant/SKU', type: 'error' }));
      return;
    }
    if (delta === 0) {
      dispatch(addToast({ message: 'Adjustment quantity cannot be 0', type: 'error' }));
      return;
    }
    if (!reason.trim()) {
      dispatch(addToast({ message: 'Please specify an audit reason', type: 'error' }));
      return;
    }

    try {
      await adjustInventory({
        variantId: selectedVariantId,
        delta: Number(delta),
        type: adjType,
        reason: reason.trim(),
      }).unwrap();

      dispatch(addToast({ message: 'Inventory adjusted & logged successfully', type: 'success' }));
      setIsAdjustModalOpen(false);
      setSelectedVariantId('');
      setDelta(0);
      setReason('');
    } catch (err: any) {
      dispatch(addToast({ message: err?.data?.message || 'Failed to adjust stock', type: 'error' }));
    }
  };

  const getBadgeVariant = (type?: string) => {
    switch (type) {
      case 'PURCHASE_INWARD':
      case 'RETURN_RESTOCK':
        return 'success';
      case 'ORDER_RESERVED':
      case 'ORDER_FULFILLED':
      case 'ORDER_CANCELLED':
        return 'warning';
      case 'DAMAGED_WRITEOFF':
      case 'DAMAGE_WRITE_OFF':
      case 'THEFT_LOSS':
        return 'error';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Inventory Management & Ledger</h1>
          <p className="text-sm text-gray-600">Track stock movements, inward log, and audit-level balance adjustments</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsAdjustModalOpen(true)}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Audit Adjustment
        </Button>
      </div>

      {/* Stock Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tracked SKUs</span>
          <p className="text-2xl font-serif font-bold text-gray-900 mt-2">{allVariants.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Stock On Hand</span>
          <p className="text-2xl font-serif font-bold text-luxury-gold mt-2">
            {allVariants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0)} units
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Reserved in Checkout</span>
          <p className="text-2xl font-serif font-bold text-amber-600 mt-2">
            {allVariants.reduce((sum, v) => sum + (v.reservedQuantity || 0), 0)} units
          </p>
        </div>
      </div>

      {/* Audit Ledger Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-gray-900">Immutable Inventory Transaction Log</h2>
          <span className="text-xs text-gray-500">Append-only audit trail</span>
        </div>

        {isLedgerLoading ? (
          <div className="p-12 text-center text-gray-400">Loading audit ledger...</div>
        ) : !ledgerData?.data || ledgerData.data.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No inventory transactions logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">SKU / Article</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Change (Delta)</th>
                  <th className="px-6 py-3">Balance After</th>
                  <th className="px-6 py-3">Reference / Reason</th>
                  <th className="px-6 py-3">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {ledgerData.data.map((tx: any) => {
                  const txType = tx.type || tx.transactionType || 'MANUAL_ADJUSTMENT';
                  const deltaQty = tx.quantityDelta ?? tx.deltaQuantity ?? 0;
                  const balanceAfter = tx.newStock ?? tx.newQuantity ?? 0;
                  const operatorName = tx.performedBy?.firstName
                    ? `${tx.performedBy.firstName} ${tx.performedBy.lastName || ''}`.trim()
                    : tx.performedBy?.fullName || tx.performedBy?.email || 'System';

                  return (
                    <tr key={tx._id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {new Date(tx.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{tx.sku}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">
                          {tx.variantId?.productId?.name || tx.productId?.name || 'Luxury Ensemble'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getBadgeVariant(txType)}>
                          {String(txType).replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold">
                        <span className={deltaQty > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {deltaQty > 0 ? `+${deltaQty}` : deltaQty}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-gray-900">
                        {balanceAfter}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600 max-w-[220px]">
                        {tx.reason || tx.referenceOrder || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {operatorName}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {ledgerData?.meta && ledgerData.meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Page {page} of {ledgerData.meta.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= ledgerData.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Adjust Inventory Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif text-xl font-bold text-gray-900">Audit Stock Adjustment</h3>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Select Article & SKU
                </label>
                <select
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  required
                >
                  <option value="">-- Select SKU to adjust --</option>
                  {allVariants.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.sku} | {v.productName} ({v.color.name}, Size: {v.size}) - Stock: {v.stockQuantity}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Adjustment Type
                </label>
                <select
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
                  value={adjType}
                  onChange={(e) => setAdjType(e.target.value)}
                >
                  <option value="MANUAL_ADJUSTMENT">Physical Audit Count Adjustment</option>
                  <option value="DAMAGED_WRITEOFF">Damage / Defect Write-Off</option>
                  <option value="PURCHASE_INWARD">Manual Inward Stocking</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Quantity Change (+ to add, - to reduce)
                </label>
                <input
                  type="number"
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold font-mono"
                  placeholder="e.g. 5 or -2"
                  value={delta}
                  onChange={(e) => setDelta(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Audit Reason / Remark
                </label>
                <textarea
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
                  rows={3}
                  placeholder="e.g. Bi-monthly boutique stock audit reconciliation"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdjustModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isAdjusting}
                >
                  Commit Ledger Adjustment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
