/** Thin client for the Quad server (Next.js) HTTP API. */
import { QUAD_URL } from '@/lib/config';

export type FirstMessage = {
  code: string;
  body: string;
  smsUrl: string | null;
  smsUrlAndroid: string | null;
  needsNumber: boolean;
  goUrl: string;
};

export type SetupState = {
  student: { id: string; firstName: string; school: string; dailyMinutes?: number };
  canvas: 'in' | 'pending';
  canvasCourses?: number;
  google: 'in' | 'pending';
  googleUrl: string;
  notionUrl: string | null;
  phoneBound: boolean;
  firstMessage: FirstMessage;
  connections: { firstName: string }[];
  plans: { courseCode: string; when: string; location: string | null }[];
  bumpUrl: string;
};

export type Peer = { firstName: string; handle: string; school: string; photoUrl?: string };
export type Intent = 'study' | 'build' | 'hang' | 'event' | 'other';
export type MotionRes = { status: 'waiting' } | { status: 'matched'; sessionId: string; code: string; peer: Peer };
export type ConfirmRes = { status: 'pending_peer' | 'connected' | 'declined'; connectionId?: string };
export type SessionRes = MotionRes & { aAccept?: boolean | null; bAccept?: boolean | null; expiresAt?: string };

export class QuadError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${QUAD_URL}${path}`, {
      ...init,
      headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
    });
  } catch {
    throw new QuadError(0, "Can't reach Quad. Check your connection and try again.");
  }
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const d = data as { error?: unknown; message?: unknown } | null;
    const msg = typeof d?.error === 'string' ? d.error : typeof d?.message === 'string' ? d.message : `Quad returned ${res.status}`;
    throw new QuadError(res.status, msg);
  }
  return data as T;
}

const post = <T>(path: string, body: unknown) => call<T>(path, { method: 'POST', body: JSON.stringify(body) });

export const createSetup = (args: { firstName: string; school: string; dailyMinutes: number }) =>
  post<{ url: string; token: string }>('/api/setup', args);

export const getSetupState = (token: string) => call<SetupState>(`/api/setup/state?token=${encodeURIComponent(token)}`);

export const connectCanvas = (args: { token: string; canvasBaseUrl: string; canvasToken: string }) =>
  post<{ ok: boolean; courses?: number; reason?: string }>('/api/setup/canvas', args);

/** state.bumpUrl is `<app>/bump?t=<signed token>`; the bump API wants it as `st_<token>`. */
export function ownerTokenFromBumpUrl(bumpUrl: string | undefined | null): string | null {
  if (!bumpUrl) return null;
  const m = /[?&]t=([^&#]+)/.exec(bumpUrl);
  return m ? `st_${decodeURIComponent(m[1])}` : null;
}

export const bumpMotion = (args: { ownerToken: string; ts: number; lat?: number; lng?: number; intent?: Intent }) =>
  post<MotionRes>('/api/bump/motion', args);

export const bumpConfirm = (args: { ownerToken: string; sessionId: string; accept: boolean; intent: Intent }) =>
  post<ConfirmRes>('/api/bump/confirm', args);

export const bumpSession = (sessionId: string, ownerToken: string) =>
  call<SessionRes>(`/api/bump/session/${encodeURIComponent(sessionId)}?ownerToken=${encodeURIComponent(ownerToken)}`);
