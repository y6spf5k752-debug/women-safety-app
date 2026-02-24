import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import SOSButton from '../components/SOSButton';
import FeatureCard from '../components/FeatureCard';
import { useApp } from '../context/AppContext';
import { getCurrentLocation, getGoogleMapsUrl, requestLocationPermission } from '../services/locationService';
import { makeEmergencyCall, sendSMS } from '../services/emergencyService';
import { speakAlert } from '../services/voiceService';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { 
    isVoiceActivationEnabled, 
    contacts, 
    emergencyNumber, 
    triggerSOS,
    currentUser 
  } = useApp();

  const handleLocationShare = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      speakAlert('Location permission denied');
      return;
    }
    
    const location = await getCurrentLocation();
    if (location) {
      const message = `My current location: ${getGoogleMapsUrl(location)}`;
      for (const contact of contacts) {
        if (contact.phone) {
          await sendSMS(contact.phone, message);
        }
      }
      speakAlert('Location sent to emergency contacts');
    } else {
      speakAlert('Could not get location');
    }
  };

  const handleEmergencyCall = async () => {
    await makeEmergencyCall(emergencyNumber);
  };

  const filledContacts = contacts.filter(c => c.phone);
  const userName = currentUser?.fullName?.split(' ')[0] || 'User';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {userName} 👋</Text>
            <Text style={styles.subtitle}>Stay safe today</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileIcon}>
              {currentUser?.fullName?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sosContainer}>
          <SOSButton />
          <Text style={styles.sosHint}>Press and hold for 3 seconds</Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Quick Status</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: isVoiceActivationEnabled ? '#D1FAE5' : '#F3F4F6' }
            ]}>
              <Text style={[
                styles.statusBadgeText,
                { color: isVoiceActivationEnabled ? '#059669' : '#6B7280' }
              ]}>
                {isVoiceActivationEnabled ? '🟢 Voice Active' : '⚪ Voice Off'}
              </Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text style={styles.statusValue}>{filledContacts.length}</Text>
              <Text style={styles.statusLabel}>Contacts</Text>
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusItem}>
              <Text style={styles.statusValue}>{emergencyNumber}</Text>
              <Text style={styles.statusLabel}>Emergency</Text>
            </View>
          </View>
        </View>

        <View style={styles.features}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <FeatureCard
            title="Share My Location"
            description="Send live location to emergency contacts"
            icon="📍"
            color="#10B981"
            onPress={handleLocationShare}
          />
          
          <FeatureCard
            title="Call Emergency Services"
            description={`Call ${emergencyNumber} immediately`}
            icon="🚨"
            color="#EF4444"
            onPress={handleEmergencyCall}
          />
          
          <FeatureCard
            title="Emergency Contacts"
            description="Manage your trusted contacts"
            icon="👥"
            color="#3B82F6"
            onPress={() => navigation.navigate('Contacts')}
          />
          
          <FeatureCard
            title="Settings"
            description="Configure app preferences"
            icon="⚙️"
            color="#6B7280"
            onPress={() => navigation.navigate('Settings')}
          />
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Safety Tip</Text>
          <Text style={styles.tipText}>
            Add at least 3 emergency contacts for faster assistance during emergencies.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EC4899',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  sosContainer: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sosHint: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 16,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statusDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  features: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  tipCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
  },
});
