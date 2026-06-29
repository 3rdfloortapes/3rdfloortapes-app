import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

export default function WebViewScreen({ route }: any) {
  const { url } = route.params;
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        renderLoading={() => <ActivityIndicator color="#FFFFFF" size="large" style={styles.loader} />}
        startInLoadingState
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  webview: { flex: 1 },
  loader: { position: 'absolute', top: '50%', left: '50%' },
});
