import React, { useEffect, useState } from 'react';
import { BookOpen, Users, ArrowLeftRight, AlertTriangle, TrendingUp, BookMarked, Tag, DollarSign } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { dashboardAPI } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function StatCard({ icon: Icon, label, value, color, bg, change }) {
  return (
    <div className="stat-card" style={{ '--stat-color': color, '--stat-bg': bg }}>
      <div className="stat-icon"><Icon size={22} /></div>
      <div style={{ flex: 1 }}>
        <div className="stat-value">{value?.toLocaleString() ?? '—'}</div>
        <div className="stat-label">{label}</div>
        {change !== undefined && <div className={`stat-change ${change >= 0 ? 'up' : 'down'}`}>{change >= 0 ? '↑' : '↓'} {Math.abs(change)} this month</div>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 32, marginBottom: 12, animation: 'pulse 1.5s infinite' }}>📚</div>
        <div>Loading dashboard…</div>
      </div>
    </div>
  );

  const s = data?.stats;
  const monthlyLabels = (data?.monthlyBorrows || []).map(m => `${MONTHS[m.month - 1]} ${m.year}`);
  const monthlyCounts = (data?.monthlyBorrows || []).map(m => parseInt(m.count));

  const barData = {
    labels: monthlyLabels,
    datasets: [{
      label: 'Books Borrowed',
      data: monthlyCounts,
      backgroundColor: 'rgba(59,130,246,0.6)',
      borderColor: 'rgba(59,130,246,1)',
      borderWidth: 1,
      borderRadius: 6,
    }]
  };

  const catColors = ['#3b82f6','#8b5cf6','#f59e0b','#10b981','#f43f5e','#06b6d4','#84cc16','#ec4899'];
  const doughnutData = {
    labels: (data?.categoryStats || []).map(c => c.name),
    datasets: [{
      data: (data?.categoryStats || []).map(c => c.bookCount),
      backgroundColor: catColors,
      borderWidth: 0,
      hoverOffset: 6,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e2a3d', borderColor: '#243347', borderWidth: 1, titleColor: '#f1f5f9', bodyColor: '#94a3b8', padding: 10 } },
    scales: { x: { grid: { color: '#1e2d42' }, ticks: { color: '#475569' } }, y: { grid: { color: '#1e2d42' }, ticks: { color: '#475569' } } }
  };

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false, cutout: '68%',
    plugins: { legend: { position: 'right', labels: { color: '#94a3b8', padding: 12, font: { family: 'DM Sans', size: 12 } } }, tooltip: { backgroundColor: '#1e2a3d', borderColor: '#243347', borderWidth: 1, titleColor: '#f1f5f9', bodyColor: '#94a3b8' } }
  };

  return (
    <div style={{ padding: '28px 32px', animation: 'fadeIn 0.3s ease' }}>
      {/* Stats grid */}
      <div className="grid grid-4" style={{ gap: 16, marginBottom: 28 }}>
        <StatCard icon={BookOpen} label="Total Books" value={s?.totalBooks} color="#3b82f6" bg="rgba(59,130,246,0.12)" change={s?.newBooksThisMonth} />
        <StatCard icon={Users} label="Active Members" value={s?.totalMembers} color="#10b981" bg="rgba(16,185,129,0.12)" change={s?.newMembersThisMonth} />
        <StatCard icon={ArrowLeftRight} label="Active Borrows" value={s?.activeBorrows} color="#8b5cf6" bg="rgba(139,92,246,0.12)" />
        <StatCard icon={AlertTriangle} label="Overdue Books" value={s?.overdueCount} color="#f43f5e" bg="rgba(244,63,94,0.12)" />
      </div>

      <div className="grid grid-4" style={{ gap: 16, marginBottom: 28 }}>
        <StatCard icon={BookMarked} label="Available Copies" value={s?.availableBooks} color="#f59e0b" bg="rgba(245,158,11,0.12)" />
        <StatCard icon={Tag} label="Categories" value={s?.totalCategories} color="#06b6d4" bg="rgba(6,182,212,0.12)" />
        <StatCard icon={DollarSign} label="Total Fines (₹)" value={s?.totalFines} color="#ec4899" bg="rgba(236,72,153,0.12)" />
        <StatCard icon={TrendingUp} label="New Books/Month" value={s?.newBooksThisMonth} color="#84cc16" bg="rgba(132,204,22,0.12)" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginBottom: 28 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Monthly Borrows</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Last 6 months activity</p>
            </div>
          </div>
          <div style={{ height: 220 }}>
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Books by Category</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 16 }}>Distribution across categories</p>
          <div style={{ height: 220 }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Recent borrows + Top books */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Borrows */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Recent Active Borrows</h3>
          {data?.recentBorrows?.length === 0 && <div className="empty-state"><div className="empty-state-icon">📭</div><p>No active borrows</p></div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(data?.recentBorrows || []).map(b => {
              const isOverdue = new Date() > new Date(b.dueDate);
              return (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <div style={{ width: 36, height: 48, borderRadius: 4, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📖</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.book?.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.member?.name} · {b.member?.membershipId}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: isOverdue ? 'var(--rose)' : 'var(--text-muted)' }}>
                      {isOverdue ? '⚠ Overdue' : `Due ${format(new Date(b.dueDate), 'MMM d')}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Books */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Most Borrowed Books</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(data?.topBooks || []).map((book, i) => (
              <div key={book.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: i === 0 ? 'var(--gold-glow)' : 'var(--bg-elevated)', border: `1px solid ${i === 0 ? 'var(--gold)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: i === 0 ? 'var(--gold)' : 'var(--text-muted)', flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{book.author}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, flexShrink: 0 }}>{book.totalBorrows}×</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
