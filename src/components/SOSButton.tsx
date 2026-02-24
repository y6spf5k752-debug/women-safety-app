import React, { useState, useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
  Vibration,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { speakAlert } from '../services/voiceService';

export default function SOSButton() {
  const { contacts, isSOSActive, setSOSActive, emergencyNumber } = useApp();
  const [countdown, setCountdown] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isSOSActive) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isSOSActive]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const triggerSOS = async () => {
    Vibration.vibrate([200, 200, 200, 200]);

    await speakAlert('Emergency alert activated. Sending help request.');

    const { getCurrentLocation, getGoogleMapsUrl } = await import('../services/locationService');
    const { sendSMS, makeEmergencyCall } = await import('../services/emergencyService');
    const location = await getCurrentLocation();
    const locationUrl = location ? getGoogleMapsUrl(location) : 'Location unavailable';

    const message = `EMERGENCY! I need help immediately! My location: ${locationUrl}`;

    for (const contact of contacts) {
      if (contact.phone) {
        await sendSMS(contact.phone, message);
      }
    }

    setCountdown(5);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          handleEmergencyCall();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleEmergencyCall = async () => {
    const { makeEmergencyCall } = await import('../services/emergencyService');
    await makeEmergencyCall(emergencyNumber);
  };

  const handlePress = () => {
    if (!isSOSActive) {
      Alert.alert(
        '🚨 Activate SOS',
        'Press and hold for 3 seconds to send emergency alerts to your contacts.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Hold to Activate',
            onPress: () => {
              let pressTime = 0;
              const interval = setInterval(() => {
                pressTime += 100;
                if (pressTime >= 3000) {
                  clearInterval(interval);
                  setSOSActive(true);
                  triggerSOS();
                }
              }, 100);
            },
          },
        ]
      );
    } else {
      setSOSActive(false);
      if (countdownRef.current) clearInterval(countdownRef.current);
      setCountdown(0);
      speakAlert('Emergency alert cancelled');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: pulseAnim }] }]}>
        <TouchableOpacity
          style={[styles.button, isSOSActive && styles.buttonActive]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Text style={styles.sosText}>SOS</Text>
          {isSOSActive && (
            <View style={styles.activeIndicator}>
              <Text style={styles.activeText}>ACTIVE</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
      {isSOSActive && countdown > 0 && (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownLabel}>Calling emergency in</Text>
          <Text style={styles.countdown}>{countdown}s</Text>
        </View>
      )}
      <Text style={styles.hint}>
        {isSOSActive ? 'Tap to cancel alert' : 'Press and hold for 3 seconds'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWrapper: {
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 15,
  },
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#fff',
  },
  buttonActive: {
    backgroundColor: '#DC2626',
  },
  sosText: {
    fontSize: 56,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
  },
  activeIndicator: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  activeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  countdownLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
  },
  countdown: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  hint: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
  },
});
