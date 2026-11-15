/** Device-local session: device id + Quad setup token in SecureStore, setup state from the Quad server. */
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import * as quad from '@/lib/quad';

const K = { device: 'quad.deviceId', token: 'quad.setupToken', url: 'quad.setupUrl', student: 'quad.studentId' };

async function read(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}
async function write(key: string, value: string | null): Promise<void> {
  try {
    if (value === null) await SecureStore.deleteItemAsync(key);
    else await SecureStore.setItemAsync(key, value);
  } catch {
    // Storage is best-effort; the session still works in memory.
  }
}

const newDeviceId = () => `dev_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;

type Session = {
  ready: boolean;
  deviceId: string | null;
  token: string | null;
  setupUrl: string | null;
  /** Quad server student id; drives the Activity feed. */
  studentId: string | null;
  state: quad.SetupState | null;
  loading: boolean;
  error: string | null;
  create: (args: { firstName: string; school: string; dailyMinutes: number }) => Promise<{ token: string; url: string }>;
  refresh: () => Promise<quad.SetupState | null>;
  reset: () => Promise<void>;
};

const Ctx = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [setupUrl, setSetupUrl] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [state, setState] = useState<quad.SetupState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(null);

  const load = useCallback(async (t: string): Promise<quad.SetupState | null> => {
    setLoading(true);
    try {
      const s = await quad.getSetupState(t);
      if (tokenRef.current !== t) return null;
      setState(s);
      setError(null);
      setStudentId(s.student.id);
      void write(K.student, s.student.id);
      return s;
    } catch (e) {
      if (tokenRef.current === t) setError(e instanceof Error ? e.message : 'Something went wrong');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      let dev = await read(K.device);
      if (!dev) {
        dev = newDeviceId();
        await write(K.device, dev);
      }
      const [t, u, sid] = await Promise.all([read(K.token), read(K.url), read(K.student)]);
      setDeviceId(dev);
      setToken(t);
      tokenRef.current = t;
      setSetupUrl(u);
      setStudentId(sid);
      setReady(true);
      if (t) void load(t);
    })();
  }, [load]);

  const value = useMemo<Session>(
    () => ({
      ready,
      deviceId,
      token,
      setupUrl,
      studentId,
      state,
      loading,
      error,
      create: async (args) => {
        const res = await quad.createSetup(args);
        tokenRef.current = res.token;
        setToken(res.token);
        setSetupUrl(res.url);
        await Promise.all([write(K.token, res.token), write(K.url, res.url)]);
        void load(res.token);
        return res;
      },
      refresh: async () => (tokenRef.current ? load(tokenRef.current) : null),
      reset: async () => {
        tokenRef.current = null;
        setToken(null);
        setSetupUrl(null);
        setStudentId(null);
        setState(null);
        setError(null);
        await Promise.all([write(K.token, null), write(K.url, null), write(K.student, null)]);
      },
    }),
    [ready, deviceId, token, setupUrl, studentId, state, loading, error, load],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): Session {
  const s = useContext(Ctx);
  if (!s) throw new Error('useSession must be used inside SessionProvider');
  return s;
}
