import { Platform } from 'react-native';
import MlkitProofreaderModule from './ExpoGenaiProofreadingModule';

export type InputType = 'KEYBOARD' | 'VOICE';
export type Language = 'ENGLISH' | 'JAPANESE' | 'FRENCH' | 'GERMAN' | 'ITALIAN' | 'SPANISH' | 'KOREAN';
export type FeatureStatus = 'UNAVAILABLE' | 'DOWNLOADABLE' | 'DOWNLOADING' | 'AVAILABLE';

export interface ProofreadingResult {
  text: string;
  confidence: number;
}

export async function initialize(inputType: InputType = 'KEYBOARD', language: Language = 'ENGLISH'): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  return await MlkitProofreaderModule.initialize(inputType, language);
}

export async function checkFeatureStatus(): Promise<FeatureStatus> {
  if (Platform.OS !== 'android') return 'UNAVAILABLE';
  return await MlkitProofreaderModule.checkFeatureStatus();
}

export async function downloadFeature(): Promise<boolean> {
  if (Platform.OS !== 'android') throw new Error("Android Only");
  return await MlkitProofreaderModule.downloadFeature();
}

export async function proofread(text: string): Promise<ProofreadingResult[]> {
  if (Platform.OS !== 'android') throw new Error("Android Only");
  return await MlkitProofreaderModule.proofread(text);
}

export function close(): void {
  if (Platform.OS === 'android') {
    MlkitProofreaderModule.close();
  }
} 