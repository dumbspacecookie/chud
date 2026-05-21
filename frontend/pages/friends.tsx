// "The friend graph is the *bzrp* moat, Morty. No mutual-friendship,
// no chud-deploy. It's the difference between a fun game and a
// class-action. Crapulous compliance, but compliance." — Terl, T&S.
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  listFriends, requestFriend, acceptFriend, declineFriend, blockUser,
  searchHandles, errMsg,
  type FriendRow,
} from "@/lib/api";

export default function FriendsPage() {
  const router = useRouter();
  const { me, loaded } = useAuth((s) => ({ me: s.me, loaded: s.loaded }));
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<{ handle: string; saiyan_name: string | null }[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { if (loaded && !me) router.replace("/login"); }, [loaded, me, router]);

  const reload = useCallback(async () => {
    try { setFriends(await listFriends()); } catch (e) { setErr(errMsg(e)); }
  }, []);
  useEffect(() => { if (me) reload(); }, [me, reload]);

  // debounced search
  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      try { setResults(await searchHandles(q)); } catch (e) { setErr(errMsg(e)); }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  async function act(fn: () => Promise<unknown>) {
    setErr(null);
    try { await fn(); await reload(); } catch (e) { setErr(errMsg(e)); }
  }

  if (!loaded || !me) return null;

  const mutual = friends.filter((f) => f.status === "mutual");
  const incoming = friends.filter((f) => f.status === "pending_incoming");
  const outgoing = friends.filter((f) => f.status === "pending_outgoing");

  return (
    <div className="min-h-screen p-5 pb-24">
      <Link href="/" className="text-white/40 text-sm">← home</Link>
      <h1 className="brand-mark text-5xl mt-3 text-aura-gold">friends</h1>
      <p className="text-white/50 text-sm mt-1">mutuals unlock chud-mode against each other.</p>

      {/* search */}
      <div className="mt-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="search by @handle"
          className="w-full bg-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 ring-aura-gold"
        />
        {results.length > 0 && (
          <div className="mt-2 divide-y divide-white/5 rounded-lg overflow-hidden bg-white/5">
            {results.map((r) => (
              <div key={r.handle} className="flex items-center justify-between px-3 py-2">
                <div className="text-sm">
                  @{r.handle}
                  {r.saiyan_name && <span className="text-white/40 ml-2 text-xs">aka {r.saiyan_name}</span>}
                </div>
                <button
                  onClick={() => act(() => requestFriend(r.handle))}
                  className="text-xs px-3 py-1 rounded-full bg-aura-gold text-ink font-semibold"
                >
                  add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {err && <div className="text-brick-piss text-sm mt-3">{err}</div>}

      {incoming.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs uppercase tracking-widest text-white/40 mb-2">incoming requests</h2>
          <div className="divide-y divide-white/5 rounded-lg overflow-hidden bg-white/5">
            {incoming.map((f) => (
              <FriendCard key={f.handle} f={f}>
                <button onClick={() => act(() => acceptFriend(f.handle))} className="text-xs px-3 py-1 rounded-full bg-aura-gold text-ink font-semibold">accept</button>
                <button onClick={() => act(() => declineFriend(f.handle))} className="text-xs px-3 py-1 rounded-full bg-white/10 text-white">decline</button>
              </FriendCard>
            ))}
          </div>
        </section>
      )}

      {outgoing.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs uppercase tracking-widest text-white/40 mb-2">pending</h2>
          <div className="divide-y divide-white/5 rounded-lg overflow-hidden bg-white/5">
            {outgoing.map((f) => (
              <FriendCard key={f.handle} f={f}>
                <span className="text-xs text-white/40">waiting…</span>
                <button onClick={() => act(() => declineFriend(f.handle))} className="text-xs px-2 py-1 rounded-full bg-white/10 text-white">cancel</button>
              </FriendCard>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <h2 className="text-xs uppercase tracking-widest text-white/40 mb-2">mutuals ({mutual.length})</h2>
        {mutual.length === 0 && <div className="text-white/40 text-sm">no mutuals yet. find someone to glaze.</div>}
        <div className="divide-y divide-white/5 rounded-lg overflow-hidden bg-white/5">
          {mutual.map((f) => (
            <FriendCard key={f.handle} f={f}>
              <Link href={`/app?target=${f.handle}`} className="text-xs px-3 py-1 rounded-full bg-aura-gold text-ink font-semibold">scan</Link>
              <button onClick={() => act(() => blockUser(f.handle))} className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/50">block</button>
            </FriendCard>
          ))}
        </div>
      </section>
    </div>
  );
}

function FriendCard({ f, children }: { f: FriendRow; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-3 py-3">
      <div>
        <div className="text-sm">@{f.handle}</div>
        <div className="text-[10px] text-white/40">
          <span className="text-aura-gold">{f.current_aura.toLocaleString()} aura</span>
          <span className="mx-1">·</span>
          <span className="text-brick-piss">{f.current_ls.toLocaleString()} L</span>
        </div>
      </div>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}
