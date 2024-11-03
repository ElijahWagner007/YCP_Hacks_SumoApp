import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useBluetooth } from 'rn-bluetooth-classic';
import { Text, View } from '@/components/Themed';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme } from '@/components/useColorScheme';


export default function ModalScreen() {
  const { isScanning, devices, scanForDevices, connectToDevice, connectedDevice } = useBluetooth();
  const colorScheme = useColorScheme();

  // useEffect(() => {
  //   scanForDevices();
  // }, []);

  const handleDevicePress = async (device: any) => {
    try {
      await connectToDevice(device.address);
      alert(`Connected to ${device.name}`);
    } catch (error) {
      alert(`Failed to connect to ${device.name}`);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleDevicePress(item)} style={styles.deviceItem}>
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Available Devices</Text>
        <TouchableOpacity onPress={scanForDevices} disabled={isScanning}>
          <Ionicons
            name="refresh"
            size={24}
            color={isScanning ? 'gray' : (colorScheme === 'dark' ? 'white' : 'black')}
            style={styles.refreshIcon}
          />
        </TouchableOpacity>
      </View>
      {isScanning ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  refreshIcon: {
    marginLeft: 10,
  },
  deviceItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});