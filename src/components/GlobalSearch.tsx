import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { CREW_FIXED, CREW_HEADER } from "../config/crew";

export type GlobalSearchHandle = {
  focus: () => void;
  close: () => void;
};

type SearchResult = {
  name: string;
  slug: string;
};

const tokensFor = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

const matchesQuery = (name: string, query: string) => {
  const tokens = tokensFor(query);
  if (!tokens.length) return true;
  const haystack = name.toLowerCase();
  return tokens.every((token) => haystack.includes(token));
};

const GlobalSearch = forwardRef<GlobalSearchHandle>(function GlobalSearch(_, ref) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const [compact, setCompact] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth < 1024 : false,
  );
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const results = useMemo<SearchResult[]>(() => {
    const filtered = CREW_FIXED.filter(({ name }) => matchesQuery(name, query));
    return filtered;
  }, [query]);

  const listId = useId();
  const isHint = open && !results.length;

  const resetHighlight = useCallback(() => {
    setHighlightIndex(results.length ? 0 : -1);
  }, [results.length]);

  const close = useCallback(() => {
    setOpen(false);
    setHighlightIndex(-1);
  }, []);

  const focus = useCallback(() => {
    if (!inputRef.current) return;
    if (compact) {
      setOpen(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      inputRef.current.focus();
    }
  }, [compact]);

  useImperativeHandle(
    ref,
    () => ({
      focus,
      close,
    }),
    [focus, close],
  );

  const handleResize = useCallback((event: MediaQueryListEvent | MediaQueryList) => {
    setCompact(event.matches);
    if (!event.matches) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const media = window.matchMedia("(max-width: 1023px)");
    handleResize(media);
    media.addEventListener("change", handleResize);
    return () => media.removeEventListener("change", handleResize);
  }, [handleResize]);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        overlayRef.current &&
        !overlayRef.current.contains(event.target)
      ) {
        close();
      }
    };

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open, close]);

  const handleSelect = useCallback(
    (item: SearchResult) => {
      close();
      setQuery("");
      setHighlightIndex(-1);
      navigate(`/dashboard?crew=${item.slug}`);
    },
    [close, navigate],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!open && event.key === "ArrowDown") {
        setOpen(true);
        resetHighlight();
        return;
      }
      if (!open) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightIndex((index) => {
          if (!results.length) return -1;
          if (index < 0) return 0;
          return Math.min(results.length - 1, index + 1);
        });
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightIndex((index) => {
          if (!results.length) return -1;
          if (index <= 0) return results.length - 1;
          return index - 1;
        });
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (highlightIndex >= 0 && results[highlightIndex]) {
          handleSelect(results[highlightIndex]);
        }
      } else if (event.key === "Escape") {
        close();
      }
    },
    [open, results, highlightIndex, handleSelect, close, resetHighlight],
  );

  const handleFocus = useCallback(() => {
    setOpen(true);
    resetHighlight();
  }, [resetHighlight]);

  useEffect(() => {
    if (!results.length) {
      setHighlightIndex(-1);
    } else if (highlightIndex >= results.length) {
      setHighlightIndex(results.length - 1);
    }
  }, [results, highlightIndex]);

  const listContent = (() => {
    if (!open) return null;

    if (isHint) {
      return (
        <li
          className="px-4 py-2 text-xs uppercase tracking-[0.25em] text-slate-500 bg-slate-900/80 border-t border-white/5 backdrop-blur-sm"
          aria-disabled="true"
        >
          No crew member found.
        </li>
      );
    }

    return results.map((item, index) => {
      const active = index === highlightIndex;
      return (
        <li key={item.slug}>
          <button
            type="button"
          className={`flex w-full items-center justify-between px-4 py-2 text-sm text-slate-100 transition ${
              active
                ? "bg-sky-500/25 shadow-[0_0_25px_rgba(56,189,248,0.35)]"
                : "bg-slate-900/50"
            } focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 rounded-xl`}
          onMouseEnter={() => setHighlightIndex(index)}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => handleSelect(item)}
          aria-label={`Navigate to ${item.name}`}
        >
            <span className="font-medium tracking-wide text-white drop-shadow-[0_18px_36px_rgba(56,189,248,0.35)]">
              {item.name}
            </span>
            <span className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Crew
            </span>
          </button>
        </li>
      );
    });
  })();

  const dropdownContent = !open ? null : (
    <div
      ref={overlayRef}
      className={`absolute left-0 right-0 top-full mt-2 rounded-2xl border border-white/10 shadow-[0_30px_60px_rgba(15,23,42,0.65)] backdrop-blur-2xl z-[5000] ${
        compact ? "mx-auto max-w-md" : ""
      }`}
    >
      <div className="rounded-2xl bg-gradient-to-b from-[#0d1538] via-[#060c21] to-[#040812]">
        <ul
          role="listbox"
          id={listId}
          aria-label="Crew search results"
          className="py-2 space-y-1"
        >
          <li
            className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300/90 border-b border-white/10"
            aria-disabled="true"
          >
            {CREW_HEADER}
          </li>
          {listContent}
        </ul>
      </div>
    </div>
  );

  const dropdown = compact
    ? dropdownContent
    : dropdownContent && typeof document !== "undefined"
      ? createPortal(dropdownContent, document.body)
      : null;

  return (
    <div className="relative z-[5000]">
      {compact && !open ? (
        <button
          type="button"
          aria-label="Open search"
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 text-slate-100 transition hover:border-sky-400/80 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
          onClick={() => {
            setOpen(true);
            setTimeout(() => focus(), 0);
          }}
        >
          <span className="text-xl">🔍</span>
        </button>
      ) : null}
      {(!compact || open) && (
        <div
          className={`${
            compact
              ? "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm px-6 pt-20"
              : "relative"
          }`}
        >
          {compact && (
            <button
              type="button"
              aria-label="Close search"
              className="absolute right-6 top-6 text-slate-300 text-sm underline"
              onClick={() => {
                setOpen(false);
                setQuery("");
              }}
            >
              Close
            </button>
          )}
          <div className={`${compact ? "max-w-md mx-auto" : ""} relative`}>
            <input
              ref={inputRef}
              type="search"
              aria-label="Search crew"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 shadow-[0_10px_25px_rgba(15,23,42,0.45)]"
              placeholder="Search support, crew, or telemetry..."
              value={query}
              onFocus={handleFocus}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKeyDown}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls={listId}
            />
            {dropdown}
            <span className="sr-only" aria-live="polite">
              {isHint ? "No crew member found" : `${results.length} crew available`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

export default GlobalSearch;
