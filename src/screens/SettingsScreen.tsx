import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
  StatusBar,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { speakAlert, startVoiceRecognition, stopVoiceRecognition, checkForTriggerWord } from '../services/voiceService';

interface SettingsScreenProps {
  navigation: any;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const {
    isVoiceActivationEnabled,
    setVoiceActivationEnabled,
    contacts,
    emergencyNumber,
    setEmergencyNumber,
    customAlertMessage,
    setCustomAlertMessage,
    isBackgroundTrackingEnabled,
    setBackgroundTrackingEnabled,
    triggerSOS,
  } = useApp();

  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [tempEmergencyNumber, setTempEmergencyNumber] = useState(emergencyNumber);
  const [tempAlertMessage, setTempAlertMessage] = useState(customAlertMessage);

  const handleVoiceToggle = async (value: boolean) => {
    setVoiceActivationEnabled(value);
    if (value) {
      await startVoiceRecognition({
        onSpeechResult: (result: string) => {
          if (checkForTriggerWord(result)) {
            triggerSOS();
          }
        },
        onError: (error: string) => {
          console.log('Voice recognition error:', error);
        }
      });
      speakAlert('Voice activation enabled. Say "help" or "sos" to trigger alert.');
    } else {
      await stopVoiceRecognition();
      speakAlert('Voice activation disabled.');
    }
  };

  const handleBackgroundTrackingToggle = (value: boolean) => {
    setBackgroundTrackingEnabled(value);
    if (value) {
      speakAlert('Background tracking enabled.');
    } else {
      speakAlert('Background tracking disabled.');
    }
  };

  const saveEmergencyNumber = () => {
    if (!tempEmergencyNumber.trim()) {
      Alert.alert('Error', 'Emergency number is required');
      return;
    }
    setEmergencyNumber(tempEmergencyNumber.trim());
    setEmergencyModalVisible(false);
    speakAlert('Emergency number updated.');
  };

  const saveAlertMessage = () => {
    if (!tempAlertMessage.trim()) {
      Alert.alert('Error', 'Alert message cannot be empty');
      return;
    }
    setCustomAlertMessage(tempAlertMessage.trim());
    setMessageModalVisible(false);
    speakAlert('Alert message updated.');
  };

  const testVoiceCommand = () => {
    speakAlert('Say "help" or "sos" to test voice activation');
  };

