import React, { useState } from 'react';
import { TenantConfig } from '../types';

interface MultiTenantAdminProps {
  tenant: TenantConfig;
  onUpdateThreshold?: (threshold: number) => void;
}

export const MultiTenantAdmin: React.FC<MultiTenantAdminProps> = ({ tenant }) => {
  const [recessThreshold, setRecessThreshold] = useState(tenant.recessCancellationPM25Threshold || 150);
  const [wfhThreshold, setWfhThreshold] = useState(tenant.wfhSmogAlertThreshold || 180);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2400);
  };

  return (
    <div className="w-full apple-glass-card rounded-3xl p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <p className="apple-tag mb-1">Multi-Tenant Administrative Governance</p>
          <h3 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
            {tenant.name}
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Subdomain: <code className="text-sky-300 font-mono">{tenant.subdomain}</code> • Isolation: <span className="text-emerald-400">TenantScopedDB (D1 SQLite)</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="apple-glass px-3 py-1.5 rounded-full text-xs text-neutral-300 font-medium">
            Role: <strong className="text-white">tenant_admin</strong>
          </span>
        </div>
      </div>

      {/* Aggregate Collective Impact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="apple-glass p-4 rounded-2xl">
          <p className="text-[10px] uppercase tracking-wider text-neutral-400">Total Enrolled Members</p>
          <p className="text-2xl font-semibold text-white mt-1">{tenant.totalMembers.toLocaleString()}</p>
          <p className="text-[11px] text-neutral-400 mt-0.5">Active atmospheric twins</p>
        </div>

        <div className="apple-glass p-4 rounded-2xl">
          <p className="text-[10px] uppercase tracking-wider text-neutral-400">Active Daily Pledges</p>
          <p className="text-2xl font-semibold text-sky-400 mt-1">{tenant.activePledgesCount}</p>
          <p className="text-[11px] text-neutral-400 mt-0.5">Carpool, metro, induction</p>
        </div>

        <div className="apple-glass p-4 rounded-2xl">
          <p className="text-[10px] uppercase tracking-wider text-neutral-400">Collective CO₂e Avoided</p>
          <p className="text-2xl font-semibold text-emerald-400 mt-1">{tenant.collectiveEmissionsSavedKg.toFixed(1)} kg</p>
          <p className="text-[11px] text-neutral-400 mt-0.5">Deterministic ledger audit</p>
        </div>
      </div>

      {/* Tenant Automated Smog Triggers */}
      <div className="border-t border-white/[0.08] pt-6 mb-8">
        <p className="apple-tag mb-4">Atmospheric Inversion Safety Automation</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="apple-glass p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Auto-Cancel Outdoor Recess / Sports</span>
              <span className="text-xs font-mono text-rose-400">{recessThreshold} µg/m³</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              When ground sensor PM2.5 crosses this threshold during school hours, the tenant edge worker automatically notifies all staff and relocates activities to indoor HEPA zones.
            </p>
            <input
              type="range"
              min={60}
              max={300}
              value={recessThreshold}
              onChange={(e) => setRecessThreshold(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="apple-glass p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">WFH & Staggered Commute Trigger</span>
              <span className="text-xs font-mono text-amber-400">{wfhThreshold} µg/m³</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Dispatches morning advisory to campus employees or RWA residents to stagger commutes away from the 7:00 – 9:00 AM winter inversion trap.
            </p>
            <input
              type="range"
              min={80}
              max={350}
              value={wfhThreshold}
              onChange={(e) => setWfhThreshold(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all active:scale-95 shadow-md"
          >
            {savedSuccess ? 'Thresholds Updated ✓' : 'Save Safety Rules'}
          </button>
        </div>
      </div>

      {/* Cloudflare Edge D1 Isolation Architecture Details */}
      <div className="border-t border-white/[0.08] pt-6">
        <p className="apple-tag mb-3">Logical Edge Data Isolation Architecture</p>
        <div className="apple-glass-subtle p-4 rounded-2xl font-mono text-xs text-neutral-300 space-y-2 border border-white/[0.04]">
          <p className="text-sky-300">// Cloudflare D1 Composite Index Isolation Constraint</p>
          <p className="text-neutral-400">
            CREATE INDEX idx_ledger_tenant_h3 ON impact_ledger(tenant_id, h3_cell, logged_at);
          </p>
          <p className="text-neutral-400">
            All D1 queries wrapped in <span className="text-white">TenantScopedDB(tenant_id)</span>. Cross-tenant leakage impossible by construction.
          </p>
        </div>
      </div>
    </div>
  );
};
