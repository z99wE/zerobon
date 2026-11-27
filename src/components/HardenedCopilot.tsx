import React, { useState, useRef, useEffect } from 'react';
import { Send, User, CheckCircle2, Building2, Users, School, Home } from 'lucide-react';
import { executeHardenedCopilotPipeline } from '../engine/copilot-firewall';
import { CopilotResponse } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  response?: CopilotResponse;
  timestamp: string;
}

interface HardenedCopilotProps {
  indoorPm25: number;
  outdoorPm25: number;
  city?: string;
}

type TenantType = 'family' | 'commuter' | 'school' | 'community';

const TENANT_OPTIONS: { id: TenantType; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'family', label: 'Household Family', icon: Home, desc: 'Optimized for children, elderly & night air' },
  { id: 'commuter', label: 'Solo Commuter', icon: Users, desc: 'High-rise apartment & road transit routes' },
  { id: 'school', label: 'School Campus', icon: School, desc: 'Classroom ventilation, bus queues & recess' },
  { id: 'community', label: 'Residential RWA', icon: Building2, desc: 'Community DG gensets & neighborhood guidelines' },
];

export const HardenedCopilot: React.FC<HardenedCopilotProps> = ({ indoorPm25, outdoorPm25, city = 'Delhi NCR' }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantType>('family');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentTenantMeta = TENANT_OPTIONS.find((t) => t.id === selectedTenant) ?? TENANT_OPTIONS[0]!;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your ZeroBon Clean Air Assistant configured for ${city} (${currentTenantMeta.label} profile). Ask me anything about DIY air purifiers, boundary layer airing hours, school runs, or commute swaps.`,
      timestamp: 'Just now',
    },
  ]);

  // Auto-scroll messages smoothly into view whenever messages change or loading starts
  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const suggestionChips = selectedTenant === 'school'
    ? [
        `Should outdoor sports or recess be canceled in ${city} today?`,
        'Classroom CO2 vs PM2.5 airing protocol',
        'Managing bus queue diesel fumes at school gates',
      ]
    : selectedTenant === 'community'
    ? [
        `Guidelines for diesel generator testing in ${city}`,
        'Neighborhood waste burning deterrence policy',
        'Community Corsi-Rosenthal build workshop plan',
      ]
    : [
        `How should I commute safely in ${city} today?`,
        'Build a $35 DIY Corsi-Rosenthal air cleanser',
        'Is morning outdoor exercise safe with current inversion?',
        'What indoor cooking swaps prevent particle spikes?',
        `What are the clean air hours for ${city}?`,
      ];

  const handleSend = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await executeHardenedCopilotPipeline(userText, {
        city,
        indoorPm25,
        outdoorPm25,
        isMiddayWindow: outdoorPm25 < 100,
        tenantProfile: selectedTenant,
      });

      const responseText =
        res.response.routine_advice && res.response.routine_advice.length > 0
          ? res.response.routine_advice.join('\n\n')
          : `Atmospheric conditions verified for ${city}. Keep windows sealed during morning and evening inversions, and utilize the clean air window for cross-ventilation.`;

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        response: res.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Copilot evaluation error:', err);
      const fallbackMsg: Message = {
        id: `fb-${Date.now()}`,
        sender: 'assistant',
        text: `In ${city}, ambient air quality requires careful management. Keep living areas sealed during early morning cold inversions and ventilate during solar mixing hours (11:30 AM – 3:30 PM).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTenantChange = (t: TenantType) => {
    setSelectedTenant(t);
    const meta = TENANT_OPTIONS.find((opt) => opt.id === t);
    const systemNotice: Message = {
      id: `sys-${Date.now()}`,
      sender: 'assistant',
      text: `Tenant profile switched to "${meta?.label}". Guidance is now tailored to ${meta?.desc.toLowerCase()}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, systemNotice]);
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e8ee] shadow-sm space-y-6">
      {/* Header & Multi-Tenant Profile Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#e3e8ee]">
        <div>
          <h2 className="font-heading-lg text-2xl text-[#0d253d]">
            Clean Air Assistant
          </h2>
          <p className="font-body-md text-sm text-[#475569] mt-1">
            Personalized clean air advice for {city}, configured for your specific household or campus profile.
          </p>
        </div>

        {/* Multi-Tenant Profile Selector Chips */}
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Tenant Profile Options">
          {TENANT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedTenant === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                aria-label={`Switch assistant profile to ${opt.label}`}
                onClick={() => handleTenantChange(opt.id)}
                aria-pressed={isSelected}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#533afd] ${
                  isSelected
                    ? 'bg-[#533afd] text-white shadow-sm'
                    : 'bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#0d253d] border border-[#e3e8ee]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversational Message Stream */}
      <div 
        aria-live="polite"
        className="space-y-4 max-h-[460px] overflow-y-auto pr-1"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[#533afd] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm text-xs font-bold font-sans">
                ZB
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 sm:p-5 ${
                m.sender === 'user'
                  ? 'bg-[#533afd] text-white font-normal'
                  : 'bg-[#f6f9fc] text-[#0d253d] border border-[#e3e8ee]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`text-[10px] font-semibold ${m.sender === 'user' ? 'text-white/80' : 'text-[#475569]'}`}>
                  {m.sender === 'user' ? 'You' : 'ZeroBon Assistant'}
                </span>
                <span className={`text-[10px] ${m.sender === 'user' ? 'text-white/90' : 'text-[#475569]'}`}>
                  {m.timestamp}
                </span>
              </div>

              {m.response?.intent_valid === false && (
                <div className="p-3 mb-2 rounded-xl bg-white border border-[#e3e8ee] text-xs text-[#0d253d]">
                  <strong className="block mb-1">Notice:</strong>
                  <span>Your query was outside air quality and daily routine topics. Response was kept to safe atmospheric advice.</span>
                </div>
              )}

              <div className="text-sm leading-relaxed whitespace-pre-line space-y-2">
                {m.text}
              </div>

              {m.response?.safety_note && (
                <div className="mt-3 pt-2.5 border-t border-[#e3e8ee] flex items-center gap-1.5 text-xs text-[#475569]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#533afd]" />
                  <span>{m.response.safety_note}</span>
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-[#0d253d] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start animate-pulse">
            <div className="w-8 h-8 rounded-full bg-[#533afd] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold font-sans">
              ZB
            </div>
            <div className="p-4 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs text-[#475569]">
              Evaluating city boundary layer and local habit recommendations...
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {suggestionChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Ask suggested question: ${chip}`}
            onClick={() => handleSend(chip)}
            className="whitespace-nowrap px-3.5 py-1.5 rounded-full bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#0d253d] text-xs border border-[#e3e8ee] transition-all"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Query Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(query);
        }}
        className="flex gap-2"
      >
        <label htmlFor="copilot-query-field" className="sr-only">
          Ask ZeroBon Assistant any question about air quality, cities, or daily routines
        </label>
        <input
          id="copilot-query-field"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Ask about ${city}, DIY filters, commute routes, school recess, or any city...`}
          maxLength={400}
          className="flex-1 bg-white text-[#0d253d] px-4 py-3 rounded-2xl border border-[#e3e8ee] focus:border-[#533afd] focus:ring-2 focus:ring-[#533afd]/20 outline-none transition-all text-sm"
        />
        <button
          type="submit"
          aria-label="Send Query"
          disabled={isLoading || !query.trim()}
          className="px-5 py-3 rounded-2xl bg-[#533afd] hover:bg-[#432ec9] disabled:opacity-50 text-white font-medium text-sm flex items-center gap-1.5 transition-all shadow-sm focus:ring-2 focus:ring-[#533afd]"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
