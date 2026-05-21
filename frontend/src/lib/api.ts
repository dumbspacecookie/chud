/**
 *   "REST is just leverage with extra steps, Morty. You GET, you POST,
 *   you bearer-token your way into a JSON payload and the server hands
 *   you back a status code like it's *bzrp* doing you a favor. Crapulous
 *   protocol but it ships." — Terl, network engineer, has opinions.
 */
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const TOKEN_KEY = "chud_token";

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((cfg) => {
  if (typeof window !== "undefined") {
    const tok = window.localStorage.getItem(TOKEN_KEY);
    if (tok) cfg.headers.Authorization = `Bearer ${tok}`;
  }
  return cfg;
});

export function setToken(tok: string) {
  window.localStorage.setItem(TOKEN_KEY, tok);
}
export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export type ScanMode = "glaze" | "chud";

export interface ScanResult {
  interaction_id: number;
  mode: ScanMode;
  your_delta_currency: "aura" | "ls";
  your_delta: number;
  target_delta_aura: number;
  new_aura_balance: number;
  new_ls_balance: number;
}

export async function postScan(
  target_handle: string,
  mode: ScanMode,
  raw_score: number,
  session_id?: string,
): Promise<ScanResult> {
  const { data } = await api.post<ScanResult>("/scan", {
    target_handle,
    mode,
    raw_score,
    session_id,
  });
  return data;
}

export interface MeResponse {
  id: number;
  handle: string;
  saiyan_name: string | null;
  alignment_pct: number;
  current_aura: number;
  current_ls: number;
  is_18_plus: boolean;
  streak: number;
}

export async function getMe(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>("/auth/me");
  return data;
}

export interface LeaderRow {
  rank: number;
  handle: string;
  saiyan_name: string | null;
  score: number;
  alignment_pct: number;
}

export async function getLeaderboard(board: "fame" | "shame"): Promise<LeaderRow[]> {
  const { data } = await api.get(`/leaderboard?board=${board}&scope=global`);
  return data.rows;
}

export interface CapsulePullResult {
  item: {
    id: number;
    slug: string;
    name: string;
    side: "glazer" | "chud" | "neutral";
    rarity: "common" | "rare" | "epic" | "legendary" | "mythic";
    slot: string;
    asset_url: string | null;
  };
  was_pity: boolean;
  pull_no: number;
}

export async function pullCapsule(paid_with: "aura" | "ls" | "free"): Promise<CapsulePullResult> {
  const { data } = await api.post("/capsule/pull", { paid_with });
  return data;
}

export interface CapsuleState {
  free_pull_available: boolean;
  next_free_at: string | null;
  total_pulls: number;
  cost_aura: number;
  cost_ls: number;
}

export async function getCapsuleState(): Promise<CapsuleState> {
  const { data } = await api.get<CapsuleState>("/capsule/state");
  return data;
}

// === inventory ===

export type CosmeticSide = "glazer" | "chud" | "neutral";
export type CosmeticRarity = "common" | "rare" | "epic" | "legendary" | "mythic";

export interface InventoryRow {
  inventory_id: number;
  cosmetic_id: number;
  slug: string;
  name: string;
  side: CosmeticSide;
  rarity: CosmeticRarity;
  slot: string;
  asset_url: string | null;
  equipped: boolean;
}

export async function getInventory(): Promise<InventoryRow[]> {
  const { data } = await api.get<InventoryRow[]>("/inventory");
  return data;
}

export async function equipCosmetic(inventory_id: number, equipped: boolean) {
  const { data } = await api.post("/inventory/equip", { inventory_id, equipped });
  return data;
}

// === battles ===

export type BattleState = "pending" | "countdown" | "live" | "resolving" | "settled" | "canceled";

export interface Battle {
  id: number;
  state: BattleState;
  player_a: string;
  player_b: string;
  mode: string;
  countdown_at: string | null;
  live_at: string | null;
  settle_at: string | null;
  winner: string | null;
  a_score: number;
  b_score: number;
  seconds_remaining: number;
}

export interface MyBattles {
  pending_incoming: Battle[];
  pending_outgoing: Battle[];
  active: Battle[];
  recent_settled: Battle[];
}

export async function challengeBattle(target_handle: string, mode: string = "rizz"): Promise<Battle> {
  const { data } = await api.post<Battle>("/battle/challenge", { target_handle, mode });
  return data;
}

export async function acceptBattle(battle_id: number): Promise<Battle> {
  const { data } = await api.post<Battle>(`/battle/${battle_id}/accept`);
  return data;
}

export async function tipBattle(
  battle_id: number,
  side_handle: string,
  currency: "aura" | "ls",
  amount: number,
) {
  const { data } = await api.post(`/battle/${battle_id}/tip`, { side_handle, currency, amount });
  return data;
}

export async function getBattle(battle_id: number): Promise<Battle> {
  const { data } = await api.get<Battle>(`/battle/${battle_id}`);
  return data;
}

export async function myBattles(): Promise<MyBattles> {
  const { data } = await api.get<MyBattles>("/battle/me/list");
  return data;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  handle: string;
  is_18_plus: boolean;
}

export async function signup(
  email: string,
  password: string,
  handle: string,
  dob: string,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/signup", { email, password, handle, dob });
  setToken(data.access_token);
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  setToken(data.access_token);
  return data;
}

export function logout() {
  clearToken();
}

// graceful error extractor — fastapi wraps detail in {detail:{code,message}} sometimes
export function errMsg(e: any): string {
  const d = e?.response?.data?.detail;
  if (typeof d === "string") return d;
  if (d?.message) return d.message;
  if (Array.isArray(d) && d[0]?.msg) return d[0].msg;
  return e?.message ?? "something broke";
}

// === friends ===

export type FriendStatus = "pending_outgoing" | "pending_incoming" | "mutual";
export interface FriendRow {
  handle: string;
  saiyan_name: string | null;
  status: FriendStatus;
  current_aura: number;
  current_ls: number;
}

export async function listFriends(): Promise<FriendRow[]> {
  const { data } = await api.get<{ friends: FriendRow[] }>("/friends");
  return data.friends;
}

export async function requestFriend(handle: string) {
  const { data } = await api.post("/friends/request", { handle });
  return data;
}

export async function acceptFriend(handle: string) {
  const { data } = await api.post("/friends/accept", { handle });
  return data;
}

export async function declineFriend(handle: string) {
  const { data } = await api.post("/friends/decline", { handle });
  return data;
}

export async function blockUser(handle: string) {
  const { data } = await api.post("/friends/block", { handle });
  return data;
}

export async function searchHandles(q: string): Promise<{ handle: string; saiyan_name: string | null }[]> {
  const { data } = await api.get(`/friends/search?q=${encodeURIComponent(q)}`);
  return data;
}
