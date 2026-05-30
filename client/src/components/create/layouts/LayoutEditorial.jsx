// LayoutEditorial.jsx — magazine-style authoring experience.
//
// Narrow centered column, lots of breathing room. Inputs use underline-only
// styling (no boxes) — feels like writing in a real editor. Section numbers
// "01 — Title" etc. for editorial weight. Black submit button uppercase.

import Button from '../../common/Button.jsx';

export default function LayoutEditorial({
  form, file, previewUrl, onChange, onFileChange, onSubmit,
  loading, error, minDeadline, categories,
}) {
  return (
    <div className="max-w-2xl mx-auto px-2 py-4">
      <header className="mb-12">
        <div className="text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-3">A new campaign</div>
        <h1 className="font-serif text-4xl md:text-5xl text-gray-900 tracking-tight leading-tight">
          Tell us what to fund.
        </h1>
        <p className="mt-4 text-gray-500">
          Take your time. Stories that move people get backed.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-12">
        <Section number="01" label="Title">
          <input
            name="title" value={form.title} onChange={onChange}
            required maxLength={120}
            placeholder="What are you raising for?"
            className="w-full bg-transparent border-0 border-b border-gray-300 focus:border-gray-900 focus:outline-none focus:ring-0 px-0 py-2 text-2xl font-serif text-gray-900 placeholder-gray-300"
          />
        </Section>

        <Section number="02" label="Your story">
          <textarea
            name="story" value={form.story} onChange={onChange}
            required rows={8}
            placeholder="Start writing here. The first paragraph matters most. Make it land."
            className="w-full bg-transparent border-0 border-b border-gray-300 focus:border-gray-900 focus:outline-none focus:ring-0 px-0 py-2 text-base text-gray-800 leading-relaxed placeholder-gray-300 resize-none"
          />
        </Section>

        <Section number="03" label="Goal and deadline">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <UnderlineInput label="Amount (₹)" name="goalAmount" type="number" min={1} value={form.goalAmount} onChange={onChange} required />
            <UnderlineInput label="Deadline" name="deadline" type="date" min={minDeadline} value={form.deadline} onChange={onChange} required />
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Category</span>
              <select
                name="category" value={form.category} onChange={onChange}
                className="w-full bg-transparent border-0 border-b border-gray-300 focus:border-gray-900 focus:outline-none focus:ring-0 px-0 py-2 text-base text-gray-800 capitalize"
              >
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </Section>

        <Section number="04" label="Cover image">
          <label className="block border-2 border-dashed border-gray-300 hover:border-gray-900 rounded-2xl p-10 text-center cursor-pointer transition-colors">
            <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
            {previewUrl ? (
              <img src={previewUrl} alt="preview" className="mx-auto max-h-72 rounded-lg" />
            ) : (
              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-gray-400">+</div>
                <p className="text-sm text-gray-600">Click to add a cover image</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest">Max 5MB</p>
              </div>
            )}
          </label>
          {file && <p className="text-xs text-gray-500 text-center mt-2">{file.name}</p>}
        </Section>

        {error && (
          <p className="text-sm text-red-700 text-center">{error}</p>
        )}

        <div className="pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full !bg-gray-900 hover:!bg-gray-800 !py-4 !text-xs !uppercase !tracking-widest !shadow-none"
          >
            {loading ? 'Publishing...' : 'Publish campaign'}
          </Button>
          <p className="text-xs text-gray-400 text-center mt-3">
            Your story will be visible immediately after publishing.
          </p>
        </div>
      </form>
    </div>
  );
}

function Section({ number, label, children }) {
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-4">
        <span className="font-serif text-emerald-700 text-xl">{number}</span>
        <span className="text-[11px] uppercase tracking-[0.3em] text-gray-500">{label}</span>
      </div>
      {children}
    </section>
  );
}

function UnderlineInput({ label, ...props }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">{label}</span>
      <input
        {...props}
        className="w-full bg-transparent border-0 border-b border-gray-300 focus:border-gray-900 focus:outline-none focus:ring-0 px-0 py-2 text-base text-gray-800"
      />
    </label>
  );
}
