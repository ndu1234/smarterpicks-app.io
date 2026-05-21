import { View, Text, StyleSheet, TouchableOpacity, Linking, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Colors, Fonts, Spacing, Radius } from '@/constants/theme';
import { GoldButton } from '@/components/ui/GoldButton';
import { useAuth } from '@/hooks/useAuth';

const DISCORD_URL = 'https://discord.gg/smarterpicks';
const WHOP_PORTAL_URL = 'https://whop.com/hub/smarterpicks';

function Row({
  label,
  value,
  onPress,
  right,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      {right ?? (value && <Text style={styles.rowValue}>{value}</Text>)}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { member, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  if (!member) return null;

  const planLabel =
    member.planType === 'trial'
      ? `Free Trial · ends ${format(parseISO(member.trialEndsAt!), 'MMM d')}`
      : member.planType === 'annual'
      ? 'Annual Member'
      : 'Monthly Member';

  const memberSince = format(parseISO(member.memberSince), 'MMMM yyyy');

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.memberCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {member.username.slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.username}>{member.username}</Text>
            <Text style={styles.email}>{member.email}</Text>
          </View>
          <View style={styles.planBadge}>
            <Text style={styles.planText}>
              {member.planType === 'trial' ? 'TRIAL' : member.planType === 'annual' ? 'ANNUAL' : 'MONTHLY'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MEMBERSHIP</Text>
          <View style={styles.card}>
            <Row label="Plan" value={planLabel} />
            <View style={styles.rowDivider} />
            <Row label="Member since" value={memberSince} />
            <View style={styles.rowDivider} />
            <Row
              label="Manage subscription"
              value="Whop →"
              onPress={() => Linking.openURL(WHOP_PORTAL_URL)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
          <View style={styles.card}>
            <Row
              label="Daily picks alert"
              right={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: Colors.border, true: Colors.accentDim }}
                  thumbColor={notificationsEnabled ? Colors.accent : Colors.textDim}
                />
              }
            />
          </View>
          <Text style={styles.hint}>Alerts fire at 9AM ET when picks are live.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>COMMUNITY</Text>
          <View style={styles.card}>
            <Row
              label="Join the Discord"
              value="Open →"
              onPress={() => Linking.openURL(DISCORD_URL)}
            />
          </View>
        </View>

        <View style={styles.signOutContainer}>
          <GoldButton label="Sign Out" onPress={signOut} variant="ghost" />
        </View>

        <Text style={styles.legal}>
          SmarterPicks is for entertainment purposes only.{'\n'}
          Please gamble responsibly. 1-800-522-4700.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    padding: Spacing.md,
    gap: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 28,
    color: Colors.text,
  },
  memberCard: {
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.accent,
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
  username: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.text,
  },
  email: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textMuted,
  },
  planBadge: {
    borderWidth: 1,
    borderColor: Colors.accentDim,
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  planText: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    letterSpacing: 1.2,
    color: Colors.accent,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.textDim,
    paddingHorizontal: 2,
  },
  card: {
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  rowLabel: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.text,
  },
  rowValue: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textMuted,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  hint: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.textDim,
    paddingHorizontal: 2,
  },
  signOutContainer: {
    marginTop: Spacing.sm,
  },
  legal: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.textDim,
    textAlign: 'center',
    lineHeight: 17,
  },
});
