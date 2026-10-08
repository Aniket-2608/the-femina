import React from 'react';
import { Link } from 'react-router-dom';
import { useGetDashboardMetricsQuery } from '../../../store/api/apiSlice.js';
import { Badge } from '../../../components/common/Badge.js';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  PackageCheck,
  AlertTriangle,
  Boxes,
  Users,
  ArrowUpRight,
  Sparkles,
  Receipt,
  Scale,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { data, isLoading } = useGetDashboardMetricsQuery();
  const metrics = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-femina-200/60 rounded-xl w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-36 bg-femina-200/60 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  const formatINR = (val: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-femina-200">
        <div>
          <span className="text-[11px] font-bold text-femina-700 tracking-[0.25em] uppercase">
            Executive Business Intelligence
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-dark mt-0.5">
            Dashboard & Real-Time Performance
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Live Sync
          </span>
        </div>
      </div>

      {/* 1. Primary Revenue & Sales Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today Sales */}
        <div className="bg-white rounded-3xl p-6 border border-femina-200 shadow-luxury flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Today's Sales</span>
            <div className="w-10 h-10 rounded-2xl bg-femina-100 text-luxury-wine flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-luxury-wine">{formatINR(metrics?.sales?.todaySales)}</div>
            <div className="text-xs text-gray-400 mt-1">
              {metrics?.sales?.todayOrdersCount || 0} orders placed today
            </div>
          </div>
        </div>

        {/* Monthly Sales */}
        <div className="bg-white rounded-3xl p-6 border border-femina-200 shadow-luxury flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Monthly Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-gold-100 text-gold-800 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gold-900">{formatINR(metrics?.sales?.monthlySales)}</div>
            <div className="text-xs text-gray-400 mt-1">Current Calendar Month</div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white rounded-3xl p-6 border border-femina-200 shadow-luxury flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Profit</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-emerald-800">
              {formatINR(metrics?.financialSummary?.netProfit)}
            </div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">
              Margin: {metrics?.financialSummary?.profitMargin || '0%'}
            </div>
          </div>
        </div>

        {/* Inventory Valuation */}
        <div className="bg-white rounded-3xl p-6 border border-femina-200 shadow-luxury flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventory Valuation</span>
            <div className="w-10 h-10 rounded-2xl bg-femina-100 text-luxury-wine flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-luxury-wine">
              {formatINR(metrics?.inventory?.valuationAtCost)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Retail: {formatINR(metrics?.inventory?.valuationAtRetail)}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Financial Breakdown & Accounting Strip */}
      <div className="bg-luxury-gradient text-white rounded-3xl p-6 sm:p-8 border border-gold-500/30 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-gold-400" />
            <h2 className="font-serif text-lg font-bold tracking-wider uppercase text-gold-shimmer">
              Real-Time Financial Statement
            </h2>
          </div>
          <Link
            to="/admin/accounting"
            className="text-xs font-semibold text-gold-300 hover:underline flex items-center gap-1"
          >
            <span>Detailed Ledger</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-xs">
          <div>
            <span className="text-gray-400 block mb-1">Gross Revenue</span>
            <span className="text-base font-bold text-white block">
              {formatINR(metrics?.financialSummary?.totalRevenue)}
            </span>
          </div>

          <div>
            <span className="text-gray-400 block mb-1">COGS (Product Cost)</span>
            <span className="text-base font-bold text-rose-300 block">
              - {formatINR(metrics?.financialSummary?.cogs)}
            </span>
          </div>

          <div>
            <span className="text-gray-400 block mb-1">Gross Margin</span>
            <span className="text-base font-bold text-gold-300 block">
              {formatINR(metrics?.financialSummary?.grossProfit)}
            </span>
          </div>

          <div>
            <span className="text-gray-400 block mb-1">Operating Expenses</span>
            <span className="text-base font-bold text-rose-300 block">
              - {formatINR(metrics?.financialSummary?.operatingExpenses)}
            </span>
          </div>

          <div>
            <span className="text-gray-400 block mb-1">Net Realized Profit</span>
            <span className="text-base font-bold text-emerald-400 block">
              {formatINR(metrics?.financialSummary?.netProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Low Stock Alerts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Low Stock Alerts */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-femina-200 shadow-luxury space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-femina-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="font-serif text-base font-bold text-luxury-dark uppercase tracking-wider">
                Low Stock Threshold ({metrics?.inventory?.lowStockCount || 0})
              </h3>
            </div>
            <Link to="/admin/inventory" className="text-xs font-semibold text-luxury-wine hover:underline">
              Manage All
            </Link>
          </div>

          {metrics?.inventory?.lowStockAlerts?.length > 0 ? (
            <div className="space-y-3">
              {metrics.inventory.lowStockAlerts.map((v: any) => (
                <div
                  key={v._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs"
                >
                  <div>
                    <h4 className="font-semibold text-luxury-dark">{v.productId?.name}</h4>
                    <div className="text-[11px] text-gray-500 font-mono">
                      {v.sku} • {v.color?.name} ({v.size})
                    </div>
                  </div>
                  <span className="font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                    {v.availableQuantity} Left
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-4 text-center">All inventory SKUs are healthily stocked.</p>
          )}
        </div>

        {/* Recent Orders Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-femina-200 shadow-luxury space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-femina-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-luxury-wine" />
              <h3 className="font-serif text-base font-bold text-luxury-dark uppercase tracking-wider">
                Recent Customer Orders
              </h3>
            </div>
            <Link to="/admin/orders" className="text-xs font-semibold text-luxury-wine hover:underline">
              View All Orders
            </Link>
          </div>

          {metrics?.recentOrders?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-femina-50 text-gray-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 rounded-l-xl">Order</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-femina-100">
                  {metrics.recentOrders.map((ord: any) => (
                    <tr key={ord._id} className="hover:bg-femina-50/50">
                      <td className="py-3 px-3 font-mono font-bold text-luxury-wine">{ord.orderNumber}</td>
                      <td className="py-3 px-3">{ord.customer?.fullName}</td>
                      <td className="py-3 px-3 font-bold">{formatINR(ord.pricing?.totalPayable)}</td>
                      <td className="py-3 px-3">
                        <Badge variant="wine" size="sm">
                          {ord.orderStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-4 text-center">No orders recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
