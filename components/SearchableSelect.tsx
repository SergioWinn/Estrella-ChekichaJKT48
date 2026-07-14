"use client";

import { useEffect, useId, useRef, useState } from "react";

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
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");
  const controlId = useId();
  const listboxId = `${controlId}-listbox`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const selectedValue = value ?? uncontrolledValue;

  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (open && listRef.current) {
      const active = listRef.current.querySelector("[data-highlighted]");
      if (active) {
        active.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, open]);

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

  function handleKeyDown(event: React.KeyboardEvent) {
    if (!open) {
      if (event.key === "ArrowDown" || event.key === "Enter") {
        setHighlightedIndex(0);
        setOpen(true);
        event.preventDefault();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        setHighlightedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
        event.preventDefault();
        break;
      case "ArrowUp":
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        event.preventDefault();
        break;
      case "Enter":
        if (filtered[highlightedIndex]) {
          handleSelect(filtered[highlightedIndex]);
        }
        event.preventDefault();
        break;
      case "Escape":
        setOpen(false);
        setQuery("");
        setHighlightedIndex(0);
        event.preventDefault();
        break;
    }
  }

  function handleSelect(option: Option) {
    if (value === undefined) setUncontrolledValue(option.value);
    setQuery("");
    setOpen(false);
    onChange?.(option.value);
  }

  const selected = options.find((o) => o.value === selectedValue);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {name ? <input type="hidden" name={name} value={selected?.value ?? ""} /> : null}
      <button
        id={controlId}
        type="button"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-haspopup="listbox"
        onKeyDown={handleKeyDown}
        onClick={() => {
          if (!open) setHighlightedIndex(0);
          setOpen(!open);
        }}
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
        <div className="absolute left-0 right-0 top-full z-[var(--z-dropdown)] mt-1 max-h-64 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-dropdown)]">
          <div className="border-b border-[var(--border)] p-2">
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-expanded={open}
              aria-activedescendant={filtered[highlightedIndex] ? `${listboxId}-${highlightedIndex}` : undefined}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setHighlightedIndex(0); }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-sm outline-none placeholder:text-[var(--muted)]"
            />
          </div>
          <div id={listboxId} ref={listRef} className="overflow-y-auto" role="listbox">
            {filtered.length ? (
              filtered.map((option, index) => (
                <button
                  key={option.value}
                  id={`${listboxId}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={option.value === selected?.value}
                  data-highlighted={index === highlightedIndex ? true : undefined}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition hover:bg-[var(--surface-hover)] ${
                    index === highlightedIndex
                      ? "bg-[var(--surface-hover)]"
                      : ""
                  } ${
                    option.value === selected?.value
                      ? "font-semibold text-[var(--accent)]"
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
