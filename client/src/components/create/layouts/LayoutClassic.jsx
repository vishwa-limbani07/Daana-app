// LayoutClassic.jsx — single sectioned card.
//
// Refined version of the original — three labeled sections grouped clearly:
//   1. Tell your story (title, story)
//   2. Set your goal (amount, deadline, category)
//   3. Add visuals (cover image with inline preview)
//
// Speed-optimized. For users who know what they want.

import Button from '../../common/Button.jsx';

export default function LayoutClassic({
  form, file, previewUrl, onChange, onFileChange, onSubmit,
  loading, error, minDeadline, categories,
}) {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Start a campaign</h1>
        <p className="mt-1 text-gray-500 text-sm">Tell your story, set a goal, share it with the world.</p>
      </header>

      <form onSubmit={onSubmit} className="space-y-8">
        <Section label="Tell your story">
          <Field label="Title">
            <input
              name="title" value={form.title} onChange={onChange}
              required maxLength={120}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="What are you raising for?"
            />
          </Field>
          <Field label="Your story">
            <textarea
              name="story" value={form.story} onChange={onChange}
              required rows={5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Why does this matter? Why now? What will the money do?"
            />
          </Field>
        </Section>

        <Section label="Set your goal">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Goal (₹)">
              <input
                name="goalAmount" type="number" min={1}
                value={form.goalAmount} onChange={onChange} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </Field>
            <Field label="Deadline">
              <input
                name="deadline" type="date" min={minDeadline}
                value={form.deadline} onChange={onChange} required
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
        </Section>

        <Section label="Add visuals">
          <div className="space-y-3">
            <label className="block">
              <input
                type="file" accept="image/*" onChange={onFileChange}
                className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
            </label>
            <p className="text-xs text-gray-500">Max 5MB. JPG, PNG, WebP.</p>
            {previewUrl && (
              <img src={previewUrl} alt="preview" className="w-full max-h-64 object-cover rounded-lg border" />
            )}
          </div>
        </Section>

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
  );
}

function Section({ label, children }) {
  return (
    <section>
      <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-3">{label}</h2>
      <div className="space-y-4">{children}</div>
    </section>
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
