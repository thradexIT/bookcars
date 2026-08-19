import React, { useState, useRef } from 'react';
import { 
  StyleSheet, View, TouchableOpacity, Text, Modal, 
  SafeAreaView, Dimensions, Image 
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, RefreshCcw, Cpu } from 'lucide-react-native';

interface ValidatedCameraProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
  label: string;
  expectedType?: 'dashboard' | 'car';
  silhouetteImg?: any;
}

export default function ValidatedCamera({ 
  visible, 
  onClose, 
  onCapture, 
  label,
  expectedType = 'car',
  silhouetteImg
}: ValidatedCameraProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const cameraRef = useRef<any>(null);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.permissionContainer}>
          <Text style={styles.message}>Necesitamos tu permiso para usar la cámara</Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Conceder Permiso</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={onClose}>
            <Text style={styles.buttonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: false,
        });
        onCapture(photo.uri);
        onClose();
      } catch (error) {
        console.error("Error taking picture:", error);
      }
    }
  };

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{label}</Text>
          <TouchableOpacity onPress={onClose} style={styles.iconButton}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.cameraContainer}>
          <CameraView 
            style={styles.camera} 
            facing={facing}
            ref={cameraRef}
          >
            {/* Silhouette Overlay */}
            <View style={styles.overlay}>
              {silhouetteImg ? (
                <Image 
                  source={silhouetteImg} 
                  style={styles.fullSilhouette} 
                  tintColor="rgba(255,255,255,0.4)" 
                />
              ) : (
                <View style={styles.guideFrame} />
              )}
              
              <View style={styles.aiBadge}>
                <Cpu size={14} color="#fff" />
                <Text style={styles.aiText}>AI: Buscando similitudes...</Text>
              </View>

              <Text style={styles.guideText}>
                {expectedType === 'dashboard' 
                  ? "Encuadra el kilometraje" 
                  : "Alinea el vehículo con la silueta"}
              </Text>
            </View>
          </CameraView>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
            <RefreshCcw color="#fff" size={28} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureInner} />
          </TouchableOpacity>

          <View style={{ width: 44 }} /> 
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1976d2',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  closeButton: {
    backgroundColor: '#757575',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideFrame: {
    width: width * 0.8,
    height: width * 0.5,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  guideText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 8,
    fontWeight: '600',
  },
  aiBadge: {
    position: 'absolute',
    top: 40,
    backgroundColor: 'rgba(25, 118, 210, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  aiText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fullSilhouette: {
    width: width * 0.9,
    height: width * 0.7,
    resizeMode: 'contain',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  iconButton: {
    padding: 10,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#000',
  },
});
