import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { startVoiceRecognition, stopVoiceRecognition, checkForTriggerWord, speakAlert } from '../services/voiceService';
import { getCurrentLocation, getGoogleMapsUrl } from '../services/locationService';
import { makeEmergencyCall, sendSMS } from '../services/emergencyService';
import { supabase } from '../services/supabaseClient';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

interface AppContextType {
  users: User[];
  currentUser: User | null;
  contacts: EmergencyContact[];
  addContact: (contact: Omit<EmergencyContact, 'id'>) => Promise<void>;
  removeContact: (id: string) => Promise<void>;
  updateContact: (id: string, contact: Omit<EmergencyContact, 'id'>) => Promise<void>;
  isSOSActive: boolean;
  setSOSActive: (active: boolean) => void;
  isVoiceActivationEnabled: boolean;
  setVoiceActivationEnabled: (enabled: boolean) => void;
  emergencyNumber: string;
  setEmergencyNumber: (number: string) => void;
  customAlertMessage: string;
  setCustomAlertMessage: (message: string) => void;
  isBackgroundTrackingEnabled: boolean;
  setBackgroundTrackingEnabled: (enabled: boolean) => void;
  triggerSOS: () => Promise<void>;
  login: (emailOrPhone: string, password: string) => Promise<User | null>;
  signup: (userData: { fullName: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User> & { password?: string; currentPassword?: string }) => Promise<boolean>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isSOSActive, setSOSActive] = useState(false);
  const [isVoiceActivationEnabled, setVoiceActivationEnabled] = useState(false);
  const [emergencyNumber, setEmergencyNumber] = useState('112');
  const [customAlertMessage, setCustomAlertMessage] = useState('EMERGENCY! I need help immediately! My location:');
  const [isBackgroundTrackingEnabled, setBackgroundTrackingEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from Supabase
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data && !error) {
      setCurrentUser({
        id: data.id,
        fullName: data.full_name,
        email: data.email,
        phone: data.phone,
      });
    }
  }, []);

  // Fetch emergency contacts from Supabase
  const fetchContacts = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (data && !error) {
      setContacts(
        data.map((c: any) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          relationship: c.relationship,
        }))
      );
    }
  }, []);

  // Listen to Supabase auth state changes
  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchContacts(session.user.id);
      }
      setIsLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchProfile(session.user.id);
          await fetchContacts(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setContacts([]);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, fetchContacts]);

  const login = useCallback(async (emailOrPhone: string, password: string): Promise<User | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailOrPhone,
      password: password,
    });

    if (error || !data.user) {
      console.error('Login error:', error?.message);
      return null;
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profile) {
      const user: User = {
        id: profile.id,
        fullName: profile.full_name,
        email: profile.email,
        phone: profile.phone,
      };
      setCurrentUser(user);
      await fetchContacts(data.user.id);
      return user;
    }
    return null;
  }, [fetchContacts]);

  const signup = useCallback(async (userData: { fullName: string; email: string; phone: string; password: string }): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      // Insert profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: userData.fullName,
        email: userData.email,
        phone: userData.phone,
      });

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      const user: User = {
        id: data.user.id,
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
      };
      setCurrentUser(user);
      setContacts([]);
      return { success: true };
    }

    return { success: false, error: 'Unknown error occurred' };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setContacts([]);
    setSOSActive(false);
  }, []);

  const updateUserProfile = useCallback(async (data: Partial<User> & { password?: string; currentPassword?: string }): Promise<boolean> => {
    if (!currentUser) return false;

    // Update profile in database
    const updates: any = {};
    if (data.fullName) updates.full_name = data.fullName;
    if (data.phone) updates.phone = data.phone;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', currentUser.id);

      if (error) {
        console.error('Profile update error:', error.message);
        return false;
      }
    }

    // Update password if requested
    if (data.password) {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });
      if (error) {
        console.error('Password update error:', error.message);
        return false;
      }
    }

    // Update local state
    setCurrentUser(prev => prev ? {
      ...prev,
      fullName: data.fullName || prev.fullName,
      phone: data.phone || prev.phone,
    } : null);

    return true;
  }, [currentUser]);

  const addContact = useCallback(async (contact: Omit<EmergencyContact, 'id'>) => {
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert({
        user_id: currentUser.id,
        name: contact.name,
        phone: contact.phone,
        relationship: contact.relationship,
      })
      .select()
      .single();

    if (data && !error) {
      setContacts(prev => [...prev, {
        id: data.id,
        name: data.name,
        phone: data.phone,
        relationship: data.relationship,
      }]);
    }
  }, [currentUser]);

  const removeContact = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', id);

    if (!error) {
      setContacts(prev => prev.filter(c => c.id !== id));
    }
  }, []);

  const updateContact = useCallback(async (id: string, updatedContact: Omit<EmergencyContact, 'id'>) => {
    const { error } = await supabase
      .from('emergency_contacts')
      .update({
        name: updatedContact.name,
        phone: updatedContact.phone,
        relationship: updatedContact.relationship,
      })
      .eq('id', id);

    if (!error) {
      setContacts(prev =>
        prev.map(c => c.id === id ? { id, ...updatedContact } : c)
      );
    }
  }, []);

  const triggerSOS = useCallback(async () => {
    if (isSOSActive) return;

    setSOSActive(true);
    speakAlert('Emergency alert activated. Sending help request.');

    const location = await getCurrentLocation();
    const locationUrl = location ? getGoogleMapsUrl(location) : 'Location unavailable';

    const message = `${customAlertMessage} ${locationUrl}`;

    for (const contact of contacts) {
      if (contact.phone) {
        await sendSMS(contact.phone, message);
      }
    }

    setTimeout(async () => {
      await makeEmergencyCall(emergencyNumber);
      setSOSActive(false);
    }, 5000);
  }, [contacts, customAlertMessage, emergencyNumber, isSOSActive]);

  useEffect(() => {
    let handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isVoiceActivationEnabled) {
        startVoiceRecognition({
          onSpeechResult: (result: string) => {
            if (checkForTriggerWord(result)) {
              triggerSOS();
            }
          },
          onError: (error: string) => {
            console.log('Voice recognition error:', error);
          }
        });
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        stopVoiceRecognition();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    if (isVoiceActivationEnabled) {
      startVoiceRecognition({
        onSpeechResult: (result: string) => {
          if (checkForTriggerWord(result)) {
            triggerSOS();
          }
        }
      });
    }

    return () => {
      stopVoiceRecognition();
      subscription.remove();
    };
  }, [isVoiceActivationEnabled, triggerSOS]);

  return (
    <AppContext.Provider
      value={{
        users: [],
        currentUser,
        contacts,
        addContact,
        removeContact,
        updateContact,
        isSOSActive,
        setSOSActive,
        isVoiceActivationEnabled,
        setVoiceActivationEnabled,
        emergencyNumber,
        setEmergencyNumber,
        customAlertMessage,
        setCustomAlertMessage,
        isBackgroundTrackingEnabled,
        setBackgroundTrackingEnabled,
        triggerSOS,
        login,
        signup,
        logout,
        updateUserProfile,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
