import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoMlkitGenaiProofreadingViewProps } from './ExpoMlkitGenaiProofreading.types';

const NativeView: React.ComponentType<ExpoMlkitGenaiProofreadingViewProps> =
  requireNativeView('ExpoMlkitGenaiProofreading');

export default function ExpoMlkitGenaiProofreadingView(props: ExpoMlkitGenaiProofreadingViewProps) {
  return <NativeView {...props} />;
}
