// LayoutWizard.jsx — multi-step form with progress indicator.
//
// Four steps: Story → Details → Image → Review.
// Each step focuses on one thing. Disable Next until the current step is valid.
// On the last step, swap Next → Publish.

import { useState } from 'react';
import Button from '../../common/Button.jsx';
import { ArrowRight } from '../../common/icons.jsx';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { formatDate } from '../../../utils/formatDate.js';

const STEPS = [
  { key: 'story',   label: 'Story' },
  { key: 'goal',    label: 'Details' },
  { key: 'review',  label: 'Review' },
];

export default function LayoutWizard({
  form, file, previewUrl, onChange, onFileChange, onSubmit,
  loading, error, minDeadline, categories,
}) {
  const [step, setStep] = useState(0);

  const isValid = {
    story:  form.title.trim() && form.story.trim() && !!file,
    goal:   form.goalAmount && form.deadline && form.category,
    review: true,
  };
  const currentKey = STEPS[step].key;
  const canNext = isValid[currentKey];
  const isLast = step === STEPS.length - 1;

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="max-w-3xl mx-auto">
      {/* Stepper */}
      <ol className="flex items-center justify-between mb-10">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={s.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition
                  ${active ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                    : done   ? 'bg-emerald-100 text-emerald-700'
                    :          'bg-gray-100 text-gray-400'}`}
                >
                  {done ? '✓' : i + 1}
                </div>
                <span className={`text-xs mt-1.5 ${active ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-3 ${i < step ? 'bg-emerald-300' : 'bg-gray-200'}`} />
              )}
            </li>
          );
        })}
      </ol>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        {step === 0 && (
          <StepStory
            form={form} onChange={onChange}
            file={file} previewUrl={previewUrl} onFileChange={onFileChange}
          />
        )}
        {step === 1 && <StepGoal form={form} onChange={onChange} minDeadline={minDeadline} categories={categories} />}
        {step === 2 && <StepReview form={form} previewUrl={previewUrl} />}

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={back} disabled={step === 0}
            className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          {isLast ? (
            <Button onClick={onSubmit} disabled={loading || !canNext} className="!py-2.5 !px-6">
              {loading ? 'Publishing...' : 'Publish campaign'}
            </Button>
          ) : (
            <Button onClick={next} disabled={!canNext} className="!py-2.5 !px-6 inline-flex items-center gap-2">
              Next <ArrowRight size={14} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── steps ─────────────────────────────────────

function StepStory({ form, onChange, file, previewUrl, onFileChange }) {
  return (
    <div className="space-y-6">
      <Header title="Tell your story" sub="Start with the title, your story, and a cover image that captures it." />

      <Field label="Title">
        <input name="title" value={form.title} onChange={onChange} required maxLength={120}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="What are you raising for?" />
      </Field>

      <Field label="Your story">
        <textarea name="story" value={form.story} onChange={onChange} required rows={6}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Why does this matter? Why now? What will the money do?" />
      </Field>

      <Field label="Cover image">
        <label className="block border-2 border-dashed border-gray-300 hover:border-emerald-400 rounded-2xl p-6 text-center cursor-pointer transition-colors">
          <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
          {previewUrl ? (
            <div className="space-y-2">
              <img src={previewUrl} alt="preview" className="mx-auto max-h-48 rounded-lg" />
              <p className="text-xs text-emerald-700 font-medium">Click to replace</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="mx-auto w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">📷</div>
              <p className="text-sm text-gray-600"><span className="font-medium text-emerald-700">Click to upload</span> a cover image</p>
              <p className="text-xs text-gray-400">Max 5MB · JPG, PNG, WebP</p>
            </div>
          )}
        </label>
        {file && <p className="text-xs text-gray-500 mt-1.5 truncate">{file.name}</p>}
      </Field>
    </div>
  );
}

function StepGoal({ form, onChange, minDeadline, categories }) {
  return (
    <div className="space-y-5">
      <Header title="Set your goal" sub="How much, by when, and what kind of project this is." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Goal (₹)">
          <input name="goalAmount" type="number" min={1} value={form.goalAmount} onChange={onChange} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </Field>
        <Field label="Deadline">
          <input name="deadline" type="date" min={minDeadline} value={form.deadline} onChange={onChange} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </Field>
        <Field label="Category">
          <select name="category" value={form.category} onChange={onChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>
    </div>
  );
}

function StepReview({ form, previewUrl }) {
  return (
    <div className="space-y-5">
      <Header title="Review and publish" sub="One last look before your campaign goes live." />
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {previewUrl && <img src={previewUrl} alt="" className="w-full h-44 object-cover" />}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-gray-900">{form.title || 'Untitled campaign'}</h3>
          <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-wrap">{form.story}</p>
          <div className="flex flex-wrap gap-3 text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span>Goal: <strong className="text-gray-900">{form.goalAmount ? formatCurrency(form.goalAmount) : '·'}</strong></span>
            <span>Ends: <strong className="text-gray-900">{form.deadline ? formatDate(form.deadline) : '·'}</strong></span>
            <span>Category: <strong className="text-gray-900 capitalize">{form.category || '·'}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header({ title, sub }) {
  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <p className="text-sm text-gray-500 mt-1">{sub}</p>
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
