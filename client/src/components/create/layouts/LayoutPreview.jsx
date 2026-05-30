// LayoutPreview.jsx — form on the left, live CampaignCard preview on the right.
//
// As the user types, the right column updates in real time. They see exactly
// what their campaign card will look like in the Browse grid. Increases confidence
// before submitting.

import Button from '../../common/Button.jsx';
import CampaignCard from '../../campaign/CampaignCard.jsx';

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect fill="%23d1fae5" width="800" height="450"/><text x="50%" y="50%" font-family="serif" font-size="48" fill="%23065f46" text-anchor="middle" dominant-baseline="central">दान</text></svg>';

export default function LayoutPreview({
  form, file, previewUrl, onChange, onFileChange, onSubmit,
  loading, error, minDeadline, categories,
}) {
  // Build a mock campaign object so the real CampaignCard renders.
  const mockCampaign = {
    _id: 'preview',
    title: form.title || 'Your campaign title',
    coverImage: previewUrl || PLACEHOLDER_IMAGE,
    category: form.category || 'community',
    goalAmount: Number(form.goalAmount) || 10000,
    raisedAmount: 0,
    donorCount: 0,
    deadline: form.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      {/* ─── FORM column ─── */}
      <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Start a campaign</h1>
          <p className="mt-1 text-sm text-gray-500">See it appear on the right as you type.</p>
        </header>

        <form onSubmit={onSubmit} className="space-y-5">
          <Field label="Title">
            <input
              name="title" value={form.title} onChange={onChange} required maxLength={120}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="What are you raising for?"
            />
          </Field>

          <Field label="Your story">
            <textarea
              name="story" value={form.story} onChange={onChange} required rows={5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Why does this matter?"
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Goal (₹)">
              <input
                name="goalAmount" type="number" min={1} value={form.goalAmount} onChange={onChange} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </Field>
            <Field label="Deadline">
              <input
                name="deadline" type="date" min={minDeadline} value={form.deadline} onChange={onChange} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </Field>
            <Field label="Category">
              <select
                name="category" value={form.category} onChange={onChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Cover image (max 5MB)">
            <input
              type="file" accept="image/*" onChange={onFileChange}
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
          </Field>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full !py-3">
            {loading ? 'Publishing...' : 'Publish campaign'}
          </Button>
        </form>
      </div>

      {/* ─── PREVIEW column ─── */}
      <div className="lg:col-span-2 lg:sticky lg:top-24">
        <div className="text-xs uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live preview
        </div>
        <CampaignCard campaign={mockCampaign} />
        <p className="text-xs text-gray-400 mt-3 text-center">
          This is exactly how your campaign appears in the Browse grid.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
