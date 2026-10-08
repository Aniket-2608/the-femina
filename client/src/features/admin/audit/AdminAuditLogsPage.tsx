import React, { useState } from 'react';
import { useGetAuditLogsQuery } from '../../../store/api/apiSlice.js';
import { Button } from '../../../components/common/Button.js';
import { Badge } from '../../../components/common/Badge.js';

export const AdminAuditLogsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const { data: logsData, isLoading } = useGetAuditLogsQuery({
    page,
    limit: 20,
  });

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('CREATE') || action.includes('INWARD')) return 'success';
    if (action.includes('UPDATE') || action.includes('ADJUST')) return 'gold';
    if (action.includes('DELETE') || action.includes('CANCEL')) return 'error';
    return 'neutral';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Security & Operational Audit Trail</h1>
        <p className="text-sm text-gray-600">Tamper-evident system activity ledger tracking every administrative action and state change</p>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-gray-900">Activity Stream</h2>
          <span className="text-xs text-gray-500">
            {logsData?.meta?.totalCount || logsData?.data?.length || 0} Total Logged Events
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Loading audit trail...</div>
        ) : !logsData?.data || logsData.data.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No audit logs recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Staff Operator</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Entity Type</th>
                  <th className="px-6 py-3">IP Address</th>
                  <th className="px-6 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {logsData.data.map((log: any) => (
                  <tr key={log._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {log.performedBy?.fullName || log.performedBy?.email || 'System / Auto'}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        Role: {log.performedBy?.role || 'SYSTEM'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-700">
                      {log.entityType} ({log.entityId?.slice(-6) || '—'})
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-xs text-luxury-gold hover:underline font-semibold"
                      >
                        View JSON
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {logsData?.meta && logsData.meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Page {page} of {logsData.meta.totalPages}
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
                disabled={page >= logsData.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* JSON Payload Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-gray-900">
                Audit Event: {selectedLog.action}
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-900 text-emerald-400 p-4 rounded-xl text-xs font-mono max-h-96 overflow-y-auto">
              <pre>{JSON.stringify(selectedLog, null, 2)}</pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLog(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
