/**
 * Response Validator — Post-generation validation layer
 *
 * Catches hallucinated prices before they reach the user.
 * Prices are validated against the single source of truth: pricing-data.ts
 */

import {
  MONTHLY_PLANS_REGULAR,
  MONTHLY_PLANS_PREMIUM,
  UNLIMITED_PLAN,
  FLEXIBLE_PLANS_REGULAR,
  FLEXIBLE_PLANS_PREMIUM,
  DROP_IN_PRICES,
  PERSONAL_TRAINING_PACKS,
  CHOREOGRAPHY_PRICES,
  ENROLLMENT_FEE,
} from '../../../constants/pricing-data.js';

// ============================================================================
// BUILD VALID PRICES SET (from pricing-data.ts — single source of truth)
// ============================================================================

const VALID_PRICES: Set<number> = new Set<number>();

// Free (trial class, current enrollment promo)
VALID_PRICES.add(0);

// Enrollment & admin fees (from LAURA_PROMPT.md, sourced from pricing-data.ts)
VALID_PRICES.add(ENROLLMENT_FEE.price); // 60
VALID_PRICES.add(20); // Annual renewal fee
VALID_PRICES.add(15); // Monthly pause fee

// Monthly plans — regular
for (const plan of MONTHLY_PLANS_REGULAR) {
  VALID_PRICES.add(plan.price);
  VALID_PRICES.add(plan.pricePerActivity);
}

// Monthly plans — premium
for (const plan of MONTHLY_PLANS_PREMIUM) {
  VALID_PRICES.add(plan.price);
  VALID_PRICES.add(plan.pricePerActivity);
}

// Unlimited plan
VALID_PRICES.add(UNLIMITED_PLAN.price);
VALID_PRICES.add(UNLIMITED_PLAN.pricePerActivity);

// Flexible plans (bonos) — regular + premium
for (const plan of [...FLEXIBLE_PLANS_REGULAR, ...FLEXIBLE_PLANS_PREMIUM]) {
  VALID_PRICES.add(plan.price);
  VALID_PRICES.add(plan.pricePerActivity);
}

// Drop-in (clase suelta)
for (const item of DROP_IN_PRICES) {
  VALID_PRICES.add(item.price);
}

// Personal training
for (const pack of PERSONAL_TRAINING_PACKS) {
  VALID_PRICES.add(pack.price);
  VALID_PRICES.add(pack.pricePerSession);
}

// Choreography courses
for (const tier of [CHOREOGRAPHY_PRICES.students, CHOREOGRAPHY_PRICES.external]) {
  VALID_PRICES.add(tier['1.5h']);
  VALID_PRICES.add(tier['3h']);
}

// ============================================================================
// PRICE VALIDATOR
// ============================================================================

/**
 * Validates prices in Laura's response against known valid prices.
 * Replaces hallucinated prices with a safe redirect to the pricing page.
 */
export function validatePrices(text: string, lang: string): string {
  // Match: 50€, 50 €, 50euros, 50 euros, 50EUR, 12,50€, 12.50€
  const priceRegex = /(\d+(?:[.,]\d{1,2})?)\s*(?:€|euros?|EUR)/gi;

  let validated = text;
  let hadInvalidPrices = false;

  validated = validated.replace(priceRegex, (match, priceStr: string) => {
    const price = parseFloat(priceStr.replace(',', '.'));

    // Exact match
    if (VALID_PRICES.has(price)) {
      return match;
    }

    // Allow small rounding differences (e.g., 8.6€ vs 8.58€ in pricing-data)
    for (const validPrice of VALID_PRICES) {
      if (Math.abs(price - validPrice) < 0.1) {
        return match;
      }
    }

    // HALLUCINATED PRICE — replace with pricing page
    hadInvalidPrices = true;
    console.warn(
      `[validate-prices] HALLUCINATED PRICE removed: "${match}" (${price}€ not in valid set)`
    );

    const replacement: Record<string, string> = {
      es: 'consulta precios en www.farrayscenter.com/es/precios-clases-baile-barcelona',
      ca: 'consulta preus a www.farrayscenter.com/ca/precios-clases-baile-barcelona',
      en: 'check prices at www.farrayscenter.com/en/precios-clases-baile-barcelona',
      fr: 'consultez les prix sur www.farrayscenter.com/fr/precios-clases-baile-barcelona',
    };

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return replacement[lang] || replacement['es']!;
  });

  if (hadInvalidPrices) {
    console.warn(
      '[validate-prices] Response contained hallucinated prices — replaced before sending'
    );
  }

  return validated;
}
