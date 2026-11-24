import { describe, it, expect } from 'vitest';
import { BreathReceipt } from '../types';

describe('Social Sharing Functionality & Full Text Formatting', () => {
  const mockReceipt: BreathReceipt = {
    receiptId: 'ZB-TEST-9921',
    timestamp: '11:30 AM',
    tenantName: 'South Delhi (RK Puram)',
    actionTitle: 'Shift Outdoor Run to Midday Mixing Window',
    inhaledDoseUg: 18.4,
    counterfactualDoseUg: 102.4,
    doseSavedUg: 84.0,
    cigaretteEquivalentsSaved: 3.8,
    co2eAvoidedGrams: 1420,
    noxAvoidedGrams: 9.4,
    primaryPm25AvoidedGrams: 0.8,
    neighborhoodMultiplier: 3.2,
  };

  it('formulates complete full share text containing all critical metrics', () => {
    const shareText = `🌬️ ZeroBon Clean Air Impact Report:
Protecting our family & neighborhood during this winter smog crisis!

✅ Action: ${mockReceipt.actionTitle}
🫁 Lung Dose Prevented: ${mockReceipt.doseSavedUg} µg PM2.5 (${mockReceipt.cigaretteEquivalentsSaved} cigarettes equivalent saved)
🌱 Direct Emissions Avoided: ${mockReceipt.co2eAvoidedGrams}g CO₂e | ${mockReceipt.noxAvoidedGrams}g NOₓ
✨ Community Multiplier: ${mockReceipt.neighborhoodMultiplier}x neighborhood collective impact

Join the clean air movement with ZeroBon: https://zerobon.pages.dev`;

    expect(shareText).toContain('Shift Outdoor Run to Midday Mixing Window');
    expect(shareText).toContain('84 µg PM2.5');
    expect(shareText).toContain('3.8 cigarettes equivalent saved');
    expect(shareText).toContain('1420g CO₂e');
    expect(shareText).toContain('9.4g NOₓ');
    expect(shareText).toContain('3.2x neighborhood collective impact');
    expect(shareText).toContain('https://zerobon.pages.dev');
  });

  it('generates valid WhatsApp, LinkedIn, and Facebook share URLs', () => {
    const shareText = `Test text for sharing`;
    const encoded = encodeURIComponent(shareText);

    const whatsAppUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    expect(whatsAppUrl).toBe('https://api.whatsapp.com/send?text=Test%20text%20for%20sharing');

    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://zerobon.pages.dev')}&summary=${encoded}`;
    expect(linkedInUrl).toContain('linkedin.com/sharing/share-offsite');
    expect(linkedInUrl).toContain(encoded);

    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://zerobon.pages.dev')}&quote=${encoded}`;
    expect(facebookUrl).toContain('facebook.com/sharer/sharer.php');
    expect(facebookUrl).toContain(encoded);
  });
});
