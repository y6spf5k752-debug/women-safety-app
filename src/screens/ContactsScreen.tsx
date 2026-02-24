import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  StatusBar,
} from 'react-native';
import { useApp, EmergencyContact } from '../context/AppContext';
import ContactCard from '../components/ContactCard';

interface ContactsScreenProps {
  navigation: any;
}

export default function ContactsScreen({ navigation }: ContactsScreenProps) {
  const { contacts, addContact, removeContact, updateContact, currentUser } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');

  const openAddModal = () => {
    setEditingContact(null);
    setName('');
    setPhone('');
    setRelationship('');
    setModalVisible(true);
  };

  const openEditModal = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setName(contact.name);
    setPhone(contact.phone);
    setRelationship(contact.relationship);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter contact name');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter phone number');
      return;
    }

    if (editingContact) {
      await updateContact(editingContact.id, {
        name: name.trim(),
        phone: phone.trim(),
        relationship: relationship.trim() || 'Other',
      });
    } else {
      if (contacts.length >= 10) {
        Alert.alert('Limit Reached', 'You can add up to 10 emergency contacts');
        return;
      }
      await addContact({
        name: name.trim(),
        phone: phone.trim(),
        relationship: relationship.trim() || 'Other',
      });
    }
    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to remove this contact from your emergency list?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => await removeContact(id) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Emergency Contacts</Text>
        <TouchableOpacity style={styles.addHeaderButton} onPress={openAddModal}>
          <Text style={styles.addHeaderText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>👥</Text>
          <Text style={styles.infoTitle}>Your Trusted Contacts</Text>
          <Text style={styles.infoText}>
            Add up to 10 people who will be notified when you trigger an SOS alert. They will receive your location and emergency message.
          </Text>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {contacts.filter(c => c.phone).length} / 10 contacts
            </Text>
          </View>
        </View>

        {contacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📱</Text>
            <Text style={styles.emptyTitle}>No Contacts Added</Text>
            <Text style={styles.emptyText}>
              Add your trusted contacts who will be notified during emergencies.
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={openAddModal}>
              <Text style={styles.emptyButtonText}>+ Add First Contact</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>Your Emergency Contacts</Text>
            {contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={() => openEditModal(contact)}
                onDelete={() => handleDelete(contact.id)}
              />
            ))}

            {contacts.length < 10 && (
              <TouchableOpacity style={styles.addMoreButton} onPress={openAddModal}>
                <Text style={styles.addMoreIcon}>+</Text>
                <Text style={styles.addMoreText}>Add Another Contact</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
            </Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Contact Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Mother, Best Friend"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor="#9CA3AF"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Relationship</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Family, Friend, Colleague"
                placeholderTextColor="#9CA3AF"
                value={relationship}
                onChangeText={setRelationship}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.quickOptions}>
              <Text style={styles.quickLabel}>Quick select:</Text>
              <View style={styles.quickButtons}>
                {['Mother', 'Father', 'Sister', 'Brother', 'Friend', 'Husband'].map((rel) => (
                  <TouchableOpacity
                    key={rel}
                    style={[styles.quickButton, relationship === rel && styles.quickButtonActive]}
                    onPress={() => setRelationship(rel)}
                  >
                    <Text style={[styles.quickButtonText, relationship === rel && styles.quickButtonTextActive]}>
                      {rel}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>
                  {editingContact ? 'Update' : 'Add Contact'}
                </Text>
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
  addHeaderButton: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addHeaderText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  infoCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  infoIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  counterBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  addMoreButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  addMoreIcon: {
    fontSize: 24,
    color: '#EC4899',
    marginRight: 8,
    fontWeight: 'bold',
  },
  addMoreText: {
    fontSize: 16,
    color: '#EC4899',
    fontWeight: '600',
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
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
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
  },
  quickOptions: {
    marginBottom: 16,
  },
  quickLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  quickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  quickButtonActive: {
    backgroundColor: '#EC4899',
  },
  quickButtonText: {
    fontSize: 12,
    color: '#4B5563',
  },
  quickButtonTextActive: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 16,
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
