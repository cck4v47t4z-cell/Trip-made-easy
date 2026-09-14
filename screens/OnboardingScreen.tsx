import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../lib/store';
import { useThemeColors, avatarColors } from '../lib/theme';
import { GradientView, Button } from '../components/primitives';

export function OnboardingScreen() {
  const { colors } = useThemeColors();
  const { completeOnboarding, user } = useStore();
  const navigation = useNavigation<any>();
  const [name, setName] = useState(user.name === 'Rahul' ? '' : user.name);

  const start = () => {
    completeOnboarding(name.trim() || 'Traveler');
    navigation.replace('Tabs');
  };

  const initials = (name.trim() || 'T').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.heroWrap}>
        <GradientView colors={['#3B6FF6', '#7B4DFF']} style={styles.heroIcon}>
          <Text style={styles.heroEmoji}>🧳</Text>
        </GradientView>
        <Text style={[styles.brand, { color: colors.label }]}>TripMate</Text>
        <Text style={[styles.tagline, { color: colors.secondaryLabel }]}>
          Trips, expenses & memories —{'\n'}all in one place.
        </Text>
      </View>

      <View style={styles.formWrap}>
        <Text style={[styles.formTitle, { color: colors.label }]}>Let's get started</Text>
        <Text style={[styles.formSub, { color: colors.secondaryLabel }]}>What should your friends call you?</Text>

        <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}>
          <View style={[styles.avatarPreview, { backgroundColor: avatarColors[0] }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.tertiaryLabel}
            style={[styles.input, { color: colors.label }]}
            returnKeyType="done"
            onSubmitEditing={start}
            autoFocus
            maxLength={24}
          />
        </View>

        <View style={{ marginTop: 12 }}>
          <Button label="Get Started" icon="arrow-forward" onPress={start} />
        </View>
        <Text style={[styles.hint, { color: colors.tertiaryLabel }]}>
          You can change this anytime in your profile.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  heroWrap: { alignItems: 'center', paddingTop: 88, paddingBottom: 36 },
  heroIcon: { width: 96, height: 96, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  heroEmoji: { fontSize: 44 },
  brand: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginTop: 8, lineHeight: 23 },
  formWrap: { paddingHorizontal: 24, marginTop: 12 },
  formTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  formSub: { fontSize: 15, fontWeight: '500', marginTop: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, borderWidth: StyleSheet.hairlineWidth },
  avatarPreview: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  input: { flex: 1, fontSize: 17, fontWeight: '600', marginLeft: 12, paddingVertical: 8 },
  hint: { fontSize: 13, fontWeight: '500', textAlign: 'center', marginTop: 16 },
});
