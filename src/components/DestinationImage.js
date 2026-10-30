import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { categoryMeta } from '../theme';

// Shows the photo, or a colored placeholder with the category icon when there is none.
export default function DestinationImage({ uri, category, style, iconSize = 36 }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);
  const meta = categoryMeta[category] || categoryMeta.Cultural;

  if (uri && !failed) {
    return <Image source={{ uri }} style={style} resizeMode="cover" onError={() => setFailed(true)} />;
  }
  return (
    <View style={[style, { backgroundColor: meta.color, alignItems: 'center', justifyContent: 'center' }]}>
      <Icon name={meta.icon} size={iconSize} color="rgba(255,255,255,0.85)" />
    </View>
  );
}
