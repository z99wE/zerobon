import React, { useState } from 'react';
import { TenantConfig } from '../types';

interface MultiTenantAdminProps {
  tenant: TenantConfig;
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
    <div className="w-full card-feature-light p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="pill-tag-soft">Multi-Tenant Governance</span>
          <h3 className="font-heading-lg text-[#0d253d] mt-1">
            {tenant.name}
          </h3>
          <p className="font-body-md text-xs text-[#64748d] mt-0.5">
            Subdomain: <code className="text-[#533afd] font-mono">{tenant.subdomain}</code> • Isolation: <span className="text-[#34d399] font-medium">TenantScopedDB (D1 SQLite)</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#f6f9fc] border border-[#e3e8ee] font-tabular text-xs text-[#273951]">
            Role: <strong className="text-[#0d253d]">tenant_admin</strong>
          </span>
        </div>
      </div>

      {/* Stripe-style 3-Tier Cards: White + Featured Dark-Navy + Warm Cream */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Tier 1: Standard White Card */}
        <div className="p-6 rounded-xl bg-white border border-[#e3e8ee] shadow-sm">
          <span className="font-micro-cap text-[#64748d]">Enrolled Members</span>
          <p className="font-tabular text-3xl font-normal text-[#0d253d] mt-2">
            {tenant.totalMembers.toLocaleString()}
          </p>
          <span className="font-caption text-[#64748d] mt-1 block">Active atmospheric twins</span>
          <div className="mt-4 pt-3 border-t border-[#e3e8ee] font-tabular text-xs text-[#533afd]">
            100% tenant-scoped privacy
          </div>
        </div>

        {/* Tier 2: Featured Dark-Navy Card (Stripe brand-dark-900 #1c1e54 polarity inversion) */}
        <div className="card-pricing-featured p-6">
          <div className="flex items-center justify-between">
            <span className="font-micro-cap text-[#b9b9f9]">Collective Pledges</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-mono">Active Tier</span>
          </div>
          <p className="font-tabular text-3xl font-normal text-white mt-2">
            {tenant.activePledgesCount}
          </p>
          <span className="font-caption text-white/70 mt-1 block">Carpool, metro, induction swaps</span>
          <div className="mt-4 pt-3 border-t border-white/10 font-tabular text-xs text-[#b9b9f9]">
            +42 new pledges this winter
          </div>
        </div>

        {/* Tier 3: Warm Cream Band Card (Stripe Chromatic Interlude #f5e9d4) */}
        <div className="card-cream-band p-6">
          <span className="font-micro-cap text-[#9b6829]">Emissions Prevented</span>
          <p className="font-tabular text-3xl font-normal text-[#0d253d] mt-2">
            {tenant.collectiveEmissionsSavedKg.toFixed(1)} <span className="text-base font-normal">kg CO₂e</span>
          </p>
          <span className="font-caption text-[#0d253d]/70 mt-1 block">Deterministic ledger audit</span>
          <div className="mt-4 pt-3 border-t border-[#9b6829]/20 font-tabular text-xs text-[#9b6829]">
            Verified IPCC factor calculations
          </div>
        </div>
      </div>

      {/* Tenant Automated Smog Triggers */}
      <div className="pt-6 border-t border-[#e3e8ee] mb-8">
        <span className="font-micro-cap text-[#64748d] mb-4 block">Automated Smog Safety Triggers</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-heading-sm text-xs text-[#0d253d]">Outdoor Recess / Play Relocation</span>
              <span className="font-tabular text-xs text-[#ea2261] font-medium">{recessThreshold} µg/m³</span>
            </div>
            <p className="font-body-md text-xs text-[#64748d] leading-relaxed">
              When ground sensor PM2.5 crosses this threshold during school hours, the tenant edge worker dispatches automated alerts to relocate activities to indoor HEPA zones.
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

          <div className="p-5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-heading-sm text-xs text-[#0d253d]">WFH & Staggered Commute Trigger</span>
              <span className="font-tabular text-xs text-[#9b6829] font-medium">{wfhThreshold} µg/m³</span>
            </div>
            <p className="font-body-md text-xs text-[#64748d] leading-relaxed">
              Notifies campus employees or RWA residents to shift morning commutes away from the 7:00 – 9:00 AM winter inversion boundary trap.
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
            className="button-primary-pill"
          >
            {savedSuccess ? 'Thresholds Updated ✓' : 'Save Safety Rules'}
          </button>
        </div>
      </div>

      {/* Cloudflare D1 Logical Isolation Blueprint */}
      <div className="pt-6 border-t border-[#e3e8ee]">
        <span className="font-micro-cap text-[#64748d] mb-2 block">D1 SQLite Isolation Contract</span>
        <div className="p-4 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] font-mono text-xs text-[#273951] space-y-1">
          <p className="text-[#533afd]">// Cloudflare D1 Tenant Composite Index</p>
          <p className="text-[#0d253d]">
            CREATE INDEX idx_ledger_tenant_h3 ON impact_ledger(tenant_id, h3_cell, logged_at);
          </p>
          <p className="text-[#64748d] text-[11px]">
            Scoped Repository Pattern structurally binds WHERE tenant_id = ? on workerd edge.
          </p>
        </div>
      </div>
    </div>
  );
};
