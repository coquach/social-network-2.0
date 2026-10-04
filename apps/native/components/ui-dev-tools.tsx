import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useCrisisStore } from '@repo/shared';

const RESOURCES = [
  { name: 'Đường dây nóng Ngày Mai', phone: '1900 599 830' },
  { name: 'Tổng đài Quốc gia', phone: '111' },
];

/** Dev-only panel to trigger mock UI states without running the full flow. */
export const UIDevTools = () => {
  const { triggerCrisis, dismissCrisis } = useCrisisStore();

  if (!__DEV__) return null;

  return (
    <View style={styles.panel} pointerEvents="box-none">
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: '#e11d48' }]}
        onPress={() => triggerCrisis({ severity: 'high', resources: RESOURCES, notificationSent: true })}
      >
        <Text style={styles.text}>Crisis</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: '#ef4444' }]}
        onPress={() => triggerCrisis({ severity: 'medium', resources: [], notificationSent: true })}
      >
        <Text style={styles.text}>Toast</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, { backgroundColor: '#64748b' }]} onPress={dismissCrisis}>
        <Text style={styles.text}>Dismiss</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: { position: 'absolute', left: 8, bottom: 120, gap: 6, zIndex: 9998 },
  btn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  text: { color: '#fff', fontSize: 11, fontWeight: '600' },
});
