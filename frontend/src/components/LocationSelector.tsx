// ─── LocationSelector.tsx ────────────────────────────────────────────────────
// Reusable two-level searchable dropdown: State → City/District.
// Uses react-select for the searchable UI.
// Passes `fromLocation` (city string) up to the parent via `onChange`.

import Select, { type SingleValue, type StylesConfig } from "react-select";
import { useState, useEffect } from "react";
import {
  getStateSelectOptions,
  getDistrictOptions,
} from "../data/indiaLocations";

interface SelectOption {
  value: string;
  label: string;
}

interface LocationSelectorProps {
  /** Currently selected city/district (controlled) */
  value: string;
  /** Called with the new city string whenever selection changes */
  onChange: (city: string) => void;
  /** Pre-selected state (optional, e.g. when AI planner already has a state) */
  defaultState?: string;
  /** Whether this field is disabled */
  disabled?: boolean;
}

// ── Custom react-select styles matching the app design system ─────────────────
const selectStyles = <T extends SelectOption>(): StylesConfig<T> => ({
  control: (base, state) => ({
    ...base,
    borderRadius: "0.75rem",
    border: `2px solid ${state.isFocused ? "var(--color-brand-400, #818cf8)" : "#e2e8f0"}`,
    boxShadow: state.isFocused ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
    minHeight: "2.75rem",
    fontSize: "0.875rem",
    backgroundColor: "white",
    cursor: "pointer",
    transition: "border-color 0.15s, box-shadow 0.15s",
    "&:hover": {
      borderColor: "var(--color-brand-300, #a5b4fc)",
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: "#94a3b8",
    fontSize: "0.875rem",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#1e293b",
    fontWeight: 500,
    fontSize: "0.875rem",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "var(--color-brand-500, #6366f1)"
      : state.isFocused
      ? "var(--color-brand-50, #eef2ff)"
      : "white",
    color: state.isSelected ? "white" : "#334155",
    fontSize: "0.875rem",
    cursor: "pointer",
    borderRadius: "0.5rem",
    margin: "1px 4px",
    width: "calc(100% - 8px)",
    "&:active": { backgroundColor: "#e0e7ff" },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.75rem",
    boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    zIndex: 9999,
  }),
  menuList: (base) => ({
    ...base,
    padding: "4px",
    maxHeight: "220px",
  }),
  input: (base) => ({
    ...base,
    fontSize: "0.875rem",
    color: "#1e293b",
  }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? "var(--color-brand-500, #6366f1)" : "#94a3b8",
    transition: "color 0.15s, transform 0.2s",
    transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0deg)",
    padding: "0 10px",
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "#94a3b8",
    "&:hover": { color: "#ef4444" },
    padding: "0 6px",
  }),
  noOptionsMessage: (base) => ({
    ...base,
    fontSize: "0.875rem",
    color: "#94a3b8",
  }),
  loadingMessage: (base) => ({
    ...base,
    fontSize: "0.875rem",
    color: "#94a3b8",
  }),
});

export default function LocationSelector({
  value,
  onChange,
  defaultState = "",
  disabled = false,
}: LocationSelectorProps) {
  const stateOptions = getStateSelectOptions();
  const [selectedState, setSelectedState] = useState<SelectOption | null>(
    defaultState
      ? stateOptions.find((s) => s.value === defaultState) ?? null
      : null
  );
  const [districtOptions, setDistrictOptions] = useState<SelectOption[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<SelectOption | null>(
    value ? { value, label: value } : null
  );

  // ── When state changes → rebuild district list, reset city ────────────────
  useEffect(() => {
    if (selectedState) {
      setDistrictOptions(getDistrictOptions(selectedState.value));
    } else {
      setDistrictOptions([]);
    }
    // Reset city whenever state changes
    setSelectedDistrict(null);
    onChange("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedState?.value]);

  // ── Sync if parent resets value externally ────────────────────────────────
  useEffect(() => {
    if (!value && selectedDistrict) {
      setSelectedDistrict(null);
    }
  }, [value]);

  const handleStateChange = (opt: SingleValue<SelectOption>) => {
    setSelectedState(opt ?? null);
  };

  const handleDistrictChange = (opt: SingleValue<SelectOption>) => {
    setSelectedDistrict(opt ?? null);
    onChange(opt?.value ?? "");
  };

  return (
    <div className="space-y-3">
      {/* ── State dropdown ─────────────────────────────────────── */}
      <div>
        <label className="label-text mb-1.5 block">
          📍 Departure State
        </label>
        <Select<SelectOption>
          options={stateOptions}
          value={selectedState}
          onChange={handleStateChange}
          placeholder="Select state…"
          isSearchable
          isClearable
          isDisabled={disabled}
          styles={selectStyles<SelectOption>()}
          classNamePrefix="rs"
          noOptionsMessage={() => "No state found"}
        />
      </div>

      {/* ── City/District dropdown (dependent on state) ───────── */}
      <div>
        <label className="label-text mb-1.5 flex items-center gap-1.5 block">
          🏙️ From City
          {!selectedState && (
            <span className="text-slate-400 font-normal text-[11px]">(select state first)</span>
          )}
        </label>
        <Select<SelectOption>
          key={selectedState?.value ?? "no-state"} // remount on state change
          options={districtOptions}
          value={selectedDistrict}
          onChange={handleDistrictChange}
          placeholder={selectedState ? `Search cities in ${selectedState.value}…` : "Select state first…"}
          isSearchable
          isClearable
          isDisabled={disabled || !selectedState}
          styles={selectStyles<SelectOption>()}
          classNamePrefix="rs"
          noOptionsMessage={({ inputValue }) =>
            inputValue ? `No city matching "${inputValue}"` : "No cities available"
          }
        />
      </div>

      {/* Selected summary chip */}
      {value && (
        <div className="flex items-center gap-2 animate-fade-in">
          <span className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            📌 {value}
            {selectedState && (
              <span className="text-brand-400 font-normal">· {selectedState.value}</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
