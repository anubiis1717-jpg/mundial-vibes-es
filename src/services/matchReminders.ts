// Recordatorios LOCALES de inicio de partido (sin servidor). Programa una
// notificación en el teléfono ~15 min antes del saque, usando la hora de
// kickoff que ya conocemos. En web no se programa nada (no hay teléfono), pero
// el toggle se guarda igual para poder ver la UI. En nativo usa el plugin
// @capacitor/local-notifications.

import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

const KEY = "futhora.reminders.v1";
const LEAD_MIN = 15; // avisamos 15 minutos antes del saque

interface Rec { kickoffUtc: string | null; title: string; body: string }
type Store = Record<string, Rec>;

export interface ReminderInput {
  matchId: string;
  kickoffUtc: string | null;
  title: string;
  body: string;
}

function readMap(): Store {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}") as Store; } catch { return {}; }
}
function writeMap(m: Store) {
  try { localStorage.setItem(KEY, JSON.stringify(m)); } catch {}
}

export function isReminderOn(matchId: string): boolean {
  return matchId in readMap();
}

// ID numérico estable y positivo a partir del matchId (lo exige el plugin).
function notifId(matchId: string): number {
  let h = 0;
  for (let i = 0; i < matchId.length; i++) h = (h * 31 + matchId.charCodeAt(i)) | 0;
  return (Math.abs(h) % 2_000_000_000) + 1;
}

// Momento en que debe sonar: kickoff − 15 min, solo si aún es futuro.
function fireAt(kickoffUtc: string | null): Date | null {
  if (!kickoffUtc) return null;
  const t = new Date(kickoffUtc).getTime();
  if (!Number.isFinite(t)) return null;
  const at = t - LEAD_MIN * 60 * 1000;
  return at > Date.now() ? new Date(at) : null;
}

async function ensurePermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true; // web: permitimos el toggle, no programamos
  try {
    const chk = await LocalNotifications.checkPermissions();
    if (chk.display === "granted") return true;
    const req = await LocalNotifications.requestPermissions();
    return req.display === "granted";
  } catch {
    return false;
  }
}

async function scheduleNative(matchId: string, r: Rec): Promise<void> {
  const at = fireAt(r.kickoffUtc);
  if (!at) return;
  try {
    await LocalNotifications.schedule({
      notifications: [{ id: notifId(matchId), title: r.title, body: r.body, schedule: { at } }],
    });
  } catch { /* sin bloquear la UI */ }
}

async function cancelNative(matchId: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try { await LocalNotifications.cancel({ notifications: [{ id: notifId(matchId) }] }); } catch {}
}

// Activa el recordatorio. Devuelve false si faltó el permiso de notificaciones.
export async function addReminder(input: ReminderInput): Promise<boolean> {
  const granted = await ensurePermission();
  if (!granted) return false;
  const rec: Rec = { kickoffUtc: input.kickoffUtc, title: input.title, body: input.body };
  const m = readMap();
  m[input.matchId] = rec;
  writeMap(m);
  if (Capacitor.isNativePlatform()) await scheduleNative(input.matchId, rec);
  return true;
}

export async function removeReminder(matchId: string): Promise<void> {
  const m = readMap();
  delete m[matchId];
  writeMap(m);
  await cancelNative(matchId);
}

// Al abrir la app: limpia los que ya empezaron y reprograma los futuros (por si
// el sistema operativo los descartó o la app se reinstaló).
export async function reconcileReminders(): Promise<void> {
  const m = readMap();
  const ids = Object.keys(m);
  if (ids.length === 0) return;
  if (Capacitor.isNativePlatform()) await ensurePermission();
  let changed = false;
  for (const id of ids) {
    const at = fireAt(m[id].kickoffUtc);
    if (!at) {
      delete m[id];
      changed = true;
      await cancelNative(id);
    } else if (Capacitor.isNativePlatform()) {
      await scheduleNative(id, m[id]);
    }
  }
  if (changed) writeMap(m);
}
