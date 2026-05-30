// ShareRow.jsx — quick share buttons for a campaign.
//
// Three actions: WhatsApp deep link, Twitter intent, copy link to clipboard.
// Each uses a native URL pattern — no SDKs needed.

import { useToast } from '../../hooks/useToast.js';

export default function ShareRow({ campaign }) {
  const toast = useToast();
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/campaigns/${campaign._id}`
    : '';
  const text = `Back "${campaign.title}" on Daana`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Could not copy link');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-gray-500 mr-1 uppercase tracking-widest">Share</span>

      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`}
        target="_blank" rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-gray-700 bg-white border border-gray-200 hover:border-emerald-400 hover:text-emerald-700 rounded-full px-3 py-1.5 transition-colors"
      >
        <IconWhatsApp /> WhatsApp
      </a>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
        target="_blank" rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-gray-700 bg-white border border-gray-200 hover:border-emerald-400 hover:text-emerald-700 rounded-full px-3 py-1.5 transition-colors"
      >
        <IconTwitter /> Twitter
      </a>

      <button
        onClick={onCopy}
        className="inline-flex items-center gap-1.5 text-sm text-gray-700 bg-white border border-gray-200 hover:border-emerald-400 hover:text-emerald-700 rounded-full px-3 py-1.5 transition-colors"
      >
        <IconLink /> Copy link
      </button>
    </div>
  );
}

function IconWhatsApp() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.7-.9-2.9-1.6-4-3.5-.3-.5.3-.5.8-1.6.1-.2 0-.3 0-.5s-.7-1.6-.9-2.2c-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.4 1.9.8 2.6.8 3.5.7.6-.1 1.7-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.4zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 4.9L2 22l5.3-1.4c1.4.7 2.9 1.1 4.7 1.1 5.5 0 10-4.5 10-10S17.5 2 12 2z"/>
    </svg>
  );
}
function IconTwitter() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2H21.5l-7.39 8.42L22.5 22h-6.84l-5.36-7.01L4.16 22H.9l7.91-9.04L1.5 2h7.01l4.84 6.4L18.244 2zm-1.2 18h1.86L7.04 4H5.06l11.984 16z"/>
    </svg>
  );
}
function IconLink() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/>
    </svg>
  );
}
