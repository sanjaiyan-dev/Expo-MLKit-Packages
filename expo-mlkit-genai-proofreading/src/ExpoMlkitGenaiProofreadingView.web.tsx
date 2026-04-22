import * as React from 'react';

import { ExpoMlkitGenaiProofreadingViewProps } from './ExpoMlkitGenaiProofreading.types';

export default function ExpoMlkitGenaiProofreadingView(props: ExpoMlkitGenaiProofreadingViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
