// Landing.jsx — editorial marketing page at /.
//
// Design direction:
//   - Same off-white canvas as the auth pages (stone-50)
//   - Serif headlines paired with a sans-serif body
//   - Mostly black/grey type with emerald reserved for primary CTA + accent
//   - Plenty of vertical breathing room — feels expensive, not crammed
//   - "01 / 02 / 03" serif numbers anchor sections — magazine convention
//
// Sections, top to bottom:
//   1. Hero (massive serif headline + dual CTA)
//   2. How it works (3 editorial numbered sections)
//   3. Featured campaigns (3-card grid, no chips/filters — discovery moves to /browse)
//   4. Trust + tech stack
//   5. Final CTA
//   6. Footer

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { listCampaigns } from '../api/campaignApi.js';
import CampaignCard from '../components/campaign/CampaignCard.jsx';
import HeroActivity from '../components/landing/HeroActivity.jsx';

export default function Landing() {
  const user = useSelector((s) => s.auth.user);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await listCampaigns({ limit: 3 });
        setFeatured(data.items);
      } catch { /* non-fatal */ }
    })();
  }, []);

  return (
    <div className="bg-stone-50">
      {/* ================ HERO ================ */}
      <section className="relative overflow-hidden px-6 pt-32 pb-24 md:pt-40 md:pb-32">
        {/* Subtle dot-grid background — gives texture without competing */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          }}
        />

        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left column — copy */}
          <div className="lg:col-span-7">
            <div
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-8"
              style={{ animation: 'riseIn 600ms cubic-bezier(0.16,1,0.3,1) 0ms backwards' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              दान · The art of giving
            </div>

            <h1
              className="font-serif text-5xl md:text-6xl xl:text-7xl text-gray-900 leading-[1.05] tracking-tight"
              style={{ animation: 'riseIn 700ms cubic-bezier(0.16,1,0.3,1) 100ms backwards' }}
            >
              Fund the ideas <br className="hidden md:block"/>that{' '}
              <span className="relative inline-block">
                matter
                <span
                  className="absolute left-0 -bottom-1 h-1 w-full bg-emerald-500/80 origin-left"
                  style={{ animation: 'drawUnderline 800ms cubic-bezier(0.16,1,0.3,1) 900ms backwards' }}
                />
              </span>
              .
            </h1>

            <p
              className="mt-8 text-lg md:text-xl text-gray-600 max-w-xl leading-relaxed"
              style={{ animation: 'riseIn 700ms cubic-bezier(0.16,1,0.3,1) 250ms backwards' }}
            >
              A crowdfunding platform built for India. Back projects you believe in,
              or launch your own in minutes. Secured end-to-end by Razorpay,
              updated live across every viewer.
            </p>

            <div
              className="mt-12 flex flex-wrap gap-3"
              style={{ animation: 'riseIn 700ms cubic-bezier(0.16,1,0.3,1) 400ms backwards' }}
            >
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 hover:bg-gray-800 transition-colors text-sm uppercase tracking-widest"
              >
                Browse campaigns →
              </Link>
              <Link
                to={user ? '/create' : '/signup'}
                className="inline-flex items-center gap-2 border border-gray-900 text-gray-900 px-6 py-3 hover:bg-gray-900 hover:text-white transition-colors text-sm uppercase tracking-widest"
              >
                Start a campaign
              </Link>
            </div>
          </div>

          {/* Right column — animated activity cards */}
          <div
            className="lg:col-span-5 hidden lg:block"
            style={{ animation: 'riseIn 800ms cubic-bezier(0.16,1,0.3,1) 350ms backwards' }}
          >
            <HeroActivity />
          </div>
        </div>
      </section>

      {/* ================ HOW IT WORKS ================ */}
      <section className="px-6 py-24 md:py-32 border-y border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-3">The Process</div>
          <h2 className="font-serif text-4xl md:text-5xl text-gray-900 tracking-tight">How Daana works.</h2>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            <Step
              n="01"
              title="Discover"
              text="Browse live campaigns across education, medical, tech, community and creative. Filter by category, search by name."
            />
            <Step
              n="02"
              title="Back"
              text="Pay via UPI, cards, netbanking, or wallets. Razorpay handles security; we verify every transaction with HMAC SHA256."
            />
            <Step
              n="03"
              title="Grow"
              text="See progress tick up live as donations arrive. Reward backers with tier perks. Manage everything from your dashboard."
            />
          </div>
        </div>
      </section>

      {/* ================ FEATURED CAMPAIGNS ================ */}
      {featured.length > 0 && (
        <section className="px-6 py-24 md:py-32">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-3">Currently raising</div>
                <h2 className="font-serif text-4xl md:text-5xl text-gray-900 tracking-tight">Live on Daana.</h2>
              </div>
              <Link
                to="/browse"
                className="text-sm uppercase tracking-widest text-gray-700 hover:text-emerald-700 transition-colors"
              >
                See all →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featured.map((c) => <CampaignCard key={c._id} campaign={c} />)}
            </div>
          </div>
        </section>
      )}

      {/* ================ TRUST / TECH ================ */}
      <section className="px-6 py-24 md:py-32 bg-white border-y border-gray-200">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-3">Engineered for trust</div>
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 tracking-tight">
            Production patterns, not tutorials.
          </h2>
          <p className="mt-6 text-gray-600 leading-relaxed">
            HMAC SHA256 signature verification on every payment. Idempotency keys to prevent double-charges.
            Atomic state transitions so the synchronous callback and webhook never double-count a donation.
            <span className="block mt-4 text-gray-500">
              Built with React, Node, Express, MongoDB, Razorpay, Socket.io, Cloudinary.
            </span>
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-6 text-xs uppercase tracking-widest text-gray-500">
            <span className="flex items-center gap-2">🔒 PCI-DSS via Razorpay</span>
            <span className="flex items-center gap-2">⚡ Real-time updates</span>
            <span className="flex items-center gap-2">🇮🇳 Built for India</span>
          </div>
        </div>
      </section>

      {/* ================ FINAL CTA ================ */}
      <section className="px-6 py-32 md:py-40">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-7xl md:text-8xl font-serif text-gray-900 leading-none mb-8">दान</div>
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 tracking-tight">
            Ready to give, or to raise?
          </h2>
          <p className="mt-4 text-gray-600">Both take less than a minute.</p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              to={user ? '/browse' : '/signup'}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 hover:bg-emerald-700 transition-colors text-sm uppercase tracking-widest shadow-sm shadow-emerald-200"
            >
              {user ? 'Browse campaigns' : 'Create an account'} →
            </Link>
            {!user && (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors text-sm uppercase tracking-widest"
              >
                I have an account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ================ FOOTER ================ */}
      <footer className="border-t border-gray-200 px-6 py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-serif text-base text-gray-900">दान</span>
            <span>· Daana</span>
          </div>
          <div className="flex items-center gap-6 uppercase tracking-widest">
            <Link to="/browse" className="hover:text-emerald-700 transition-colors">Browse</Link>
            <a
              href="https://github.com/vishwa-limbani07/Daana-app"
              target="_blank" rel="noreferrer"
              className="hover:text-emerald-700 transition-colors"
            >
              GitHub
            </a>
          </div>
          <div>Made with care in India.</div>
        </div>
      </footer>
    </div>
  );
}

function Step({ n, title, text }) {
  return (
    <div>
      <div className="font-serif text-5xl text-emerald-700 mb-4">{n}</div>
      <h3 className="font-serif text-2xl text-gray-900 mb-2">{title}.</h3>
      <p className="text-gray-600 leading-relaxed">{text}</p>
    </div>
  );
}
