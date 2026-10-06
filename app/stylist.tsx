import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../src/components/Toast';
import { LookCollage } from '../src/components/ui';
import { dayKey, DAILY_OCCASIONS, isCold, stylistReply, weatherFor, type StylistMode, type StylistReply } from '../src/lib/styling';
import { useApp } from '../src/state/AppState';
import { useReserveLook } from '../src/state/useReserveLook';
import { colors, money, radius, type } from '../src/theme';

type Msg = { id: number; from: 'me' | 'stylist'; text: string; reply?: StylistReply };

/** Opacity steps for a soft horizontal band (no gradient library needed). */
const WASH = Array.from({ length: 40 }, (_, i) => 0.55 * Math.exp(-(((i - 19.5) / 9) ** 2)));

const PROMPTS = ['Client meeting tomorrow', 'Dinner date, something black', 'Weekend look under $3k', 'Cocktail party, gold accents'];

const greeting = (d: Date) => (d.getHours() < 12 ? 'Good morning' : d.getHours() < 17 ? 'Good afternoon' : 'Good evening');

/**
 * Stylist chat, after Alta's "How can I style you?". Replies are composed on the device from
 * nearby stock (or your closet) by reading the occasion, colors and budget in your message.
 */
export default function Stylist() {
  const insets = useSafeAreaInsets();
  const { place, radiusMi, closet, saveLook } = useApp();
  const reserve = useReserveLook();
  const [toast, showToast] = useToast();
  const [mode, setMode] = useState<StylistMode>('nearby');
  const [text, setText] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [thinking, setThinking] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const today = dayKey(new Date());

  const send = (raw?: string) => {
    const q = (raw ?? text).trim();
    if (!q || thinking) return;
    setText('');
    const id = Date.now();
    setMsgs((m) => [...m, { id, from: 'me', text: q }]);
    setThinking(true);
    setTimeout(() => {
      const reply = stylistReply(q, {
        from: place.coord,
        radiusMi,
        cold: isCold(weatherFor(today, place.coord)),
        mode,
        closet: closet.map((c) => c.productId),
        seed: `${today}|${id}`,
      });
      setMsgs((m) => [...m, { id: id + 1, from: 'stylist', text: reply.text, reply }]);
      setThinking(false);
      setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
    }, 450);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F3F3F1' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Soft green wash, as on Alta's stylist screen. */}
      <View pointerEvents="none" style={styles.wash}>
        {WASH.map((o, i) => (
          <View key={i} style={{ flex: 1, backgroundColor: '#BFDCA0', opacity: o }} />
        ))}
      </View>

      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <Pressable testID="close-stylist" accessibilityRole="button" accessibilityLabel="Close" onPress={() => router.back()} style={styles.close}>
          <Ionicons name="close" size={20} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView ref={scroll} contentContainerStyle={[styles.body, !msgs.length && { flexGrow: 1, justifyContent: 'center' }]} keyboardShouldPersistTaps="handled">
        {!msgs.length ? (
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={styles.hello}>{greeting(new Date())}</Text>
            <Text style={styles.hello}>
              How can I <Text style={type.accent}>style</Text> you?
            </Text>
            <Text style={[type.small, { marginTop: 10, textAlign: 'center', maxWidth: 280 }]}>
              {mode === 'nearby' ? `I build looks from what's on shelves within ${radiusMi} mi.` : 'I build looks from pieces in your closet.'}
            </Text>
            <View style={styles.prompts}>
              {PROMPTS.map((p) => (
                <Pressable key={p} testID={`prompt-${p}`} accessibilityRole="button" onPress={() => send(p)} style={styles.prompt}>
                  <Text style={styles.promptText}>{p}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {msgs.map((m) =>
          m.from === 'me' ? (
            <View key={m.id} style={styles.mine}>
              <Text style={styles.mineText}>{m.text}</Text>
            </View>
          ) : (
            <View key={m.id} testID="stylist-reply" style={styles.theirs}>
              <Text style={styles.theirsText}>{m.text}</Text>
              {m.reply?.look ? (
                <View style={styles.lookCard}>
                  <LookCollage items={m.reply.look.items} height={240} />
                  <Text style={[type.small, { marginTop: 8 }]}>
                    {m.reply.look.items.length} pieces · {money(m.reply.look.total)}
                  </Text>
                  <View style={styles.lookActions}>
                    <Pressable
                      testID="stylist-save"
                      accessibilityRole="button"
                      style={[styles.btn, styles.btnLight]}
                      onPress={() => {
                        const preset = DAILY_OCCASIONS.find((o) => o.key === m.reply!.occasion)!;
                        saveLook({ day: today, title: preset.title, items: m.reply!.look!.items });
                        showToast({ text: 'Saved look to today' });
                      }}
                    >
                      <Text style={styles.btnLightText}>Save to today</Text>
                    </Pressable>
                    <Pressable
                      testID="stylist-edit"
                      accessibilityRole="button"
                      style={[styles.btn, styles.btnLight]}
                      onPress={() => router.push({ pathname: '/look', params: { items: m.reply!.look!.items.join(','), title: 'Stylist pick' } })}
                    >
                      <Text style={styles.btnLightText}>Edit</Text>
                    </Pressable>
                    {mode === 'nearby' ? (
                      <Pressable
                        testID="stylist-reserve"
                        accessibilityRole="button"
                        style={styles.btn}
                        onPress={() => showToast({ text: reserve(m.reply!.look!.items), action: { label: 'View bag', onPress: () => router.push('/cart') } })}
                      >
                        <Text style={styles.btnText}>Reserve</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              ) : null}
            </View>
          ),
        )}
        {thinking ? <Text style={[type.small, { marginLeft: 4 }]}>Styling…</Text> : null}
      </ScrollView>

      <View style={[styles.composer, { marginBottom: Math.max(insets.bottom, 12) }]}>
        <TextInput
          testID="stylist-input"
          value={text}
          onChangeText={setText}
          placeholder="e.g. business casual look"
          placeholderTextColor={colors.muted}
          style={styles.input}
          onSubmitEditing={() => send()}
          returnKeyType="send"
          accessibilityLabel="Ask the stylist"
          multiline={false}
        />
        <View style={styles.composerRow}>
          <Pressable
            testID="stylist-mode"
            accessibilityRole="button"
            accessibilityLabel={`Mode: ${mode === 'nearby' ? 'Nearby stock' : 'My closet'}. Tap to switch`}
            onPress={() => setMode((m) => (m === 'nearby' ? 'closet' : 'nearby'))}
            style={styles.mode}
          >
            <Ionicons name={mode === 'nearby' ? 'location-outline' : 'shirt-outline'} size={14} color={colors.ink} />
            <Text style={styles.modeText}>{mode === 'nearby' ? 'Nearby stock' : 'My closet'}</Text>
            <Ionicons name="swap-horizontal" size={13} color={colors.muted} />
          </Pressable>
          <Pressable testID="stylist-send" accessibilityRole="button" accessibilityLabel="Send" onPress={() => send()} style={[styles.send, !text.trim() && { opacity: 0.35 }]} disabled={!text.trim()}>
            <Ionicons name="arrow-forward" size={18} color={colors.onAccent} />
          </Pressable>
        </View>
      </View>
      {toast}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wash: { position: 'absolute', left: 0, right: 0, top: '18%', height: '38%' },
  top: { paddingHorizontal: 16 },
  close: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 16, gap: 14 },
  hello: { fontSize: 19, color: colors.ink, textAlign: 'center' },
  prompts: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 22 },
  prompt: { backgroundColor: colors.bg, borderRadius: radius.pill, paddingVertical: 9, paddingHorizontal: 14 },
  promptText: { fontSize: 13, color: colors.ink },
  mine: { alignSelf: 'flex-end', maxWidth: '82%', backgroundColor: colors.ink, borderRadius: 18, paddingVertical: 10, paddingHorizontal: 14 },
  mineText: { color: colors.onAccent, fontSize: 15 },
  theirs: { alignSelf: 'stretch' },
  theirsText: { color: colors.ink, fontSize: 15, lineHeight: 21 },
  lookCard: { backgroundColor: colors.bg, borderRadius: radius.lg, padding: 10, marginTop: 10 },
  lookActions: { flexDirection: 'row', gap: 6, marginTop: 10 },
  btn: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: radius.pill, backgroundColor: colors.accent },
  btnText: { color: colors.onAccent, fontSize: 13, fontWeight: '600' },
  btnLight: { backgroundColor: colors.raised },
  btnLightText: { color: colors.ink, fontSize: 13, fontWeight: '500' },
  composer: { marginHorizontal: 12, backgroundColor: colors.bg, borderRadius: radius.lg, padding: 12, gap: 10 },
  input: { fontSize: 15, color: colors.ink, paddingVertical: 6 },
  composerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mode: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.raised, borderRadius: radius.pill, paddingVertical: 7, paddingHorizontal: 12 },
  modeText: { fontSize: 13, color: colors.ink },
  send: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
});
