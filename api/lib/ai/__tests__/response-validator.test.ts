/**
 * Response Validator Tests
 *
 * Tests price validation against pricing-data.ts source of truth.
 * Run with: npm test -- response-validator.test.ts
 */

import { describe, it, expect } from 'vitest';
import { validatePrices } from '../response-validator';

describe('validatePrices', () => {
  describe('valid prices (should NOT be replaced)', () => {
    it('should keep valid monthly plan prices', () => {
      // 55€ is Plan 1 Actividad Regular
      const text = 'El plan de 1 actividad cuesta 55€ al mes.';
      expect(validatePrices(text, 'es')).toBe(text);
    });

    it('should keep 0€ (free trial class)', () => {
      const text = 'La clase de prueba es gratuita, 0€.';
      expect(validatePrices(text, 'es')).toBe(text);
    });

    it('should keep enrollment fee', () => {
      const text = 'La matrícula es de 60€.';
      expect(validatePrices(text, 'es')).toBe(text);
    });

    it('should keep prices with comma as decimal separator', () => {
      // 8,58€ is price per activity for some flexible plan
      const text = 'Sale a 8,58€ por clase.';
      expect(validatePrices(text, 'es')).toBe(text);
    });

    it('should keep prices with "euros" suffix', () => {
      const text = 'El plan cuesta 55 euros al mes.';
      expect(validatePrices(text, 'es')).toBe(text);
    });

    it('should keep prices with "EUR" suffix', () => {
      const text = 'El plan cuesta 55EUR al mes.';
      expect(validatePrices(text, 'es')).toBe(text);
    });

    it('should handle text with no prices at all', () => {
      const text = 'Tenemos clases de salsa, bachata y kizomba.';
      expect(validatePrices(text, 'es')).toBe(text);
    });

    it('should allow small rounding differences (tolerance ±0.1)', () => {
      // 8.6€ is close to 8.58€ within 0.1 tolerance
      const text = 'Sale a 8,6€ por clase.';
      expect(validatePrices(text, 'es')).toBe(text);
    });
  });

  describe('hallucinated prices (should be replaced)', () => {
    it('should replace a clearly wrong price', () => {
      const text = 'La clase cuesta 999€.';
      const result = validatePrices(text, 'es');
      expect(result).not.toContain('999€');
      expect(result).toContain('farrayscenter.com/es/precios');
    });

    it('should replace hallucinated price while keeping valid text', () => {
      const text = 'Hola! La clase suelta es 999€ y tenemos muchos estilos.';
      const result = validatePrices(text, 'es');
      expect(result).toContain('Hola!');
      expect(result).toContain('muchos estilos');
      expect(result).not.toContain('999€');
    });

    it('should replace multiple hallucinated prices', () => {
      const text = 'El plan básico es 777€ y el premium es 888€.';
      const result = validatePrices(text, 'es');
      expect(result).not.toContain('777€');
      expect(result).not.toContain('888€');
    });
  });

  describe('language-specific replacements', () => {
    it('should use Spanish replacement for "es"', () => {
      const result = validatePrices('Cuesta 999€.', 'es');
      expect(result).toContain('consulta precios en');
      expect(result).toContain('/es/');
    });

    it('should use Catalan replacement for "ca"', () => {
      const result = validatePrices('Costa 999€.', 'ca');
      expect(result).toContain('consulta preus a');
      expect(result).toContain('/ca/');
    });

    it('should use English replacement for "en"', () => {
      const result = validatePrices('It costs 999€.', 'en');
      expect(result).toContain('check prices at');
      expect(result).toContain('/en/');
    });

    it('should use French replacement for "fr"', () => {
      const result = validatePrices('Ça coûte 999€.', 'fr');
      expect(result).toContain('consultez les prix sur');
      expect(result).toContain('/fr/');
    });

    it('should fallback to Spanish for unknown languages', () => {
      const result = validatePrices('Costs 999€.', 'de');
      expect(result).toContain('consulta precios en');
    });
  });

  describe('mixed valid and invalid prices', () => {
    it('should keep valid prices and replace only invalid ones', () => {
      const text = 'El plan es 55€ al mes, no 999€ como dijiste.';
      const result = validatePrices(text, 'es');
      expect(result).toContain('55€');
      expect(result).not.toContain('999€');
    });
  });
});
