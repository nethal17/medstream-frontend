import { ChevronRight } from "lucide-react";

function SidePanelItem({ item, activeKey, onSelect, depth = 0 }) {
  const isActive = activeKey === item.key;

  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(item.key)}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
          isActive
            ? "bg-teal-50 font-medium text-teal-800 ring-1 ring-teal-200"
            : "text-slate-600 hover:bg-slate-100"
        } ${depth > 0 ? "ml-3" : ""}`}
      >
        <span>{item.label}</span>
        {item.children?.length ? <ChevronRight className="size-4 text-slate-400" /> : null}
      </button>

      {item.children?.length ? (
        <div className="mt-1 space-y-1">
          {item.children.map((child) => (
            <SidePanelItem key={child.key} item={child} activeKey={activeKey} onSelect={onSelect} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function SuperAdminSidePanel({ items, activeKey, onSelect }) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-4 shadow-sm">
        <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Admin Navigation</p>
        <div className="space-y-1.5">
          {items.map((item) => (
            <SidePanelItem key={item.key} item={item} activeKey={activeKey} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </aside>
  );
}
