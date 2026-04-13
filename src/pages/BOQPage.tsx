import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Plus, Package, Search, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';
import type { IProject, UserRole } from '@/lib/types';

const PRICE_VISIBLE_ROLES: UserRole[] = ['owner', 'sales', 'accounts', 'procurement_manager'];
const BOQ_EDIT_ROLES: UserRole[] = ['owner', 'project_manager', 'procurement_manager'];

interface BOQItem {
  id: string;
  project_id: string;
  phase_id: string | null;
  item_name: string;
  brand: string | null;
  model_number: string | null;
  quantity: number;
  unit: string;
  unit_price: number | null;
  total_price: number | null;
  notes: string | null;
  created_at: string;
}

const UNIT_OPTIONS = [
  { value: 'nos', label: 'Nos' },
  { value: 'meters', label: 'Meters' },
  { value: 'sqft', label: 'Sq. Ft.' },
  { value: 'set', label: 'Set' },
  { value: 'lot', label: 'Lot' },
  { value: 'kg', label: 'Kg' },
  { value: 'box', label: 'Box' },
];

export function BOQPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Pick<IProject, 'id' | 'name' | 'client_name' | 'status'>[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [items, setItems] = useState<BOQItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BOQItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '', brand: '', model_number: '',
    quantity: '1', unit: 'nos', unit_price: '', notes: '',
  });

  const canSeePrices = PRICE_VISIBLE_ROLES.includes(user?.role as UserRole);
  const canEdit = BOQ_EDIT_ROLES.includes(user?.role as UserRole);

  useEffect(() => { fetchProjects(); }, []);
  useEffect(() => {
    if (selectedProjectId) fetchBOQItems(selectedProjectId);
    else setItems([]);
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects').select('id, name, client_name, status').order('name');
      if (error) throw error;
      setProjects(data ?? []);
      if (data?.length) setSelectedProjectId(data[0].id);
    } catch (e) { console.error(e); }
  };

  const fetchBOQItems = async (projectId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('boq_items').select('*').eq('project_id', projectId).order('item_name');
      if (error) throw error;
      setItems(data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ item_name: '', brand: '', model_number: '', quantity: '1', unit: 'nos', unit_price: '', notes: '' });
    setShowAddModal(true);
  };

  const openEditModal = (item: BOQItem) => {
    setEditingItem(item);
    setFormData({
      item_name: item.item_name, brand: item.brand ?? '',
      model_number: item.model_number ?? '', quantity: String(item.quantity),
      unit: item.unit, unit_price: item.unit_price != null ? String(item.unit_price) : '',
      notes: item.notes ?? '',
    });
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!formData.item_name.trim() || !selectedProjectId) return;
    setSaving(true);
    try {
      const qty = parseFloat(formData.quantity) || 1;
      const unitPrice = formData.unit_price ? parseFloat(formData.unit_price) : null;
      const payload = {
        project_id: selectedProjectId,
        item_name: formData.item_name.trim(),
        brand: formData.brand.trim() || null,
        model_number: formData.model_number.trim() || null,
        quantity: qty, unit: formData.unit,
        unit_price: unitPrice,
        total_price: unitPrice != null ? qty * unitPrice : null,
        notes: formData.notes.trim() || null,
        created_by: user?.id,
      };
      if (editingItem) {
        const { error } = await supabase.from('boq_items').update(payload).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('boq_items').insert(payload);
        if (error) throw error;
      }
      await fetchBOQItems(selectedProjectId);
      setShowAddModal(false);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this item from the BOQ?')) return;
    await supabase.from('boq_items').delete().eq('id', id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const filteredItems = items.filter((i) =>
    !search ||
    i.item_name.toLowerCase().includes(search.toLowerCase()) ||
    (i.brand ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (i.model_number ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = canSeePrices
    ? filteredItems.reduce((sum, i) => sum + (i.total_price ?? 0), 0) : 0;

  const projectOptions = projects.map((p) => ({ value: p.id, label: `${p.name} — ${p.client_name}` }));
  const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? null;

  if (!user) return <Spinner size="lg" />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Bill of Quantities</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {canSeePrices ? 'Full view with pricing' : 'Materials and product reference view'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge status={canSeePrices ? 'completed' : 'pending'} label={canSeePrices ? 'Prices visible' : 'Prices hidden'} />
          {canSeePrices ? <Eye size={16} className="text-emerald-400" /> : <EyeOff size={16} className="text-[var(--color-text-secondary)]" />}
        </div>
      </div>

      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <Select label="Select Project" options={projectOptions} value={selectedProjectId} onChange={setSelectedProjectId} />
          </div>
          {selectedProject && <Badge status={selectedProject.status} label={selectedProject.status.replace('_', ' ')} />}
        </div>
      </Card>

      {selectedProjectId && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card padding="sm">
            <p className="text-2xl font-bold text-white">{filteredItems.length}</p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Total Items</p>
          </Card>
          <Card padding="sm">
            <p className="text-2xl font-bold text-white">{filteredItems.reduce((s, i) => s + i.quantity, 0).toLocaleString()}</p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Total Qty</p>
          </Card>
          {canSeePrices && <>
            <Card padding="sm">
              <p className="text-2xl font-bold text-emerald-400">₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Total Value</p>
            </Card>
            <Card padding="sm">
              <p className="text-2xl font-bold text-[var(--color-secondary)]">{filteredItems.filter((i) => i.unit_price != null).length}</p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Priced Items</p>
            </Card>
          </>}
        </div>
      )}

      {selectedProjectId && (
        <Card header={
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <span className="font-semibold text-[var(--color-text)]">Items</span>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 text-sm" />
              </div>
              {canEdit && <Button icon={<Plus size={14} />} onClick={openAddModal} size="sm">Add Item</Button>}
            </div>
          </div>
        } padding="md">
          {loading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : filteredItems.length === 0 ? (
            <EmptyState icon={Package} title="No BOQ items yet"
              subtitle={canEdit ? 'Add items to build the bill of quantities.' : 'No items have been added to this project yet.'} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-2 text-[var(--color-text)] font-semibold">#</th>
                    <th className="text-left py-3 px-2 text-[var(--color-text)] font-semibold">Item</th>
                    <th className="text-left py-3 px-2 text-[var(--color-text)] font-semibold">Brand</th>
                    <th className="text-left py-3 px-2 text-[var(--color-text)] font-semibold">Model</th>
                    <th className="text-right py-3 px-2 text-[var(--color-text)] font-semibold">Qty</th>
                    <th className="text-left py-3 px-2 text-[var(--color-text)] font-semibold">Unit</th>
                    {canSeePrices && <>
                      <th className="text-right py-3 px-2 text-[var(--color-text)] font-semibold">Unit Price</th>
                      <th className="text-right py-3 px-2 text-[var(--color-text)] font-semibold">Total</th>
                    </>}
                    {canEdit && <th className="py-3 px-2" />}
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, idx) => (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/4 transition-colors">
                      <td className="py-3 px-2 text-[var(--color-text-secondary)]">{idx + 1}</td>
                      <td className="py-3 px-2">
                        <p className="font-medium text-[var(--color-text)]">{item.item_name}</p>
                        {item.notes && <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{item.notes}</p>}
                      </td>
                      <td className="py-3 px-2 text-[var(--color-text-secondary)]">{item.brand ?? '—'}</td>
                      <td className="py-3 px-2 text-[var(--color-text-secondary)]">{item.model_number ?? '—'}</td>
                      <td className="py-3 px-2 text-right font-medium text-[var(--color-text)]">{item.quantity.toLocaleString()}</td>
                      <td className="py-3 px-2 text-[var(--color-text-secondary)]">{item.unit}</td>
                      {canSeePrices && <>
                        <td className="py-3 px-2 text-right text-[var(--color-text)]">
                          {item.unit_price != null ? `₹${item.unit_price.toLocaleString('en-IN')}` : <span className="text-[var(--color-text-secondary)]">—</span>}
                        </td>
                        <td className="py-3 px-2 text-right font-semibold text-emerald-400">
                          {item.total_price != null ? `₹${item.total_price.toLocaleString('en-IN')}` : <span className="text-[var(--color-text-secondary)] font-normal">—</span>}
                        </td>
                      </>}
                      {canEdit && (
                        <td className="py-3 px-2">
                          <div className="flex gap-1 justify-end">
                            <button onClick={() => openEditModal(item)} className="p-1.5 text-[var(--color-text-secondary)] hover:text-white hover:bg-white/8 rounded transition-colors"><Edit2 size={13} /></button>
                            <button onClick={() => handleDelete(item.id)} className="p-1.5 text-[var(--color-text-secondary)] hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {canSeePrices && filteredItems.length > 0 && (
                    <tr className="border-t border-white/15">
                      <td colSpan={canEdit ? 7 : 6} className="py-3 px-2 text-right font-semibold text-[var(--color-text)]">Grand Total</td>
                      <td className="py-3 px-2 text-right font-bold text-xl text-emerald-400">₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      {canEdit && <td />}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={editingItem ? 'Edit BOQ Item' : 'Add BOQ Item'} size="md">
        <div className="flex flex-col gap-4">
          <Input label="Item Name *" value={formData.item_name} onChange={(e) => setFormData({ ...formData, item_name: e.target.value })} placeholder='e.g. 85" 4K Display Panel' required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Brand" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} placeholder="Samsung, Sony..." />
            <Input label="Model No." value={formData.model_number} onChange={(e) => setFormData({ ...formData, model_number: e.target.value })} placeholder="QN85QN900C" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Quantity *" type="number" min="0.01" step="0.01" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required />
            <Select label="Unit" options={UNIT_OPTIONS} value={formData.unit} onChange={(v) => setFormData({ ...formData, unit: v })} />
          </div>
          {canSeePrices && (
            <Input label="Unit Price (₹)" type="number" min="0" step="0.01" value={formData.unit_price} onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })} placeholder="Leave blank if not yet priced" />
          )}
          <Input label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Specifications, installation notes..." />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button variant="primary" fullWidth onClick={handleSave} loading={saving} disabled={!formData.item_name.trim()}>{editingItem ? 'Save Changes' : 'Add Item'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
