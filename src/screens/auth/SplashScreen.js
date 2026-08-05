import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useSettings } from '../../context/SettingsContext';

const { width } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const { theme } = useSettings();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2800);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim]);

  return (
    <View style={[styles.container, { backgroundColor: '#000000' }]}>
      <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.logoCircle, { backgroundColor: theme.primary }]}>
          <Text style={styles.logoP}>P</Text>
        </View>
        <Text style={styles.title}>
          Prins<Text style={{ color: theme.primary }}>Go</Text>
        </Text>
        <Text style={styles.sub}>ENTERPRISE DRIVER</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#FFC72C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  logoP: {
    fontSize: 48,
    fontWeight: '900',
    color: '#000000',
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  sub: {
    fontSize: 12,
    fontWeight: '800',
    color: '#888888',
    marginTop: 8,
    letterSpacing: 4,
  },
});
