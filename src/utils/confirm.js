import { Alert, Platform } from 'react-native';

// Alert.alert with buttons does nothing in a browser, so use window.confirm there.
export function confirmAction({ title, message, confirmLabel = 'Delete', onConfirm }) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
