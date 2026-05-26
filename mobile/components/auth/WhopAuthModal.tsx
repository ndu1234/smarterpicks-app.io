import { Modal, View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useState } from 'react';
import { Colors, Fonts } from '@/constants/theme';
import { REDIRECT_URI } from '@/lib/whop';

interface Props {
  authUrl: string;
  expectedState: string;
  onCode: (code: string) => void;
  onCancel: () => void;
}

export function WhopAuthModal({ authUrl, expectedState, onCode, onCancel }: Props) {
  const [loading, setLoading] = useState(true);

  function tryExtractCode(url: string): boolean {
    if (!url.startsWith(REDIRECT_URI)) return false;
    try {
      const parsed = new URL(url);
      const code = parsed.searchParams.get('code');
      const state = parsed.searchParams.get('state');
      const error = parsed.searchParams.get('error');
      if (error) { onCancel(); return true; }
      if (code) {
        if (state !== expectedState) { onCancel(); return true; }
        onCode(code);
        return true;
      }
    } catch {}
    return false;
  }

  return (
    <Modal animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Sign in with Whop</Text>
          <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator color={Colors.accent} size="large" />
          </View>
        )}

        <WebView
          source={{ uri: authUrl }}
          onLoadEnd={() => setLoading(false)}
          onShouldStartLoadWithRequest={(req) => {
            if (tryExtractCode(req.url)) return false;
            return true;
          }}
          style={styles.webview}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.text,
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  closeText: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.accent,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
});
