import { useMutation } from 'convex/react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { api } from '../../convex/_generated/api';
import { Badge, Body, Button, Card, ErrorText, Field, Heading, Screen, usePalette } from '@/components/ui';
import { useSession } from '@/lib/session';

const MINUTE_CHOICES = [30, 60, 90, 120];

export default function HomeScreen() {
  const session = useSession();
  const p = usePalette();

  if (!session.ready) {
    return (
      <Screen title="Quad" testID="home-loading">
        <ActivityIndicator color={p.accent} accessibilityLabel="Loading" />
      </Screen>
    );
  }
  return session.token ? <Status /> : <SetupForm />;
}

function SetupForm() {
  const session = useSession();
  const upsert = useMutation(api.students.upsert);
  const [firstName, setFirstName] = useState('');
  const [school, setSchool] = useState('');
  const [minutes, setMinutes] = useState(60);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = firstName.trim().length >= 1 && school.trim().length >= 2;

  const submit = async () => {
    if (!valid || busy || !session.deviceId) return;
    setBusy(true);
    setError(null);
    const profile = { firstName: firstName.trim(), school: school.trim(), dailyMinutes: minutes };
    try {
      const res = await session.create(profile);
      // Mirror the profile into Convex; a Convex hiccup must not block setup.
      upsert({ deviceId: session.deviceId, ...profile, setupToken: res.token }).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Setup failed. Try again.');
      setBusy(false);
    }
  };

  return (
    <Screen title="Quad" subtitle="Your campus study agent, in iMessage. Set it up in a minute." testID="home-setup">
      <Card>
        <Field
          label="First name"
          testID="setup-first-name"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Maya"
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={40}
          returnKeyType="next"
        />
        <Field
          label="School"
          testID="setup-school"
          value={school}
          onChangeText={setSchool}
          placeholder="UC Berkeley"
          autoCorrect={false}
          maxLength={60}
          returnKeyType="done"
        />
        <View style={{ gap: 8 }}>
          <Body muted>Study time per day</Body>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {MINUTE_CHOICES.map((m) => (
              <View key={m} style={{ flex: 1 }}>
                <Button
                  testID={`setup-minutes-${m}`}
                  label={`${m}`}
                  accessibilityLabel={`${m} minutes per day${minutes === m ? ', selected' : ''}`}
                  variant={minutes === m ? 'primary' : 'secondary'}
                  onPress={() => setMinutes(m)}
                />
              </View>
            ))}
          </View>
        </View>
        {error ? <ErrorText testID="setup-error">{error}</ErrorText> : null}
        <Button testID="setup-submit" label="Create my agent" big onPress={submit} disabled={!valid} busy={busy} />
      </Card>
    </Screen>
  );
}

function Status() {
  const session = useSession();
  const upsert = useMutation(api.students.upsert);
  const { state, deviceId, token } = session;
  const [notice, setNotice] = useState<string | null>(null);

  // Once the Quad server tells us who we are, link the Quad student id in Convex (drives the Activity feed).
  const quadStudentId = state?.student.id;
  useEffect(() => {
    if (!state || !deviceId || !token || !quadStudentId) return;
    upsert({
      deviceId,
      firstName: state.student.firstName,
      school: state.student.school,
      dailyMinutes: state.student.dailyMinutes ?? 60,
      setupToken: token,
      quadStudentId,
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quadStudentId, deviceId, token]);

  const finishSetup = async () => {
    if (!session.setupUrl) return;
    try {
      await WebBrowser.openBrowserAsync(session.setupUrl);
    } catch {
      await Linking.openURL(session.setupUrl).catch(() => setNotice("Couldn't open the browser."));
    }
    void session.refresh();
  };

  const textQuad = async () => {
    const fm = state?.firstMessage;
    if (!fm) return;
    const target = fm.smsUrl ?? fm.goUrl;
    try {
      await Linking.openURL(target);
    } catch {
      // Simulators have no Messages app.
      setNotice(`Messages isn't available here. On your phone, text Quad: "${fm.body}"`);
    }
  };

  const name = state?.student.firstName;
  return (
    <Screen title={name ? `Hi, ${name}` : 'Quad'} subtitle="Your agent is one text away." testID="home-status">
      <Card testID="home-connections">
        <Heading>Connections</Heading>
        {state ? (
          <View style={{ gap: 10 }}>
            <Badge
              testID="badge-canvas"
              tone={state.canvas === 'in' ? 'good' : 'warn'}
              label={
                state.canvas === 'in'
                  ? `Canvas connected${typeof state.canvasCourses === 'number' ? ` · ${state.canvasCourses} courses` : ''}`
                  : 'Canvas not connected'
              }
            />
            <Badge
              testID="badge-google"
              tone={state.google === 'in' ? 'good' : 'warn'}
              label={state.google === 'in' ? 'Google connected' : 'Google not connected'}
            />
            <Badge
              testID="badge-phone"
              tone={state.phoneBound ? 'good' : 'warn'}
              label={state.phoneBound ? 'iMessage linked' : 'iMessage not linked yet'}
            />
          </View>
        ) : session.error ? (
          <ErrorText testID="home-error">{session.error}</ErrorText>
        ) : (
          <Body muted>Checking your connections…</Body>
        )}
        <Button testID="finish-setup" label="Finish setup" variant="secondary" onPress={finishSetup} disabled={!session.setupUrl} />
        <Button testID="refresh-status" label="Refresh" variant="ghost" onPress={() => void session.refresh()} busy={session.loading} />
      </Card>

      <Card>
        <Heading>{state?.phoneBound ? 'Talk to Quad' : 'Send your first text'}</Heading>
        <Body muted>
          {state?.firstMessage ? `Opens Messages with "${state.firstMessage.body}" ready to send.` : 'Quad lives in iMessage.'}
        </Body>
        <Button testID="text-quad" label="Text Quad" big onPress={textQuad} disabled={!state?.firstMessage} />
        {notice ? <Body testID="home-notice">{notice}</Body> : null}
      </Card>

      {state && (state.plans.length > 0 || state.connections.length > 0) ? (
        <Card testID="home-social">
          <Heading>Coming up</Heading>
          {state.plans.map((pl, i) => (
            <Body key={`${pl.courseCode}-${i}`}>
              {pl.courseCode} · {new Date(pl.when).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' })}
              {pl.location ? ` · ${pl.location}` : ''}
            </Body>
          ))}
          {state.connections.length > 0 ? (
            <Body muted>Connected with {state.connections.map((c) => c.firstName).join(', ')}</Body>
          ) : null}
        </Card>
      ) : null}

      <Button testID="reset-setup" label="Start over" variant="ghost" onPress={() => void session.reset()} />
    </Screen>
  );
}
