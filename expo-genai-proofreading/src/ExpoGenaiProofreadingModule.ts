import { NativeModule, requireNativeModule } from 'expo';

import { FeatureStatus, InputType, Language, ProofreadingResult } from './ExpoGenaiProofreading.types';

declare class ExpoGenaiProofreadingModule extends NativeModule {
  /**
   * Initializes the Proofreader client with specific input and language options.
   */
  initialize(inputType: InputType, language: Language): Promise<boolean>;

  /**
   * Checks if the Gemini AI model is available on the physical device.
   */
  checkFeatureStatus(): Promise<FeatureStatus>;

  /**
   * Triggers the download of the Gemini AI model if not already present.
   */
  downloadFeature(): Promise<boolean>;

  /**
   * Runs the inference to proofread the provided text.
   */
  proofread(text: string): Promise<ProofreadingResult[]>;


  /**
   * Releases resources associated with the proofreading engine.
   * Call this to free up device RAM when GenAI features are not in use.
   */
  close(): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoGenaiProofreadingModule>('ExpoGenaiProofreading');
