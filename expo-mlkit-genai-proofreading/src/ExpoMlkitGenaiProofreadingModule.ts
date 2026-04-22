import { NativeModule, requireNativeModule } from 'expo';

import { ExpoMlkitGenaiProofreadingModuleEvents } from './ExpoMlkitGenaiProofreading.types';

declare class ExpoMlkitGenaiProofreadingModule extends NativeModule<ExpoMlkitGenaiProofreadingModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoMlkitGenaiProofreadingModule>('ExpoMlkitGenaiProofreading');
