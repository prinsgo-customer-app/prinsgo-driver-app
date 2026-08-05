import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useSettings } from '../../context/SettingsContext';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🚗',
    title: 'Drive & Earn',
    desc: 'Flexible hours, instant settlements. Turn your spare time into a lucrative career with PrinsGo Driver.',
  },
  {
    id: '2',
    emoji: '📦',
    title: 'Deliver Parcels',
    desc: 'Maximize your daily payouts by taking flexible courier and delivery orders alongside ride-sharing requests.',
  },
  {
    id: '3',
    emoji: '📈',
    title: 'Track Performance',
    desc: 'Real-time analytics, daily bonus multipliers, interactive targets, and a premium digital wallet.',
  },
];

export default function OnboardingScreen({ navigation }) {
  const { theme } = useSettings();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#000000' }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={[styles.skipText, { color: theme.primary }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.slideContainer}>
        <Text style={styles.emoji}>{SLIDES[currentIndex].emoji}</Text>
        <Text style={styles.title}>{SLIDES[currentIndex].title}</Text>
        <Text style={styles.desc}>{SLIDES[currentIndex].desc}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.indicator,
                { backgroundColor: currentIndex === i ? theme.primary : '#555555' },
                currentIndex === i && { width: 24 },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'flex-end',
  },
  skipText: {
    fontSize: 15,
    fontWeight: '700',
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 110,
    marginBottom: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  desc: {
    fontSize: 15,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    gap: 8,
  },
  indicator: {
    height: 6,
    width: 6,
    borderRadius: 3,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#FFC72C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
  },
});
