"use client";

import { useEffect, useRef, useState } from "react";

interface Option {
  label: string;
  value: string;
}

export function SearchableSelect({
  name,
  options,
  value,
  defaultValue,
  onChange,
  placeholder = "Search...",
  className = "",
}: {
  className?: string;
  defaultValue?: string;
  name?: string;
  onChange?: (value: string) => void;
  options: Option[];
  placeholder?: string;
  value?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedLabel, setSelectedLabel] = useState(
    options.find((o) => o.value === (value ?? defaultValue ?? ""))?.label ?? "",
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(option: Option) {
    setSelectedLabel(option.label);
    setQuery("");
    setOpen(false);
    onChange?.(option.value);
  }

  const selected = options.find((o) => o.value === (value ?? defaultValue ?? ""));

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input type="hidden" name={name} value={selected?.value ?? ""} />
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex min-h-12 w-full items-center rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-left text-lg text-[var(--foreground)] transition hover:border-[var(--border-strong)]"
      >
        <span className={selected ? "text-[var(--foreground)]" : "text-[var(--muted)]"}>
          {selected?.label || placeholder}
        </span>
        <span className="ml-auto shrink-0 text-[var(--muted)] transition-transform" aria-hidden="true">
          <svg className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          </svg>
        </span>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-[var(--z-dropdown)] mt-1 max-h-64 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
          <div className="border-b border-[var(--border)] p-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="min-h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-sm outline-none placeholder:text-[var(--muted)]"
            />
          </div>
          <div className="overflow-y-auto">
            {filtered.length ? (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition hover:bg-[var(--surface-hover)] ${
                    option.value === selected?.value
                      ? "bg-[var(--accent-soft)] font-semibold text-[var(--accent)]"
                      : "text-[var(--foreground)]"
                  }`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-sm text-[var(--muted)]">No matches found.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
