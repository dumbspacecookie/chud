// "Inventory is just the man-animal's wardrobe Morty. Crapulous status
// signaling in a *bzrp* JSON array. The mythic auras outrank everything
// — they're visible at 2x scale so whales are unmistakable in live."
// — Terl, retail therapist.
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getInventory, equipCosmetic, errMsg, type InventoryRow, type CosmeticRarity } from "@/lib/api";

const RARITY_COLOR: Record<CosmeticRarity, string> = {
  common: "text-white/60",
  rare: "text-blue-300",
  epic: "text-purple-300",
  legendary: "text-aura-gold",
  mythic: "text-aura-pink",
};

const RARITY_RANK: Record<CosmeticRarity, number> = {
  common: 1, rare: 2, epic: 3, legendary: 4, mythic: 5,
};

export default function InventoryPage() {
  const router = useRouter();
  const { me, loaded } = useAuth((s) => ({ me: s.me, loaded: s.loaded }));
  const [items, setItems] = useState<InventoryRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "glazer" | "chud" | "equipped">("all");

  useEffect(() => { if (loaded && !me) router.replace("/login"); }, [loaded, me, router]);

  const reload = useCallback(async () => {
    try { setItems(await getInventory()); } catch (e) { setErr(errMsg(e)); }
  }, []);
  useEffect(() => { if (me) reload(); }, [me, reload]);

  async function toggle(row: InventoryRow) {
    try {
      await equipCosmetic(row.inventory_id, !row.equipped);
      await reload();
    } catch (e) {
      setErr(errMsg(e));
    }
  }

  if (!loaded || !me) return null;

  const filtered = items
    .filter((i) => filter === "all" || (filter === "equipped" ? i.equipped : i.side === filter))
    .sort((a, b) => RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity]);

  // group by slot for display
  const bySlot: Record<string, InventoryRow[]> = {};
  for (const r of filtered) {
    (bySlot[r.slot] ??= []).push(r);
  }

  return (
    <div className="min-h-screen p-5 pb-24">
      <Link href="/" className="text-white/40 text-sm">← home</Link>
      <h1 className="brand-mark text-5xl mt-3 text-aura-gold">inventory</h1>
      <p className="text-white/50 text-sm mt-1">{items.length} items. one equipped per slot.</p>

      <div className="mt-4 flex gap-2 flex-wrap">
        {(["all", "glazer", "chud", "equipped"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-semibold ${filter === f ? "bg-aura-gold text-ink" : "bg-white/10 text-white/60"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {err && <div className="text-brick-piss text-sm mt-3">{err}</div>}

      {items.length === 0 && (
        <div className="mt-12 text-center text-white/40 text-sm">
          empty. pull a <Link href="/capsule" className="text-aura-gold underline">capsule</Link>.
        </div>
      )}

      {Object.entries(bySlot).map(([slot, rows]) => (
        <section key={slot} className="mt-6">
          <h2 className="text-xs uppercase tracking-widest text-white/40 mb-2">{slot}</h2>
          <div className="grid grid-cols-2 gap-2">
            {rows.map((r) => (
              <button
                key={r.inventory_id}
                onClick={() => toggle(r)}
                className={`text-left p-3 rounded-lg border ${
                  r.equipped
                    ? r.side === "glazer"
                      ? "border-aura-gold bg-aura-gold/10"
                      : r.side === "chud"
                        ? "border-brick-piss bg-brick-piss/10"
                        : "border-white/30 bg-white/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className={`text-[10px] uppercase tracking-widest ${RARITY_COLOR[r.rarity]}`}>{r.rarity}</div>
                <div className="font-semibold mt-1 text-sm">{r.name}</div>
                <div className="text-[10px] text-white/40 mt-0.5">
                  {r.side} {r.equipped && "· equipped"}
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
