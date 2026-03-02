/**
 * Knowledge Gap Detection Tests
 *
 * Tests gap signal detection and topic classification.
 * Run with: npm test -- knowledge-gap.test.ts
 */

import { describe, it, expect } from 'vitest';
import { detectGapSignals } from '../knowledge-gap';

describe('detectGapSignals', () => {
  const baseParams = {
    rawResponse: 'La clase cuesta 55€.',
    afterUrlSanitization: 'La clase cuesta 55€.',
    afterPriceValidation: 'La clase cuesta 55€.',
  };

  describe('no gaps', () => {
    it('should return empty array when no gaps detected', () => {
      const signals = detectGapSignals(baseParams);
      expect(signals).toEqual([]);
    });
  });

  describe('url_hallucination', () => {
    it('should detect URL hallucination when sanitizeUrls changed response', () => {
      const signals = detectGapSignals({
        rawResponse: 'Visita www.farrayscenter.com/fake-page',
        afterUrlSanitization: 'Visita www.farrayscenter.com',
        afterPriceValidation: 'Visita www.farrayscenter.com',
      });
      expect(signals).toContain('url_hallucination');
    });
  });

  describe('price_hallucination', () => {
    it('should detect price hallucination when validatePrices changed response', () => {
      const signals = detectGapSignals({
        rawResponse: 'La clase cuesta 999€.',
        afterUrlSanitization: 'La clase cuesta 999€.',
        afterPriceValidation: 'La clase cuesta consulta precios en farrayscenter.com.',
      });
      expect(signals).toContain('price_hallucination');
    });

    it('should NOT detect price hallucination when text is unchanged', () => {
      const signals = detectGapSignals({
        rawResponse: 'La clase cuesta 55€.',
        afterUrlSanitization: 'La clase cuesta 55€.',
        afterPriceValidation: 'La clase cuesta 55€.',
      });
      expect(signals).not.toContain('price_hallucination');
    });
  });

  describe('no_answer', () => {
    it('should detect "tendría que confirmarlo" (ES)', () => {
      const signals = detectGapSignals({
        ...baseParams,
        afterPriceValidation: 'Tendría que confirmarlo, contacta en info@farrayscenter.com.',
      });
      expect(signals).toContain('no_answer');
    });

    it('should detect "no tengo esa información" (ES)', () => {
      const signals = detectGapSignals({
        ...baseParams,
        afterPriceValidation: 'Lo siento, no tengo esa información disponible.',
      });
      expect(signals).toContain('no_answer');
    });

    it('should detect "i would need to confirm" (EN)', () => {
      const signals = detectGapSignals({
        ...baseParams,
        afterPriceValidation: 'I would need to confirm that information.',
      });
      expect(signals).toContain('no_answer');
    });

    it('should detect "je devrais confirmer" (FR)', () => {
      const signals = detectGapSignals({
        ...baseParams,
        afterPriceValidation: 'Je devrais confirmer cette information.',
      });
      expect(signals).toContain('no_answer');
    });
  });

  describe('uncertain_response', () => {
    it('should detect "creo que es" (ES)', () => {
      const signals = detectGapSignals({
        ...baseParams,
        afterPriceValidation: 'Creo que es los lunes a las 20h.',
      });
      expect(signals).toContain('uncertain_response');
    });

    it('should detect "probablemente" (ES)', () => {
      const signals = detectGapSignals({
        ...baseParams,
        afterPriceValidation: 'Probablemente hay clase los martes.',
      });
      expect(signals).toContain('uncertain_response');
    });

    it('should detect "i think it\'s" (EN)', () => {
      const signals = detectGapSignals({
        ...baseParams,
        afterPriceValidation: "I think it's on Monday at 8pm.",
      });
      expect(signals).toContain('uncertain_response');
    });

    it('should detect "je pense que" (FR)', () => {
      const signals = detectGapSignals({
        ...baseParams,
        afterPriceValidation: 'Je pense que le cours est le lundi.',
      });
      expect(signals).toContain('uncertain_response');
    });
  });

  describe('multiple signals', () => {
    it('should detect both URL and price hallucination', () => {
      const signals = detectGapSignals({
        rawResponse: 'Visita www.fake.com y cuesta 999€.',
        afterUrlSanitization: 'Visita www.farrayscenter.com y cuesta 999€.',
        afterPriceValidation: 'Visita www.farrayscenter.com y consulta precios.',
      });
      expect(signals).toContain('url_hallucination');
      expect(signals).toContain('price_hallucination');
      expect(signals).toHaveLength(2);
    });

    it('should detect no_answer AND uncertain_response when both present', () => {
      const signals = detectGapSignals({
        ...baseParams,
        afterPriceValidation: 'Creo que es a las 20h, pero tendría que confirmarlo con el centro.',
      });
      expect(signals).toContain('no_answer');
      expect(signals).toContain('uncertain_response');
    });
  });
});
