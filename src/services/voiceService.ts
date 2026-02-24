import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import Voice, { SpeechResultsEvent } from '@react-native-voice/voice';

export interface VoiceCallback {
  onSpeechResult: (result: string) => void;
  onError?: (error: string) => void;
}

let voiceCallback: VoiceCallback | null = null;
let isListening = false;

Voice.onSpeechResults = (event: SpeechResultsEvent) => {
  if (event.value && event.value.length > 0 && voiceCallback) {
    const result = event.value[0].toLowerCase();
    voiceCallback.onSpeechResult(result);
  }
};

Voice.onSpeechError = (event: any) => {
  if (voiceCallback?.onError) {
    voiceCallback.onError(event.error?.message || 'Voice recognition error');
  }
  isListening = false;
};

Voice.onSpeechEnd = () => {
  isListening = false;
  if (voiceCallback) {
    Voice.start('en-US').catch(() => {});
  }
};

export async function startVoiceRecognition(callback: VoiceCallback): Promise<boolean> {
  try {
    voiceCallback = callback;
    
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    await Voice.start('en-US');
    isListening = true;
    return true;
  } catch (error) {
    console.error('Error starting voice recognition:', error);
    return false;
  }
}

export async function stopVoiceRecognition(): Promise<void> {
  try {
    isListening = false;
    voiceCallback = null;
    await Voice.stop();
  } catch (error) {
    console.error('Error stopping voice recognition:', error);
  }
}

export function isVoiceListening(): boolean {
  return isListening;
}

export function checkForTriggerWord(text: string): boolean {
  const triggerWords = ['help', 'sos', 'emergency', 'save me', 'help me', 'emergency help', 'sos help'];
  const lowerText = text.toLowerCase();
  return triggerWords.some(word => lowerText.includes(word));
}

export async function speakAlert(message: string): Promise<void> {
  try {
    await Speech.speak(message, {
      language: 'en',
      pitch: 1.0,
      rate: 1.0,
    });
  } catch (error) {
    console.error('Error speaking:', error);
  }
}

export async function startAudioRecording(): Promise<Audio.Recording | null> {
  try {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    return recording;
  } catch (error) {
    console.error('Error starting recording:', error);
    return null;
  }
}

export async function stopAudioRecording(recording: Audio.Recording): Promise<Audio.Sound | null> {
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    if (uri) {
      const { sound } = await Audio.Sound.createAsync({ uri });
      return sound;
    }
    return null;
  } catch (error) {
    console.error('Error stopping recording:', error);
    return null;
  }
}

export async function stopRecording(recording: Audio.Recording): Promise<void> {
  try {
    await recording.stopAndUnloadAsync();
  } catch (error) {
    console.error('Error stopping recording:', error);
  }
}

export const VOICE_COMMANDS = ['help', 'sos', 'emergency', 'save me'];
