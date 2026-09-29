"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Package,
  Layers,
  Users,
  ShoppingCart,
  Factory,
  BadgeDollarSign,
  Loader2,
  CornerDownLeft,
} from "lucide-react";

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  category: string;
}

interface SearchResponse {
  products: SearchResultItem[];
  batches: SearchResultItem[];
  partners: SearchResultItem[];
  purchases: SearchResultItem[];
  manufacturing: SearchResultItem[];
  sales: SearchResultItem[];
}

export function GlobalSearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const totalResults = results
    ? results.products.length +
      results.batches.length +
      results.partners.length +
      results.purchases.length +
      results.manufacturing.length +
      results.sales.length
    : 0;

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20" dir="rtl">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative mx-auto max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Search Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 bg-slate-50/50">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="بحث شامل بالأصناف، الباتشات، الموردين، العملاء، فواتير الشراء، أو أوامر التصنيع..."
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 focus:outline-none placeholder:text-slate-400"
          />
          {loading && <Loader2 className="h-4 w-4 text-indigo-600 animate-spin" />}
          {query && !loading && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono text-slate-400 bg-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="py-12 text-center text-xs text-slate-400">
              <Search className="h-8 w-8 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600">اكتب حرفين على الأقل للبحث الفوري</p>
              <p className="text-[11px] mt-1">
                يمكنك الضغط على <kbd className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">Ctrl + K</kbd> أو <kbd className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">/</kbd> في أي وقت
              </p>
            </div>
          )}

          {query && !loading && totalResults === 0 && (
            <div className="py-12 text-center text-xs text-slate-400">
              <p className="font-semibold text-slate-600">لم يتم العثور على أي نتائج مطابقة لـ &ldquo;{query}&rdquo;</p>
              <p className="text-[11px] mt-1">تأكد من صحة الكود أو رقم الباتش أو اسم الشريك</p>
            </div>
          )}

          {results && (
            <>
              {/* Batches */}
              {results.batches.length > 0 && (
                <ResultGroup
                  title="لوتات وباتشات المخزون (Batches)"
                  icon={Layers}
                  items={results.batches}
                  onSelect={handleSelect}
                />
              )}

              {/* Products */}
              {results.products.length > 0 && (
                <ResultGroup
                  title="دليل المنتجات والأصناف"
                  icon={Package}
                  items={results.products}
                  onSelect={handleSelect}
                />
              )}

              {/* Purchases */}
              {results.purchases.length > 0 && (
                <ResultGroup
                  title="فواتير التوريد والمشتريات"
                  icon={ShoppingCart}
                  items={results.purchases}
                  onSelect={handleSelect}
                />
              )}

              {/* Manufacturing */}
              {results.manufacturing.length > 0 && (
                <ResultGroup
                  title="أوامر التصنيع لدى الغير"
                  icon={Factory}
                  items={results.manufacturing}
                  onSelect={handleSelect}
                />
              )}

              {/* Sales */}
              {results.sales.length > 0 && (
                <ResultGroup
                  title="فواتير المبيعات الصادرة"
                  icon={BadgeDollarSign}
                  items={results.sales}
                  onSelect={handleSelect}
                />
              )}

              {/* Partners */}
              {results.partners.length > 0 && (
                <ResultGroup
                  title="شركاء الأعمال (موردين / عملاء / مصانع)"
                  icon={Users}
                  items={results.partners}
                  onSelect={handleSelect}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>التنقل والفتح المباشر</span>
            <CornerDownLeft className="h-3 w-3" />
          </div>
          <span>Tashgheel Intelligent Omnisearch</span>
        </div>
      </div>
    </div>
  );
}

function ResultGroup({
  title,
  icon: Icon,
  items,
  onSelect,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SearchResultItem[];
  onSelect: (url: string) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-slate-500 uppercase">
        <Icon className="h-3.5 w-3.5 text-indigo-600" />
        <span>{title}</span>
      </div>
      <div className="space-y-0.5">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.url)}
            className="w-full text-right px-3.5 py-2 rounded-xl hover:bg-slate-100 flex items-center justify-between group transition"
          >
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">
                {item.title}
              </p>
              <p className="text-[11px] text-slate-500">{item.subtitle}</p>
            </div>
            <CornerDownLeft className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition" />
          </button>
        ))}
      </div>
    </div>
  );
}
