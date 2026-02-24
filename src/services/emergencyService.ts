import * as Linking from 'expo-linking';

export const DEFAULT_EMERGENCY_NUMBER = '911';

export async function makeEmergencyCall(phoneNumber: string): Promise<boolean> {
  try {
    const phoneUrl = `tel:${phoneNumber}`;
    const canOpen = await Linking.canOpenURL(phoneUrl);
    if (canOpen) {
      await Linking.openURL(phoneUrl);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error making emergency call:', error);
    return false;
  }
}

export async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
  try {
    const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
    const canOpen = await Linking.canOpenURL(smsUrl);
    if (canOpen) {
      await Linking.openURL(smsUrl);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}

export async function sendSilentSMS(phoneNumber: string, message: string): Promise<boolean> {
  try {
    const smsUrl = `sms:${phoneNumber}&body=${encodeURIComponent(message)}`;
    const canOpen = await Linking.canOpenURL(smsUrl);
    if (canOpen) {
      await Linking.openURL(smsUrl);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}
