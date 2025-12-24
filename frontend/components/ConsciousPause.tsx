import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS, PAUSE_DURATIONS } from '@/constants/ariomeTheme';

interface ConciousPauseProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function ConsciousPause({ onComplete, onCancel }: ConciousPauseProps) {
  const [selectedDuration, setSelectedDuration] = useState(PAUSE_DURATIONS[1]); // 3 minutes default
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const breathAnimation = useRef(new Animated.Value(0)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsActive(false);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isActive, timeRemaining]);

  useEffect(() => {
    if (isActive) {
      // Breathing animation - 4 seconds in, 4 seconds out
      const breathCycle = Animated.loop(
        Animated.sequence([
          Animated.timing(breathAnimation, {
            toValue: 1,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(breathAnimation, {
            toValue: 0,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      
      const glowCycle = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, {
            toValue: 1,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnimation, {
            toValue: 0,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      breathCycle.start();
      glowCycle.start();

      return () => {
        breathCycle.stop();
        glowCycle.stop();
      };
    }
  }, [isActive]);

  const startPause = () => {
    setTimeRemaining(selectedDuration.seconds);
    setIsActive(true);
  };

  const stopPause = () => {
    setIsActive(false);
    setTimeRemaining(0);
    breathAnimation.setValue(0);
    onCancel?.();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const breathScale = breathAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const glowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const breathText = breathAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0],
  });

  if (isActive) {
    return (
      <View style={styles.activeContainer}>
        <Text style={styles.activeTitle}>Conscious Pause</Text>
        <Text style={styles.activeSubtitle}>{selectedDuration.description}</Text>
        
        <View style={styles.breathContainer}>
          <Animated.View style={[styles.glowCircle, { opacity: glowOpacity }]} />
          <Animated.View style={[styles.breathCircle, { transform: [{ scale: breathScale }] }]}>
            <Animated.Text style={[styles.breathText, { opacity: breathText }]}>Inhale</Animated.Text>
            <Animated.Text style={[styles.breathText, { opacity: Animated.subtract(1, breathText) }]}>Exhale</Animated.Text>
          </Animated.View>
        </View>

        <Text style={styles.timer}>{formatTime(timeRemaining)}</Text>
        <Text style={styles.breathInstruction}>Follow the circle</Text>

        <TouchableOpacity style={styles.stopButton} onPress={stopPause}>
          <MaterialCommunityIcons name="stop" size={20} color="#FFF" />
          <Text style={styles.stopButtonText}>End Pause</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="meditation" size={32} color={ARIOME_COLORS.consciousness.teal} />
        <Text style={styles.title}>Conscious Pause</Text>
        <Text style={styles.subtitle}>Take a moment to reconnect with yourself</Text>
      </View>

      <View style={styles.durationSelector}>
        {PAUSE_DURATIONS.map((duration) => (
          <TouchableOpacity
            key={duration.id}
            style={[
              styles.durationOption,
              selectedDuration.id === duration.id && styles.durationOptionSelected
            ]}
            onPress={() => setSelectedDuration(duration)}
          >
            <Text style={[
              styles.durationLabel,
              selectedDuration.id === duration.id && styles.durationLabelSelected
            ]}>
              {duration.label}
            </Text>
            <Text style={styles.durationDesc}>{duration.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.startButton} onPress={startPause}>
        <MaterialCommunityIcons name="play" size={24} color="#FFF" />
        <Text style={styles.startButtonText}>Begin Pause</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: ARIOME_SPACING.lg,
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusLarge,
  },
  header: {
    alignItems: 'center',
    marginBottom: ARIOME_SPACING.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: '300',
    color: ARIOME_COLORS.text.primary,
    marginTop: ARIOME_SPACING.md,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    marginTop: ARIOME_SPACING.xs,
  },
  durationSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: ARIOME_SPACING.lg,
  },
  durationOption: {
    width: '48%',
    padding: ARIOME_SPACING.md,
    backgroundColor: ARIOME_COLORS.background.primary,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    marginBottom: ARIOME_SPACING.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  durationOptionSelected: {
    borderColor: ARIOME_COLORS.consciousness.teal,
    backgroundColor: ARIOME_COLORS.consciousness.tealMuted,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: ARIOME_COLORS.text.secondary,
  },
  durationLabelSelected: {
    color: ARIOME_COLORS.consciousness.teal,
  },
  durationDesc: {
    fontSize: 12,
    color: ARIOME_COLORS.text.muted,
    marginTop: 2,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    paddingVertical: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    gap: ARIOME_SPACING.sm,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  // Active state
  activeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ARIOME_SPACING.xl,
    backgroundColor: ARIOME_COLORS.background.deep,
  },
  activeTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: ARIOME_COLORS.text.primary,
    letterSpacing: 2,
  },
  activeSubtitle: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    marginTop: ARIOME_SPACING.xs,
  },
  breathContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: ARIOME_SPACING.sacred,
  },
  glowCircle: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: ARIOME_COLORS.consciousness.teal,
  },
  breathCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: ARIOME_COLORS.consciousness.tealMuted,
    borderWidth: 2,
    borderColor: ARIOME_COLORS.consciousness.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathText: {
    fontSize: 18,
    fontWeight: '300',
    color: ARIOME_COLORS.consciousness.teal,
    position: 'absolute',
    letterSpacing: 2,
  },
  timer: {
    fontSize: 48,
    fontWeight: '200',
    color: ARIOME_COLORS.text.primary,
    letterSpacing: 4,
  },
  breathInstruction: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    marginTop: ARIOME_SPACING.sm,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ARIOME_SPACING.sm,
    paddingHorizontal: ARIOME_SPACING.lg,
    paddingVertical: ARIOME_SPACING.md,
    backgroundColor: ARIOME_COLORS.background.elevated,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    marginTop: ARIOME_SPACING.xl,
  },
  stopButtonText: {
    color: ARIOME_COLORS.text.secondary,
    fontSize: 16,
  },
});
