// TiersPanel.jsx — list of reward tiers + inline form for the campaign creator.
//
// Donor view:
//   - List of tier cards. Sold-out tiers are dimmed and unclickable.
//   - Clicking a tier opens the donate modal pre-set to that tier.
//
// Creator view:
//   - Same list, plus an "Add reward tier" toggle that reveals a form.
//   - Tiers with no claims yet can be deleted (×). Tiers with backers can't.

import { useEffect, useState } from 'react';
import { listTiers, createTier, deleteTier } from '../../api/tierApi.js';
import { useToast } from '../../hooks/useToast.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import Button from '../common/Button.jsx';

export default function TiersPanel({ campaignId, isCreator, onSelect }) {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const toast = useToast();

  const refresh = async () => {
    try {
      const { data } = await listTiers(campaignId);
      setTiers(data.items);
    } catch (err) {
      console.error('[tiers] failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [campaignId]);

  const onCreated = (tier) => {
    setTiers((prev) => [...prev, tier].sort((a, b) => a.minAmount - b.minAmount));
    setShowForm(false);
    toast.success(`Tier "${tier.title}" added`);
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this tier?')) return;
    try {
      await deleteTier(id);
      setTiers((prev) => prev.filter((t) => t._id !== id));
      toast.success('Tier deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete tier');
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Reward tiers</h2>

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : tiers.length === 0 ? (
        <p className="text-sm text-gray-500 mb-3">
          {isCreator
            ? 'No tiers yet — add one to give backers something to choose.'
            : 'This campaign accepts donations without specific reward tiers.'}
        </p>
      ) : (
        <ul className="space-y-2 mb-3">
          {tiers.map((t) => (
            <TierCard
              key={t._id}
              tier={t}
              isCreator={isCreator}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}

      {isCreator && (
        <>
          {showForm ? (
            <NewTierForm
              campaignId={campaignId}
              onCreated={onCreated}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full text-sm text-emerald-600 hover:text-emerald-800 border border-dashed border-emerald-300 rounded-lg py-2"
            >
              + Add reward tier
            </button>
          )}
        </>
      )}
    </div>
  );
}

function TierCard({ tier, isCreator, onSelect, onDelete }) {
  const soldOut = tier.limit !== null && tier.claimed >= tier.limit;
  const limitedRemaining = tier.limit !== null ? tier.limit - tier.claimed : null;

  return (
    <li
      onClick={() => !soldOut && onSelect?.(tier)}
      className={`border rounded-lg p-3 transition relative group ${
        soldOut
          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
          : 'border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer'
      }`}
    >
      <div className="flex justify-between items-baseline gap-2">
        <span className="font-semibold text-sm truncate">{tier.title}</span>
        <span className="text-emerald-600 font-medium text-sm whitespace-nowrap">
          {formatCurrency(tier.minAmount)}+
        </span>
      </div>
      <p className="text-xs text-gray-600 mt-1">{tier.description}</p>

      <p className="text-xs text-gray-500 mt-2">
        {soldOut
          ? 'SOLD OUT'
          : tier.limit === null
            ? `${tier.claimed} claimed`
            : `${tier.claimed} of ${tier.limit} claimed · ${limitedRemaining} left`}
      </p>

      {isCreator && tier.claimed === 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(tier._id); }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs"
          title="Delete tier"
        >
          ×
        </button>
      )}
    </li>
  );
}

function NewTierForm({ campaignId, onCreated, onCancel }) {
  const [form, setForm] = useState({
    title: '', description: '', minAmount: '', limit: '', estimatedDelivery: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await createTier(campaignId, {
        ...form,
        limit: form.limit === '' ? null : Number(form.limit),
      });
      onCreated(data.tier);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create tier');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="border border-emerald-200 bg-emerald-50/50 rounded-lg p-3 space-y-2">
      <input
        name="title" placeholder="Tier title (e.g. Early Backer)"
        value={form.title} onChange={onChange} required maxLength={60}
        className="w-full text-sm border border-gray-300 rounded px-2 py-1"
      />
      <textarea
        name="description" placeholder="What does this tier include?"
        value={form.description} onChange={onChange} required rows={2}
        className="w-full text-sm border border-gray-300 rounded px-2 py-1"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          name="minAmount" type="number" min={1} placeholder="Min ₹"
          value={form.minAmount} onChange={onChange} required
          className="w-full text-sm border border-gray-300 rounded px-2 py-1"
        />
        <input
          name="limit" type="number" min={1} placeholder="Limit (blank = ∞)"
          value={form.limit} onChange={onChange}
          className="w-full text-sm border border-gray-300 rounded px-2 py-1"
        />
      </div>
      <input
        name="estimatedDelivery" type="date" placeholder="Est. delivery"
        value={form.estimatedDelivery} onChange={onChange}
        className="w-full text-sm border border-gray-300 rounded px-2 py-1"
      />

      {error && <p className="text-red-600 text-xs">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting} className="flex-1 !py-1 !text-sm">
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="flex-1 !py-1 !text-sm">
          {submitting ? 'Adding...' : 'Add tier'}
        </Button>
      </div>
    </form>
  );
}
