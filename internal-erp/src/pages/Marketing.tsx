import { useState, useEffect } from 'react';
import { CAMPAIGNS as MOCK_CAMPAIGNS, type Campaign, formatCurrency } from '../data/mockData';
import {
  fetchAllCampaigns,
  createCampaign,
  updateCampaignStatus,
  deleteCampaign,
} from '../services/marketingApi';

type CampaignItem = Campaign & { numericId?: number; tag?: string; desc?: string };

export default function Marketing() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiveDb, setIsLiveDb] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [discount, setDiscount] = useState('10');
  const [type, setType] = useState<Campaign['type']>('discount');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [status, setStatus] = useState<Campaign['status']>('active');

  const STATUS_COLOR: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    scheduled: 'bg-blue-100 text-blue-700',
    expired: 'bg-slate-100 text-slate-500',
  };

  const TYPE_COLOR: Record<string, string> = {
    discount: 'bg-amber-100 text-amber-700',
    seasonal: 'bg-purple-100 text-purple-700',
    clearance: 'bg-red-100 text-red-600',
    new_launch: 'bg-teal-100 text-teal-700',
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllCampaigns();
      if (data.length > 0) {
        setCampaigns(data);
        setIsLiveDb(true);
      } else {
        // Auto-seed
        for (const c of MOCK_CAMPAIGNS) {
          try {
            await createCampaign({
              campaignCode: c.id,
              name: c.name,
              type: c.type,
              discount: c.discount,
              startDate: c.startDate,
              endDate: c.endDate,
              status: c.status,
              ordersUsed: c.ordersUsed,
              revenue: c.revenue,
              tag: c.type,
              description: `${c.discount}% promotional campaign for ${c.name}`,
              eligibleProducts: 'Garment Collections',
            });
          } catch {
            // ignore seed errors
          }
        }
        const refreshed = await fetchAllCampaigns();
        setCampaigns(refreshed);
        setIsLiveDb(true);
      }
    } catch (err) {
      console.warn('Live API connection issue, falling back to mock data:', err);
      setCampaigns(MOCK_CAMPAIGNS);
      setIsLiveDb(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      if (!name || !discount) {
        setError('Please fill in campaign name and discount percentage.');
        setSubmitting(false);
        return;
      }

      await createCampaign({
        name,
        discount: Number(discount),
        type,
        startDate,
        endDate,
        status,
        ordersUsed: 0,
        revenue: 0,
        tag: type,
        description: `${discount}% off on selected collections`,
        eligibleProducts: 'All Apparel',
      });

      setShowModal(false);
      setName('');
      setDiscount('10');
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (c: CampaignItem, newStatus: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED') => {
    if (!c.numericId) return;
    try {
      await updateCampaignStatus(c.numericId, newStatus);
      await loadData();
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  const handleDelete = async (c: CampaignItem) => {
    if (!c.numericId) return;
    if (!window.confirm(`Delete campaign ${c.name}?`)) return;
    try {
      await deleteCampaign(c.numericId);
      await loadData();
    } catch (err) {
      console.error('Failed to delete campaign:', err);
    }
  };

  const activeCampaignsCount = campaigns.filter(c => c.status === 'active').length;
  const scheduledCampaignsCount = campaigns.filter(c => c.status === 'scheduled').length;
  const ordersWithPromo = campaigns.reduce((s, c) => s + (c.ordersUsed || 0), 0);
  const promoRevenue = campaigns.reduce((s, c) => s + (c.revenue || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#0f172a]">Marketing Management</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-[#64748b]">Promotions, campaigns and discount offers</p>
            {isLiveDb ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ● Live MySQL DB
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                ○ Local Cache
              </span>
            )}
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create Campaign
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Campaigns', value: activeCampaignsCount, color: 'text-green-600' },
          { label: 'Scheduled', value: scheduledCampaignsCount, color: 'text-blue-600' },
          { label: 'Orders with Promo', value: ordersWithPromo, color: 'text-amber-600' },
          { label: 'Promo Revenue', value: formatCurrency(promoRevenue), color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-5 border border-[#e2e8f0]">
            <div className="text-xs text-[#94a3b8] uppercase tracking-wider mb-2">{s.label}</div>
            <div className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-12 text-center text-slate-500">
          Loading campaigns from database...
        </div>
      ) : (
        /* Campaign cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-[#e2e8f0] p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="font-semibold text-[#0f172a]">{c.name}</h3>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLOR[c.type] ?? 'bg-slate-100 text-slate-600'}`}>{c.type.replace('_', ' ')}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[c.status]}`}>{c.status}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-display text-amber-600">{c.discount}%</div>
                  <div className="text-xs text-[#94a3b8]">discount</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div className="bg-[#f8fafc] rounded-lg p-2.5">
                  <div className="text-xs text-[#94a3b8]">Period</div>
                  <div className="text-xs font-medium text-[#334155] mt-0.5">{c.startDate} →</div>
                  <div className="text-xs font-medium text-[#334155]">{c.endDate}</div>
                </div>
                <div className="bg-[#f8fafc] rounded-lg p-2.5">
                  <div className="text-xs text-[#94a3b8]">Orders Used</div>
                  <div className="text-lg font-bold font-display text-[#0f172a] mt-0.5">{c.ordersUsed}</div>
                </div>
                <div className="bg-[#f8fafc] rounded-lg p-2.5">
                  <div className="text-xs text-[#94a3b8]">Revenue</div>
                  <div className="text-sm font-bold font-display text-[#0f172a] mt-0.5">{c.revenue > 0 ? formatCurrency(c.revenue) : '—'}</div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                {c.status === 'active' && (
                  <button
                    onClick={() => handleStatusChange(c, 'EXPIRED')}
                    className="px-3 py-1.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    Deactivate
                  </button>
                )}
                {c.status === 'scheduled' && (
                  <button
                    onClick={() => handleStatusChange(c, 'ACTIVE')}
                    className="px-3 py-1.5 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    Activate Now
                  </button>
                )}
                {c.status === 'expired' && (
                  <button
                    onClick={() => handleStatusChange(c, 'ACTIVE')}
                    className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Re-activate
                  </button>
                )}
                <button
                  onClick={() => handleDelete(c)}
                  className="px-3 py-1.5 text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold font-display text-[#0f172a]">Create Campaign</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f1f5f9] text-[#64748b]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {error && <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#64748b] mb-1.5 uppercase tracking-wide">Campaign Name *</label>
                <input required value={name} onChange={e => setName(e.target.value)} type="text" placeholder="e.g. Festive Season 2026" className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#64748b] mb-1.5 uppercase tracking-wide">Discount (%) *</label>
                  <input required min={0} max={100} value={discount} onChange={e => setDiscount(e.target.value)} type="number" placeholder="10" className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748b] mb-1.5 uppercase tracking-wide">Type</label>
                  <select value={type} onChange={e => setType(e.target.value as Campaign['type'])} className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                    <option value="discount">Discount</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="clearance">Clearance</option>
                    <option value="new_launch">New Launch</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#64748b] mb-1.5 uppercase tracking-wide">Start Date</label>
                  <input type="date" value={startDate} min={new Date().toISOString().split('T')[0]} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748b] mb-1.5 uppercase tracking-wide">End Date</label>
                  <input type="date" value={endDate} min={new Date().toISOString().split('T')[0]} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] mb-1.5 uppercase tracking-wide">Initial Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as Campaign['status'])} className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                  <option value="active">Active</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 text-sm font-semibold border border-[#e2e8f0] rounded-lg text-[#334155] hover:bg-[#f1f5f9] transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50">
                  {submitting ? 'Creating...' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
