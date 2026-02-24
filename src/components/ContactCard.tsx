import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { EmergencyContact } from '../context/AppContext';

interface ContactCardProps {
  contact: EmergencyContact;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ContactCard({ contact, onEdit, onDelete }: ContactCardProps) {
  const handleCall = () => {
    if (contact.phone) {
      Linking.openURL(`tel:${contact.phone}`);
    }
  };

  const getRelationshipEmoji = (relationship: string) => {
    const rel = relationship.toLowerCase();
    if (rel.includes('mother') || rel.includes('mom')) return '👩';
    if (rel.includes('father') || rel.includes('dad')) return '👨';
    if (rel.includes('sister') || rel.includes('brother')) return '👫';
    if (rel.includes('friend')) return '🤝';
    if (rel.includes('husband') || rel.includes('partner')) return '💑';
    return '👤';
  };

  return (
    <View style={styles.card}>
      <View style={styles.leftSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {contact.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{contact.name}</Text>
            <Text style={styles.emoji}>{getRelationshipEmoji(contact.relationship)}</Text>
          </View>
          <Text style={styles.phone}>{contact.phone || 'No phone number'}</Text>
          <Text style={styles.relationship}>{contact.relationship}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        {contact.phone && (
          <TouchableOpacity 
            style={styles.callButton} 
            onPress={handleCall}
          >
            <Text style={styles.callIcon}>📞</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Text style={styles.editText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EC4899',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  emoji: {
    fontSize: 16,
    marginLeft: 8,
  },
  phone: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 2,
  },
  relationship: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  callIcon: {
    fontSize: 16,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  editText: {
    fontSize: 16,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 16,
  },
});
