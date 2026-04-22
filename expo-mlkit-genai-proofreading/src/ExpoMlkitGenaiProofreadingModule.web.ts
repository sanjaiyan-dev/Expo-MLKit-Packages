import { registerWebModule, NativeModule } from 'expo';

import { ExpoMlkitGenaiProofreadingModuleEvents } from './ExpoMlkitGenaiProofreading.types';

class ExpoMlkitGenaiProofreadingModule extends NativeModule<ExpoMlkitGenaiProofreadingModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoMlkitGenaiProofreadingModule, 'ExpoMlkitGenaiProofreadingModule');
