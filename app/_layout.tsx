import 'react-native-gesture-handler';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GameProvider } from '@/context/GameContext';
import { colors } from '@/constants/theme';

const GRID_SIZE = 44;
const GRID_LINES = 24;
const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: 'transparent',
    card: 'transparent',
    border: 'transparent',
  },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <View style={styles.root}>
          <StatusBar style="light" />

          <View style={styles.background}>
            <LinearGradient
              colors={[colors.background, '#0b1425']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={['rgba(16,185,129,0.18)', 'transparent', 'rgba(139,92,246,0.18)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              {Array.from({ length: GRID_LINES }).map((_, index) => (
                <View
                  key={`v-${index}`}
                  style={[styles.gridLineVertical, { left: index * GRID_SIZE }]}
                />
              ))}
              {Array.from({ length: GRID_LINES }).map((_, index) => (
                <View
                  key={`h-${index}`}
                  style={[styles.gridLineHorizontal, { top: index * GRID_SIZE }]}
                />
              ))}
            </View>
          </View>

          <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <View style={styles.content}>
              <ThemeProvider value={navigationTheme}>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: 'transparent' },
                  }}
                />
              </ThemeProvider>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>By </Text>
              <Pressable onPress={() => Linking.openURL('https://github.com/wbenafi')}>
                <Text style={styles.footerLink}>Walter Benavides</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </GameProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: '100%',
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineVertical: {
    position: 'absolute',
    width: 1,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  gridLineHorizontal: {
    position: 'absolute',
    height: 1,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  content: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'rgba(2,6,23,0.45)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(51,65,85,0.5)',
  },
  footerText: {
    color: colors.muted,
    fontSize: 12,
  },
  footerLink: {
    color: '#cbd5e1',
    textDecorationLine: 'underline',
    fontSize: 12,
  },
});
