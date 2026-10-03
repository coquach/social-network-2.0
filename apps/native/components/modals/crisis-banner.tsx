import React from 'react';
import { View, Text, TouchableOpacity, Linking, Modal, StyleSheet } from 'react-native';
import { useCrisisStore } from '@repo/shared';
import { AntDesign, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CrisisBanner() {
  const { activeCrisis, dismissCrisis } = useCrisisStore();
  const insets = useSafeAreaInsets();

  if (!activeCrisis) {
    return null;
  }

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const resources = activeCrisis.resources && activeCrisis.resources.length > 0
    ? activeCrisis.resources
    : [{ name: 'Đường dây nóng bảo vệ Trẻ em & Tâm lý', phone: '111' }];

  const isHighSeverity = activeCrisis.severity === 'high';

  if (!isHighSeverity) {
    return (
      <View style={[styles.toastContainer, { top: insets.top + 10 }]}>
        <View style={styles.toastContent}>
          <Feather name="info" size={20} color="#ffffff" />
          <Text style={styles.toastText}>
            Hệ thống nhận thấy bạn đang có dấu hiệu căng thẳng. Vui lòng kiểm tra mục thông báo để xem hỗ trợ.
          </Text>
        </View>
        <TouchableOpacity onPress={dismissCrisis} style={styles.toastClose}>
          <AntDesign name="close" size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Modal visible={!!activeCrisis} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Feather name="alert-triangle" size={24} color="#ffffff" />
              <Text style={styles.headerTitle}>Cảnh báo khẩn cấp</Text>
            </View>
            <TouchableOpacity onPress={dismissCrisis} style={styles.closeButton}>
              <AntDesign name="close" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.description}>
              Hệ thống nhận thấy bạn đang trải qua khủng hoảng tâm lý nghiêm trọng. 
              An toàn của bạn là ưu tiên hàng đầu. Xin hãy liên hệ ngay với những nguồn hỗ trợ dưới đây:
            </Text>

            <View style={styles.resourcesList}>
              {resources.map((resource, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.resourceCard}
                  onPress={() => handleCall(resource.phone)}
                >
                  <View style={styles.iconContainer}>
                    <Feather name="phone-call" size={20} color="#ffffff" />
                  </View>
                  <View style={styles.resourceInfo}>
                    <Text style={styles.resourceName}>{resource.name}</Text>
                    <Text style={styles.resourcePhone}>{resource.phone}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.dismissButton} onPress={dismissCrisis}>
              <Text style={styles.dismissButtonText}>Đã hiểu, đóng thông báo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  toastContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
  },
  toastClose: {
    padding: 4,
    marginLeft: 8,
  },
  container: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e11d48',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    backgroundColor: '#e11d48',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
  },
  resourcesList: {
    gap: 12,
    marginBottom: 24,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  iconContainer: {
    backgroundColor: '#f43f5e',
    padding: 10,
    borderRadius: 999,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#be123c',
    marginBottom: 4,
  },
  resourcePhone: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e11d48',
  },
  dismissButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  dismissButtonText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
