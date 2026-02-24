import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
  color: string;
}

export default function FeatureCard({ title, description, icon, onPress, color }: FeatureCardProps) {
  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: color }]} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
