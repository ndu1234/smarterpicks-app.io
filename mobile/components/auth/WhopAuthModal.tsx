import { Modal, View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRef, useState } from 'react';
import { Colors, Fonts } from '@/constants/theme';
import { APP_SCHEME } from '@/lib/whop';

interface Props {
  authUrl: string;
  onToken: (accessToken: string, refreshToken: string) => void;
  onCancel: () => void;
}

export function WhopAuthModal({ authUrl, onToken, onCancel }: Props) {
  const [loading, setLoading] = useState(true);

  function handleNavChange(url: string) {
    if (url.startsWith(APP_SCHEME)) {
      try {
        const parsed = new URL(url);
        const accessToken = parsed.searchParams.get('access_token');
        const refreshToken = parsed.searchParams.get('refresh_token') ?? '';
        if (accessToken) onToken(accessToken, refreshToken);
        else onCancel();
      } catch {
        onCancel();
      }
      return;
    }
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
          onNavigationStateChange={(e) => handleNavChange(e.url)}
          onShouldStartLoadWithRequest={(req) => {
            if (req.url.startsWith(APP_SCHEME)) {
              handleNavChange(req.url);
              return false;
            }
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
