// Dashboard.jsx — locked to the Insights layout.
//
// Loads /api/campaigns/mine and /api/donations/mine in parallel, then hands
// the data to LayoutInsights to render.
//
// (LayoutTabs and LayoutCommand still live under components/dashboard/layouts/
// if you ever want to swap. Just change the import below.)

import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { listMyCampaigns } from '../api/campaignApi.js';
import { listMyDonations } from '../api/donationApi.js';

import LayoutInsights from '../components/dashboard/layouts/LayoutInsights.jsx';
import Skeleton from '../components/common/Skeleton.jsx';

export default function Dashboard() {
  const user  = useSelector((s) => s.auth.user);
  const token = useSelector((s) => s.auth.token);

  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [campRes, donRes] = await Promise.all([listMyCampaigns(), listMyDonations()]);
        setCampaigns(campRes.data.items);
        setDonations(donRes.data.items);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (!token) return <Navigate to="/login" replace />;
  if (loading) return <DashboardSkeleton />;
  if (error) return <p className="text-red-600">{error}</p>;

  return <LayoutInsights user={user} campaigns={campaigns} donations={donations} />;
}

function DashboardSkeleton() {
  return (
    <section className="space-y-8">
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-full" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-3 w-64" />
        </div>
      </div>
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex gap-3 items-center">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
