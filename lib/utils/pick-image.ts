import { Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

export type ImageSource = 'camera' | 'library' | 'files';

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  quality: 0.8,
};

function permissionDeniedAlert(what: string) {
  Alert.alert(
    'Permissão necessária',
    `Precisamos de acesso à ${what} para isso. Você pode habilitar nas configurações do app.`,
    [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Abrir configurações', onPress: () => Linking.openSettings() },
    ]
  );
}

async function pickFromCamera(): Promise<string | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) {
    permissionDeniedAlert('câmera');
    return null;
  }
  const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].uri;
}

async function pickFromLibrary(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    permissionDeniedAlert('galeria');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].uri;
}

async function pickFromFiles(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'image/*',
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].uri;
}

/** Executa o fluxo de seleção para a origem escolhida. Retorna a URI ou null. */
export async function pickImageFromSource(source: ImageSource): Promise<string | null> {
  switch (source) {
    case 'camera':
      return pickFromCamera();
    case 'library':
      return pickFromLibrary();
    case 'files':
      return pickFromFiles();
    default:
      return null;
  }
}
