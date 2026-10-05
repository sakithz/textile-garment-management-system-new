import { useState, useEffect } from 'react';
import { type Material, MATERIALS } from '../data/mockData';
import {
  fetchAllInventory,
  createMaterial,
  adjustStock,
  deleteMaterial,
} from '../services/inventoryApi';

type MaterialItem = Material & { numericId?: number };

export default function Inventory() {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiveDb, setIsLiveDb] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    category: 'Fabric',
    currentStock: 1000,
    unit: 'meters',
    minStock: 200,
    supplier: '',
    unitCost: 5.0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllInventory();
      if (data.length > 0) {
        setMaterials(data);
        setIsLiveDb(true);
      } else {
        // If DB is completely empty, initialize from mockData so the user immediately sees working data
        for (const m of MATERIALS.slice(0, 5)) {
          try {
            await createMaterial({
              name: m.name,
              category: m.category,
              currentStock: m.currentStock,
              unit: m.unit,
              minStock: m.minStock,
              supplier: m.supplier,
              unitCost: m.unitCost,
              status: m.status,
            });
          } catch {
            // ignore seed collision
          }
        }
        const refreshed = await fetchAllInventory();
        setMaterials(refreshed);
        setIsLiveDb(true);
      }
    } catch (err: any) {
      console.warn('Live API connection issue, showing mock fallback:', err);
      setMaterials(MATERIALS);
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
      setIsSubmitting(true);
      setError(null);
      await createMaterial(form);
      setIsModalOpen(false);
      setForm({
        name: '',
        category: 'Fabric',
        currentStock: 1000,
        unit: 'meters',
        minStock: 200,
        supplier: '',
        unitCost: 5.0,
      });
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create material');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdjustStock = async (numericId: number | undefined, delta: number) => {
    if (!numericId) return;
    try {
      await adjustStock(numericId, delta);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update stock');
    }
  };

  const handleDelete = async (numericId: number | undefined) => {
    if (!numericId) return;
    if (!confirm('Are you sure you want to delete this material?')) return;
    try {
      await deleteMaterial(numericId);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete material');
    }
  };

  const categories = Array.from(new Set(materials.map(m => m.category)));

  const filtered = materials.filter(m => {
    const matchSearch = search === '' || m.name.toLowerCase().includes(search.toLowerCase()) || m.supplier.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || m.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const inStock = materials.filter(m => m.status === 'in_stock').length;
  const lowStock = materials.filter(m => m.status === 'low_stock').length;
  const outOfStock = materials.filter(m => m.status === 'out_of_stock').length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-[#0f172a]">Inventory Management</h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${isLiveDb ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isLiveDb ? 'bg-green-600 animate-pulse' : 'bg-amber-600'}`}></span>
              {isLiveDb ? 'Live MySQL Connected' : 'Fallback / Offline'}
            </span>
          </div>
          <p className="text-sm text-[#64748b] mt-0.5">Materials, fabrics and supplies</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadData} className="px-4 py-2 text-sm font-semibold border border-[#e2e8f0] rounded-lg text-[#334155] hover:bg-[#f1f5f9] transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Material
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Materials', value: materials.length, color: 'bg-blue-50 text-blue-600', filter: 'all' },
          { label: 'In Stock', value: inStock, color: 'bg-green-50 text-green-600', filter: 'in_stock' },
          { label: 'Low Stock', value: lowStock, color: 'bg-amber-50 text-amber-600', filter: 'low_stock' },
          { label: 'Out of Stock', value: outOfStock, color: 'bg-red-50 text-red-500', filter: 'out_of_stock' },
        ].map(s => (
          <button key={s.label} onClick={() => setStatusFilter(s.filter)} className={`bg-white rounded-xl p-5 border text-left transition-all hover:shadow-md ${statusFilter === s.filter ? 'border-blue-300 ring-2 ring-blue-100' : 'border-[#e2e8f0]'}`}>
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <div className="text-2xl font-bold font-display text-[#0f172a]">{s.value}</div>
            <div className="text-sm text-[#64748b] mt-0.5">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-52 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search material or supplier..." className="w-full pl-9 pr-4 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-[#f8fafc]" />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none bg-[#f8fafc] text-[#334155]">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none bg-[#f8fafc] text-[#334155]">
          <option value="all">All Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#64748b]">Loading inventory from local database...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-[#64748b]">No materials match your filter criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Material</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Category</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Current Stock</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Min. Required</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Supplier</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Unit Cost</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Updated</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} className="border-t border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors">
                    <td className="px-5 py-3.5 font-medium text-[#334155]">
                      <div>{m.name}</div>
                      <div className="text-xs text-[#94a3b8]">{m.id}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#f1f5f9] text-[#64748b]">{m.category}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-[#0f172a]">
                      {m.currentStock.toLocaleString()} <span className="text-[#94a3b8] font-normal text-xs">{m.unit}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-[#94a3b8]">
                      {m.minStock.toLocaleString()} <span className="text-xs">{m.unit}</span>
                    </td>
                    <td className="px-4 py-3.5 text-[#64748b]">{m.supplier}</td>
                    <td className="px-4 py-3.5 text-right text-[#334155]">LKR {m.unitCost}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${m.status === 'in_stock' ? 'bg-green-500' : m.status === 'low_stock' ? 'bg-amber-500' : 'bg-red-500'}`} />
                        <span className={`text-xs font-medium ${m.status === 'in_stock' ? 'text-green-700' : m.status === 'low_stock' ? 'text-amber-700' : 'text-red-700'}`}>
                          {m.status === 'in_stock' ? 'In Stock' : m.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[#94a3b8] text-xs">{m.lastUpdated}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAdjustStock(m.numericId, 100)}
                          title="Add 100 stock"
                          className="px-2 py-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors"
                        >
                          +100
                        </button>
                        <button
                          onClick={() => handleAdjustStock(m.numericId, -50)}
                          title="Reduce 50 stock"
                          className="px-2 py-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded hover:bg-amber-100 transition-colors"
                        >
                          -50
                        </button>
                        <button
                          onClick={() => handleDelete(m.numericId)}
                          title="Delete material"
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Material Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#e2e8f0]">
            <div className="flex items-center justify-between pb-4 border-b border-[#e2e8f0]">
              <h3 className="text-lg font-bold text-[#0f172a]">Add New Material</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#94a3b8] hover:text-[#0f172a]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {error && <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg">{error}</div>}
            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">Material Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Linen Blend Charcoal"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Fabric">Fabric</option>
                    <option value="Trims">Trims</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Thread">Thread</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Unit *</label>
                  <select
                    value={form.unit}
                    onChange={e => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="meters">meters</option>
                    <option value="kg">kg</option>
                    <option value="spools">spools</option>
                    <option value="pieces">pieces</option>
                    <option value="rolls">rolls</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Current Stock *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.currentStock}
                    onChange={e => setForm({ ...form, currentStock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Min. Required *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.minStock}
                    onChange={e => setForm({ ...form, minStock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Supplier *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Textiles"
                    value={form.supplier}
                    onChange={e => setForm({ ...form, supplier: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Unit Cost (LKR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={form.unitCost}
                    onChange={e => setForm({ ...form, unitCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-[#64748b] hover:bg-[#f1f5f9] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Add Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