  const testSOS = () => {
    Alert.alert(
      '🧪 Test SOS',
      'This will trigger the full SOS alert. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Test', onPress: () => triggerSOS() },
      ]
    );
  };

  const filledContacts = contacts.filter(c => c.phone);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎤 Voice Activation</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Enable Voice Activation</Text>
              <Text style={styles.settingDescription}>
                Say "help", "sos", or "emergency" to trigger SOS
              </Text>
            </View>
            <Switch
              value={isVoiceActivationEnabled}
              onValueChange={handleVoiceToggle}
              trackColor={{ false: '#E5E7EB', true: '#FCA5A5' }}
              thumbColor={isVoiceActivationEnabled ? '#EF4444' : '#F9FAFB'}
            />
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={testVoiceCommand}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Test Voice Command</Text>
              <Text style={styles.settingDescription}>
                Test if voice recognition is working
              </Text>
            </View>
            <Text style={styles.linkText}>Test →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚨 Emergency Settings</Text>
          
          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={() => {
              setTempEmergencyNumber(emergencyNumber);
              setEmergencyModalVisible(true);
            }}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Emergency Number</Text>
              <Text style={styles.settingDescription}>
                {emergencyNumber}
              </Text>
            </View>
            <Text style={styles.linkText}>Edit →</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => {
              setTempAlertMessage(customAlertMessage);
              setMessageModalVisible(true);
            }}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Custom Alert Message</Text>
              <Text style={styles.settingDescription} numberOfLines={2}>
                {customAlertMessage}
              </Text>
            </View>
            <Text style={styles.linkText}>Edit →</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={testSOS}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Test SOS</Text>
              <Text style={styles.settingDescription}>
                Test the full SOS emergency flow
              </Text>
            </View>
            <Text style={[styles.linkText, { color: '#EF4444' }]}>Test →</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Contacts')}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Emergency Contacts</Text>
              <Text style={styles.settingDescription}>
                {filledContacts.length} contact{filledContacts.length !== 1 ? 's' : ''} configured
              </Text>
            </View>
            <Text style={styles.linkText}>Manage →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Location Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Background Location</Text>
              <Text style={styles.settingDescription}>
                Track location in background for continuous safety
              </Text>
            </View>
            <Switch
              value={isBackgroundTrackingEnabled}
              onValueChange={handleBackgroundTrackingToggle}
              trackColor={{ false: '#E5E7EB', true: '#86EFAC' }}
              thumbColor={isBackgroundTrackingEnabled ? '#22C55E' : '#F9FAFB'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ About</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>App Version</Text>
              <Text style={styles.settingDescription}>1.0.0</Text>
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Required Permissions</Text>
              <Text style={styles.settingDescription}>
                Location, Microphone, Phone, SMS
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📋 How SOS Works</Text>
          <Text style={styles.infoText}>
            {'\u2022'} Press and hold SOS button for 3 seconds{'\n'}
            {'\u2022'} Or say "Help" / "SOS" (voice activation){'\n'}
            {'\u2022'} Alert message with location sent to contacts{'\n'}
            {'\u2022'} Automatic call to emergency services{'\n'}
            {'\u2022'} Contacts receive your live location link
          </Text>
        </View>

        <View style={styles.safetyTipsBox}>
          <Text style={styles.safetyTitle}>💡 Safety Tips</Text>
          <Text style={styles.safetyText}>
            {'\u2022'} Always keep your phone charged{'\n'}
            {'\u2022'} Add at least 3 emergency contacts{'\n'}
            {'\u2022'} Enable voice activation for hands-free safety{'\n'}
            {'\u2022'} Share your location with trusted contacts{'\n'}
            {'\u2022'} Stay aware of your surroundings
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={emergencyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEmergencyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🚨 Emergency Number</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Enter emergency number (e.g., 112)"
              placeholderTextColor="#9CA3AF"
              value={tempEmergencyNumber}
              onChangeText={setTempEmergencyNumber}
              keyboardType="phone-pad"
            />
            
            <View style={styles.quickNumbers}>
              <Text style={styles.quickLabel}>Quick select:</Text>
              <View style={styles.quickButtons}>
                {['112', '911', '100', '102'].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[styles.quickButton, tempEmergencyNumber === num && styles.quickButtonActive]}
                    onPress={() => setTempEmergencyNumber(num)}
                  >
                    <Text style={[styles.quickButtonText, tempEmergencyNumber === num && styles.quickButtonTextActive]}>
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEmergencyModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveEmergencyNumber}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={messageModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMessageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✏️ Custom Alert Message</Text>
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter alert message"
              placeholderTextColor="#9CA3AF"
              value={tempAlertMessage}
              onChangeText={setTempAlertMessage}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setMessageModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveAlertMessage}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    fontSize: 16,
    color: '#EC4899',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    padding: 16,
    backgroundColor: '#F9FAFB',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  linkText: {
    fontSize: 14,
    color: '#EC4899',
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 24,
  },
  safetyTipsBox: {
    backgroundColor: '#D1FAE5',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 12,
  },
  safetyText: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  quickNumbers: {
    marginBottom: 16,
  },
  quickLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  quickButtons: {
    flexDirection: 'row',
  },
  quickButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  quickButtonActive: {
    backgroundColor: '#EC4899',
  },
  quickButtonText: {
    fontSize: 14,
    color: '#4B5563',
  },
  quickButtonTextActive: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#EC4899',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
