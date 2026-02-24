/**
 * CountryPhoneInput Component
 * International phone input with country selector and validation
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import { useTranslation } from 'react-i18next';
import {
  Country,
  getSortedCountries,
  getDefaultCountry,
  searchCountries,
} from '../constants/countries';

// Chevron icon for dropdown
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

// Search icon
const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

interface CountryPhoneInputProps {
  value: string;
  countryCode: CountryCode;
  onChange: (phone: string, countryCode: CountryCode, isValid: boolean) => void;
  disabled?: boolean;
  isInvalid?: boolean;
  placeholder?: string;
  id?: string;
  name?: string;
}

export const CountryPhoneInput: React.FC<CountryPhoneInputProps> = ({
  value,
  countryCode,
  onChange,
  disabled = false,
  isInvalid = false,
  placeholder,
  id = 'phone',
  name = 'phone',
}) => {
  const { t, i18n } = useTranslation('booking');
  const locale = i18n.language;
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    () => getSortedCountries().find(c => c.code === countryCode) ?? getDefaultCountry(locale)
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Filter countries based on search
  const filteredCountries = useMemo(() => searchCountries(search), [search]);

  // Update selected country when countryCode prop changes
  useEffect(() => {
    const country = getSortedCountries().find(c => c.code === countryCode);
    if (country && country.code !== selectedCountry.code) {
      setSelectedCountry(country);
    }
  }, [countryCode, selectedCountry.code]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as HTMLElement)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle country selection
  const handleCountrySelect = useCallback(
    (country: Country) => {
      setSelectedCountry(country);
      setIsOpen(false);
      setSearch('');
      // Revalidate with new country
      const isValid = value ? isValidPhoneNumber(value, country.code) : false;
      onChange(value, country.code, isValid);
      // Focus phone input after selection
      setTimeout(() => phoneInputRef.current?.focus(), 0);
    },
    [value, onChange]
  );

  // Handle phone input change
  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      // Only allow digits, spaces, and basic phone characters
      const sanitized = rawValue.replace(/[^\d\s\-()]/g, '');

      // Validate the phone number
      let isValid = false;
      try {
        if (sanitized.length >= 6) {
          isValid = isValidPhoneNumber(sanitized, selectedCountry.code);
        }
      } catch {
        isValid = false;
      }

      onChange(sanitized, selectedCountry.code, isValid);
    },
    [selectedCountry.code, onChange]
  );

  // Handle keyboard navigation in dropdown
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearch('');
      } else if (e.key === 'Enter') {
        const firstCountry = filteredCountries[0];
        if (firstCountry) {
          handleCountrySelect(firstCountry);
        }
      }
    },
    [filteredCountries, handleCountrySelect]
  );

  // Format display value (add formatting as user types)
  const getDisplayValue = useCallback(() => {
    if (!value) return '';
    try {
      const parsed = parsePhoneNumber(value, selectedCountry.code);
      if (parsed) {
        return parsed.formatNational();
      }
    } catch {
      // Return raw value if parsing fails
    }
    return value;
  }, [value, selectedCountry.code]);

  // Get full E.164 formatted number for API
  const getE164Number = useCallback((): string => {
    if (!value) return '';
    try {
      const parsed = parsePhoneNumber(value, selectedCountry.code);
      if (parsed && parsed.isValid()) {
        return parsed.format('E.164');
      }
    } catch {
      // Fallback: just prepend dial code
    }
    // Fallback: dial code + cleaned number
    const cleaned = value.replace(/\D/g, '');
    return `${selectedCountry.dialCode}${cleaned}`;
  }, [value, selectedCountry]);

  // Expose E.164 format for parent component
  useEffect(() => {
    // Store E.164 in a data attribute for parent to read if needed
    if (phoneInputRef.current) {
      phoneInputRef.current.dataset['e164'] = getE164Number();
    }
  }, [getE164Number]);

  const baseInputClasses = `
    w-full px-4 py-3 bg-white/5 rounded-xl
    text-neutral placeholder-neutral/40
    focus:outline-none focus:ring-2
    transition-all disabled:opacity-50
  `;

  const inputClasses = isInvalid
    ? `${baseInputClasses} border-2 border-red-500 focus:border-red-500 focus:ring-red-500/20`
    : `${baseInputClasses} border border-white/20 focus:border-primary-accent focus:ring-primary-accent/20`;

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex gap-2">
        {/* Country selector button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            flex items-center gap-1.5 px-3 py-3 rounded-xl
            bg-white/5 border border-white/20
            hover:bg-white/10 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            min-w-[100px] justify-between
            ${isOpen ? 'ring-2 ring-primary-accent border-primary-accent' : ''}
          `}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={t('booking_phone_country')}
        >
          <span className="text-lg" aria-hidden="true">
            {selectedCountry.flag}
          </span>
          <span className="text-sm font-medium text-neutral">{selectedCountry.dialCode}</span>
          <ChevronDownIcon
            className={`w-4 h-4 text-neutral/60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Phone number input */}
        <input
          ref={phoneInputRef}
          type="tel"
          id={id}
          name={name}
          value={getDisplayValue()}
          onChange={handlePhoneChange}
          disabled={disabled}
          placeholder={placeholder ?? t('booking_placeholder_phone_number')}
          className={`${inputClasses} flex-1`}
          autoComplete="tel-national"
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? `${id}-error` : undefined}
        />
      </div>

      {/* Country dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 top-full left-0 mt-2 w-72 max-h-80
            bg-black/95 backdrop-blur-xl border border-white/20
            rounded-xl shadow-2xl overflow-hidden animate-fade-in"
          role="listbox"
          aria-label={t('booking_phone_select_country')}
        >
          {/* Search input */}
          <div className="p-2 border-b border-white/10">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral/40" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('booking_phone_search')}
                className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg
                  text-sm text-neutral placeholder-neutral/40
                  focus:outline-none focus:border-primary-accent"
              />
            </div>
          </div>

          {/* Country list */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-neutral/50 text-sm">
                {t('booking_phone_no_results')}
              </div>
            ) : (
              filteredCountries.map(country => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5
                    hover:bg-white/10 transition-colors text-left
                    ${selectedCountry.code === country.code ? 'bg-primary-accent/20' : ''}
                  `}
                  role="option"
                  aria-selected={selectedCountry.code === country.code}
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="flex-1 text-sm text-neutral truncate">{country.name}</span>
                  <span className="text-sm text-neutral/60 font-mono">{country.dialCode}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Utility function to format phone for API submission
 * Returns E.164 format: +34612345678
 */
export function formatPhoneForAPI(phone: string, countryCode: CountryCode): string {
  if (!phone) return '';
  try {
    const parsed = parsePhoneNumber(phone, countryCode);
    if (parsed && parsed.isValid()) {
      return parsed.format('E.164');
    }
  } catch {
    // Fallback
  }
  // Fallback: find country and prepend dial code
  const country = getSortedCountries().find(c => c.code === countryCode);
  const cleaned = phone.replace(/\D/g, '');
  return country ? `${country.dialCode}${cleaned}` : `+${cleaned}`;
}

/**
 * Validate phone number for a specific country
 */
export function validatePhoneNumber(phone: string, countryCode: CountryCode): boolean {
  if (!phone || phone.length < 6) return false;
  try {
    return isValidPhoneNumber(phone, countryCode);
  } catch {
    return false;
  }
}

export default CountryPhoneInput;
