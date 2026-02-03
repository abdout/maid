import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

const API_URL = 'https://maid-api.osmanabdout.workers.dev';

/**
 * Simple Photo Upload Test - No Auth Required
 */
export default function PhotoTestPage() {
  const [logs, setLogs] = useState<string[]>(['Ready to test upload']);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const addLog = (msg: string) => {
    console.log('[PhotoTest]', msg);
    setLogs(prev => [...prev, msg]);
  };

  const pickAndUpload = async () => {
    addLog('=== PICK IMAGE START ===');

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (result.canceled) {
      addLog('User canceled');
      return;
    }

    const asset = result.assets[0];
    addLog(`Selected: ${asset.uri.substring(0, 50)}...`);
    addLog(`Size: ${asset.width}x${asset.height}`);
    setImageUri(asset.uri);

    // Upload
    setIsUploading(true);
    addLog('=== UPLOAD START ===');

    try {
      const uri = asset.uri;
      const isWeb = Platform.OS === 'web';
      addLog(`Platform: ${Platform.OS}, isWeb: ${isWeb}`);

      const formData = new FormData();

      if (isWeb) {
        // Web: fetch blob and create File
        addLog('Fetching blob from URI...');
        const response = await fetch(uri);
        const blob = await response.blob();
        addLog(`Blob: type=${blob.type}, size=${blob.size}`);

        let mimeType = blob.type || 'image/jpeg';
        if (!mimeType || mimeType === 'application/octet-stream') {
          mimeType = 'image/jpeg';
        }
        addLog(`Final mimeType: ${mimeType}`);

        // Re-create blob with correct type if needed
        let typedBlob = blob;
        if (blob.type !== mimeType) {
          addLog('Re-creating blob with correct type...');
          const arrayBuffer = await blob.arrayBuffer();
          typedBlob = new Blob([arrayBuffer], { type: mimeType });
        }

        const file = new File([typedBlob], `photo_${Date.now()}.jpg`, { type: mimeType });
        addLog(`File: name=${file.name}, type=${file.type}, size=${file.size}`);

        formData.append('file', file);
      } else {
        // Native: use RN style
        const filename = uri.split('/').pop() || 'image.jpg';
        formData.append('file', {
          uri,
          name: filename,
          type: 'image/jpeg',
        } as unknown as Blob);
      }

      formData.append('folder', 'maids');

      addLog(`Sending to ${API_URL}/uploads/test`);

      const uploadResponse = await fetch(`${API_URL}/uploads/test`, {
        method: 'POST',
        body: formData,
      });

      addLog(`Response status: ${uploadResponse.status}`);

      const data = await uploadResponse.json();
      addLog(`Response: ${JSON.stringify(data).substring(0, 100)}`);

      if (data.success) {
        addLog('=== UPLOAD SUCCESS ===');
        setUploadedUrl(data.data.url);
      } else {
        addLog(`=== UPLOAD FAILED: ${data.error} ===`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      addLog(`=== ERROR: ${msg} ===`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
          Photo Upload Test (No Auth)
        </Text>

        {/* Upload Button */}
        <Pressable
          onPress={pickAndUpload}
          disabled={isUploading}
          style={{
            backgroundColor: isUploading ? '#ccc' : '#FF385C',
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 18 }}>
            {isUploading ? 'Uploading...' : 'Pick & Upload Photo'}
          </Text>
        </Pressable>

        {/* Preview */}
        {imageUri && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: '600', marginBottom: 8 }}>Selected Image:</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>{imageUri.substring(0, 80)}...</Text>
          </View>
        )}

        {/* Uploaded URL */}
        {uploadedUrl && (
          <View style={{ padding: 12, backgroundColor: '#e8f5e9', borderRadius: 8, marginBottom: 16 }}>
            <Text style={{ fontWeight: '600', color: '#2e7d32' }}>Upload Successful!</Text>
            <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{uploadedUrl}</Text>
          </View>
        )}

        {/* Rendered Uploaded Image */}
        {uploadedUrl && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: '600', marginBottom: 8 }}>Uploaded Image from S3:</Text>
            <Image
              source={{ uri: uploadedUrl }}
              style={{ width: '100%', height: 400, borderRadius: 12, backgroundColor: '#f0f0f0' }}
              resizeMode="contain"
              onLoad={() => addLog('Image loaded from S3!')}
              onError={(e) => addLog(`Image load error: ${e.nativeEvent.error || 'unknown'}`)}
            />
          </View>
        )}

        {/* Logs */}
        <View style={{ backgroundColor: '#1a1a1a', borderRadius: 8, padding: 12 }}>
          <Text style={{ color: '#fff', fontWeight: '600', marginBottom: 8 }}>Console Logs:</Text>
          {logs.map((log, i) => (
            <Text key={i} style={{ color: '#0f0', fontSize: 12, fontFamily: Platform.OS === 'web' ? 'monospace' : undefined }}>
              {log}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
