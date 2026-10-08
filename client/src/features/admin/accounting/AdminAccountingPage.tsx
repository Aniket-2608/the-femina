import React, { useState } from 'react';
import {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useGetDashboardMetricsQuery,
} from '../../../store/api/apiSlice.js';
import { Button } from '../../../components/common/Button.js';
import { Badge } from '../../../components/common/Badge.js';
import { PriceDisplay } from '../../../components/common/PriceDisplay.js';
import { useAppDispatch } from '../../../store/index.js';
import { addToast } from '../../../store/slices/uiSlice.js';

export const AdminAccountingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isNewExpenseModalOpen, setIsNewExpenseModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('PACKAGING');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: metricsData } = useGetDashboardMetricsQuery();
  const { data: expensesData, isLoading } = useGetExpensesQuery({
    page,
    limit: 15,
    category: categoryFilter || undefined,
  });

  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) {
      dispatch(addToast({ message: 'Please enter valid expense title and amount', type: 'error' }));
      return;
    }

    try {
      await createExpense({
        title: title.trim(),
        category,
        amount: Number(amount),
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
        description: description.trim() || undefined,
        expenseDate,
      }).unwrap();

      dispatch(addToast({ message: 'Expense entry recorded successfully', type: 'success' }));
      setIsNewExpenseModalOpen(false);
      setTitle('');
      setAmount('');
      setReferenceNumber('');
      setDescription('');
    } catch (err: any) {
      dispatch(addToast({ message: err?.data?.message || 'Failed to record expense', type: 'error' }));
    }
  };

  const pl = metricsData?.data?.plStatement || {
    grossRevenue: 0,
    cogs: 0,
    grossProfit: 0,
    totalExpenses: 0,
    netProfit: 0,
    marginPercentage: 0,
  };

  const expenseCategories = [
    'SALARY',
    'RENT',
    'UTILITIES',
    'MARKETING',
    'PACKAGING',
    'LOGISTICS',
    'RAW_MATERIAL',
    'MAINTENANCE',
    'OTHER',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Accounting & Real-Time P&L</h1>
          <p className="text-sm text-gray-600">Enterprise operational expenditures, gross profit margins, and net EBITDA</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsNewExpenseModalOpen(true)}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Record Expense
        </Button>
      </div>

      {/* Real-time P&L Statement Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Gross Sales Revenue</span>
          <p className="text-2xl font-serif font-bold text-gray-900 mt-2">
            <PriceDisplay amount={pl.grossRevenue} />
          </p>
          <span className="text-[11px] text-gray-400">Total settled boutique receipts</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Cost of Goods (COGS)</span>
          <p className="text-2xl font-serif font-bold text-gray-700 mt-2">
            <PriceDisplay amount={pl.cogs} />
          </p>
          <span className="text-[11px] text-gray-400">Direct artisan production cost</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Operational OPEX</span>
          <p className="text-2xl font-serif font-bold text-rose-600 mt-2">
            <PriceDisplay amount={pl.totalExpenses} />
          </p>
          <span className="text-[11px] text-gray-400">Marketing, rent, salaries & packaging</span>
        </div>

        <div className="bg-luxury-maroon text-luxury-cream p-5 rounded-xl shadow-luxury border border-luxury-gold/30">
          <span className="text-xs font-semibold uppercase tracking-wider text-luxury-gold">Net Operating Profit</span>
          <p className="text-2xl font-serif font-bold mt-2">
            <PriceDisplay amount={pl.netProfit} />
          </p>
          <span className="text-[11px] text-luxury-cream/70">Margin: {pl.marginPercentage?.toFixed(1) || 0}%</span>
        </div>
      </div>

      {/* Filter & Expense Ledger */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-serif text-lg font-bold text-gray-900">Expense General Ledger</h2>
          <select
            className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Expense Categories</option>
            {expenseCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Loading ledger...</div>
        ) : !expensesData?.data?.expenses || expensesData.data.expenses.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No expenses recorded for this selection.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Expense Title</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Payment Method</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Ref / Invoice #</th>
                  <th className="px-6 py-3">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {expensesData.data.expenses.map((exp: any) => (
                  <tr key={exp._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {new Date(exp.expenseDate || exp.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{exp.title}</div>
                      {exp.description && (
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{exp.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="neutral">{exp.category}</Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600 font-mono">
                      {exp.paymentMethod}
                    </td>
                    <td className="px-6 py-4 font-semibold text-rose-600 font-mono">
                      <PriceDisplay amount={exp.amount} />
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                      {exp.referenceNumber || '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {exp.recordedBy?.fullName || 'System'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {expensesData?.meta && expensesData.meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Page {page} of {expensesData.meta.totalPages}
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
                disabled={page >= expensesData.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Record Expense Modal */}
      {isNewExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif text-xl font-bold text-gray-900">Record Operational Expense</h3>
              <button
                onClick={() => setIsNewExpenseModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Expense Title / Payee
                </label>
                <input
                  type="text"
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
                  placeholder="e.g. Custom Velvet Keepsake Box Batch #12"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {expenseCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Amount (INR)
                  </label>
                  <input
                    type="number"
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold font-mono"
                    placeholder="e.g. 15000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="BANK_TRANSFER">Bank NEFT / RTGS</option>
                    <option value="UPI">UPI / QR Transfer</option>
                    <option value="CREDIT_CARD">Corporate Card</option>
                    <option value="CASH">Petty Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Invoice / Reference #
                  </label>
                  <input
                    type="text"
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold font-mono"
                    placeholder="e.g. INV-2026-089"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Expense Date
                </label>
                <input
                  type="date"
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Remarks / Notes
                </label>
                <textarea
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
                  rows={2}
                  placeholder="Optional operational remarks"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewExpenseModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isCreating}
                >
                  Post Expense to Ledger
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
