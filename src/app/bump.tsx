import { useMutation } from 'convex/react';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { Accelerometer } from 'expo-sensors';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { api } from '../../convex/_generated/api';
import { Body, Button, Card, ErrorText, Heading, Screen, usePalette } from '@/components/ui';
import * as quad from '@/lib/quad';
import { useSession } from '@/lib/session';

const SPIKE_G = 2.5;
const DEBOUNCE_MS = 300;
const WAIT_POLLS = 15; // keep "waiting" on screen ~15 s so a partner (or a UI test) can catch it
const PEER_POLLS = 30;
const POLL_MS = 1000;

type Phase =
  | { name: 'idle' }
  | { name: 'sending' }
  | { name: 'waiting' }
  | { name: 'matched'; sessionId: string; code: string; peer: quad.Peer }
  | { name: 'pending_peer'; sessionId: string; peer: quad.Peer }
  | { name: 'connected'; peer: quad.Peer }
  | { name: 'declined' };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function BumpScreen() {
  const session = useSession();
  const p = usePalette();
  const record = useMutation(api.bumps.record);
  const [phase, setPhase] = useState<Phase>({ name: 'idle' });
  const [error, setError] = useState<string | null>(null);
  const [sensor, setSensor] = useState<'unknown' | 'on' | 'off'>('unknown');
  const [locationOn, setLocationOn] = useState(false);

  const phaseRef = useRef<Phase['name']>('idle');
  phaseRef.current = phase.name;
  const lastSpike = useRef(0);
  const run = useRef(0); // bumps a counter so stale polls stop when a new flow starts or the screen resets
  const tokenRef = useRef<string | null>(null);

  const ownerToken = async (fresh = false): Promise<string | null> => {
    const state = fresh || !session.state ? await session.refresh() : session.state;
    return quad.ownerTokenFromBumpUrl(state?.bumpUrl);
  };

  const position = async (): Promise<{ lat?: number; lng?: number }> => {
    try {
      // Never prompt mid-bump: only use location if it was already granted.
      const perm = await Location.getForegroundPermissionsAsync();
      if (!perm.granted) return {};
      const pos = await Location.getLastKnownPositionAsync();
      return pos ? { lat: pos.coords.latitude, lng: pos.coords.longitude } : {};
    } catch {
      return {};
    }
  };

  const bump = useCallback(async () => {
    if (phaseRef.current !== 'idle' && phaseRef.current !== 'declined' && phaseRef.current !== 'connected') return;
    const mine = ++run.current;
    const ts = Date.now();
    phaseRef.current = 'sending';
    setPhase({ name: 'sending' });
    setError(null);

    const { lat, lng } = await position();
    if (session.deviceId) record({ deviceId: session.deviceId, ts, lat, lng }).catch(() => {});

    try {
      let token = await ownerToken();
      if (!token) throw new quad.QuadError(0, 'Finish setup on the Home tab before bumping.');
      const send = async (): Promise<quad.MotionRes> => {
        try {
          return await quad.bumpMotion({ ownerToken: token!, ts, lat, lng });
        } catch (e) {
          // Bump tokens last an hour; fetch a fresh one once.
          if (e instanceof quad.QuadError && e.status === 401) {
            token = await ownerToken(true);
            if (token) return await quad.bumpMotion({ ownerToken: token, ts, lat, lng });
          }
          throw e;
        }
      };
      let res = await send();
      for (let i = 0; res.status === 'waiting' && i < WAIT_POLLS; i++) {
        if (run.current !== mine) return;
        setPhase({ name: 'waiting' });
        await sleep(POLL_MS);
        if (run.current !== mine) return;
        res = await send();
      }
      if (run.current !== mine) return;
      if (res.status === 'matched') {
        tokenRef.current = token;
        setPhase({ name: 'matched', sessionId: res.sessionId, code: res.code, peer: res.peer });
      } else {
        setPhase({ name: 'idle' });
        setError('No one bumped back. Try again together — both phones at the same moment.');
      }
    } catch (e) {
      if (run.current !== mine) return;
      setPhase({ name: 'idle' });
      setError(e instanceof Error ? e.message : 'Bump failed. Try again.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.state, session.deviceId]);

  const bumpRef = useRef(bump);
  bumpRef.current = bump;

  // Listen for a physical bump only while this tab is focused.
  useFocusEffect(
    useCallback(() => {
      let sub: { remove: () => void } | null = null;
      let cancelled = false;
      void (async () => {
        const ok = await Accelerometer.isAvailableAsync().catch(() => false);
        if (cancelled) return;
        setSensor(ok ? 'on' : 'off');
        if (!ok) return;
        Accelerometer.setUpdateInterval(50);
        sub = Accelerometer.addListener(({ x, y, z }) => {
          if (Math.sqrt(x * x + y * y + z * z) <= SPIKE_G) return;
          const now = Date.now();
          if (now - lastSpike.current < DEBOUNCE_MS) return;
          lastSpike.current = now;
          void bumpRef.current();
        });
      })();
      return () => {
        cancelled = true;
        sub?.remove();
      };
    }, []),
  );

  useEffect(() => {
    Location.getForegroundPermissionsAsync()
      .then((r) => setLocationOn(r.granted))
      .catch(() => {});
  }, []);

  const enableLocation = async () => {
    try {
      const r = await Location.requestForegroundPermissionsAsync();
      setLocationOn(r.granted);
    } catch {
      setLocationOn(false);
    }
  };

  const confirm = async (accept: boolean) => {
    if (phase.name !== 'matched' || !tokenRef.current) return;
    const { sessionId, peer } = phase;
    const token = tokenRef.current;
    const mine = ++run.current;
    setError(null);
    try {
      const res = await quad.bumpConfirm({ ownerToken: token, sessionId, accept, intent: 'study' });
      if (run.current !== mine) return;
      if (res.status === 'connected') return setPhase({ name: 'connected', peer });
      if (res.status === 'declined') return setPhase({ name: 'declined' });
      setPhase({ name: 'pending_peer', sessionId, peer });
      for (let i = 0; i < PEER_POLLS; i++) {
        await sleep(POLL_MS);
        if (run.current !== mine) return;
        const s = await quad.bumpSession(sessionId, token);
        if (run.current !== mine) return;
        if (s.aAccept === false || s.bAccept === false) return setPhase({ name: 'declined' });
        if (s.aAccept && s.bAccept) return setPhase({ name: 'connected', peer });
      }
      setPhase({ name: 'idle' });
      setError(`${peer.firstName} didn't confirm in time. Bump again to retry.`);
    } catch (e) {
      if (run.current !== mine) return;
      setError(e instanceof Error ? e.message : "Couldn't confirm. Try again.");
    }
  };

  const reset = () => {
    run.current++;
    setPhase({ name: 'idle' });
    setError(null);
  };

  const needsSetup = session.ready && !session.token;
  const busy = phase.name === 'sending' || phase.name === 'waiting';

  return (
    <Screen title="Bump" subtitle="Knock phones with a classmate to connect your agents." testID="bump-screen">
      <Card testID="bump-card">
        <View style={[styles.ring, { borderColor: busy ? p.accent : p.border }]}>
          <Text testID="bump-status" accessibilityLiveRegion="polite" style={[styles.status, { color: p.text }]}>
            {phase.name === 'idle' && 'Ready'}
            {phase.name === 'sending' && 'Bump!'}
            {phase.name === 'waiting' && 'Waiting for the other phone…'}
            {phase.name === 'matched' && phase.code}
            {phase.name === 'pending_peer' && `Waiting for ${phase.peer.firstName}…`}
            {phase.name === 'connected' && 'Connected'}
            {phase.name === 'declined' && 'Not connected'}
          </Text>
        </View>

        {phase.name === 'matched' ? (
          <>
            <Heading>
              {phase.peer.firstName} · {phase.peer.school}
            </Heading>
            <Body muted>Check that both phones show the same code, then confirm.</Body>
            <Button testID="bump-confirm" label={`Connect with ${phase.peer.firstName}`} big onPress={() => void confirm(true)} />
            <Button testID="bump-decline" label="Not them" variant="secondary" onPress={() => void confirm(false)} />
          </>
        ) : null}

        {phase.name === 'connected' ? (
          <Body testID="bump-connected">
            You and {phase.peer.firstName} are connected. Your agents will find a time to study — watch the Activity tab.
          </Body>
        ) : null}
        {phase.name === 'declined' ? <Body muted>No connection was made.</Body> : null}

        {needsSetup ? <Body muted testID="bump-needs-setup">Set up your agent on the Home tab first.</Body> : null}
        {error ? <ErrorText testID="bump-error">{error}</ErrorText> : null}

        {phase.name === 'idle' || phase.name === 'sending' || phase.name === 'waiting' ? (
          <Button testID="simulate-bump" label="Simulate bump" big onPress={() => void bump()} busy={busy} disabled={needsSetup} />
        ) : null}
        {phase.name === 'connected' || phase.name === 'declined' || phase.name === 'pending_peer' ? (
          <Button testID="bump-reset" label={phase.name === 'pending_peer' ? 'Cancel' : 'Bump again'} variant="secondary" onPress={reset} />
        ) : null}
      </Card>

      <Card>
        <Body muted testID="bump-sensor">
          {sensor === 'on'
            ? 'Motion sensor on. Hold your phone and knock it against theirs.'
            : sensor === 'off'
              ? 'No motion sensor here (simulator). Use Simulate bump.'
              : 'Checking motion sensor…'}
        </Body>
        {locationOn ? (
          <Body muted testID="bump-location-on">Location on — nearby bumps match more reliably.</Body>
        ) : (
          <Button testID="bump-enable-location" label="Use location for better matching" variant="ghost" onPress={() => void enableLocation()} />
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  ring: { minHeight: 150, borderRadius: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center', padding: 16 },
  status: { fontSize: 28, fontWeight: '700', textAlign: 'center', letterSpacing: 0.5 },
});
