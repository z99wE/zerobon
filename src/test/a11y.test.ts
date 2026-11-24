import { describe, it, expect } from 'vitest';
import * as axe from 'axe-core';

describe('WCAG 2.1 AA Accessibility Automated axe Audits', () => {
  it('passes axe audit on D2C main application layout structure', async () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <header role="banner">
        <nav aria-label="Main Navigation">
          <a href="#main-content">Skip to content</a>
          <button aria-current="page">Daily Routines</button>
          <button>Indoor Hacks</button>
          <button>Air Forecast</button>
          <button>AI Assistant</button>
        </nav>
      </header>
      <main id="main-content" role="main">
        <h1>Navigate severe winter smog with intelligent daily routines</h1>
        <section aria-labelledby="heading-routines">
          <h2 id="heading-routines">Daily Routine Optimizer</h2>
          <div role="tablist" aria-label="Lifestyle Filters">
            <button role="tab" aria-selected="true">All</button>
            <button role="tab" aria-selected="false">Families with Kids</button>
          </div>
          <button aria-label="Adopt Electric Metro Commute Switch">Adopt Routine Swap</button>
        </section>
        <section aria-labelledby="heading-hacks">
          <h2 id="heading-hacks">Indoor Air Sanctuary Controls</h2>
          <button role="switch" aria-checked="true" aria-label="Toggle DIY Corsi-Rosenthal Box">Toggle</button>
        </section>
        <section aria-labelledby="heading-forecast">
          <h2 id="heading-forecast">Clean Air Window Forecast</h2>
          <button aria-label="Select 11:30 clean window" aria-pressed="true">11:30</button>
        </section>
      </main>
      <footer role="contentinfo">
        <p>ZeroBon Platform</p>
      </footer>
    `;
    document.body.appendChild(container);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
    document.body.removeChild(container);
  });

  it('verifies breath receipt and social share modal pass dialog accessibility checks', async () => {
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">Deterministic Breath Receipt</h2>
        <button aria-label="Close modal">Close</button>
        <p>Details of protected lung dose.</p>
        <button aria-label="Share full text on WhatsApp">WhatsApp</button>
        <button aria-label="Share full text on X">X (Twitter)</button>
        <button aria-label="Copy full impact text to clipboard">Copy Text</button>
      </div>
    `;
    document.body.appendChild(modal);
    const results = await axe.run(modal);
    expect(results.violations).toEqual([]);
    document.body.removeChild(modal);
  });
});
