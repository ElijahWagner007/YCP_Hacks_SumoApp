import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useBluetooth } from 'rn-bluetooth-classic';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import base64 from 'react-native-base64';

export default function TabTwoScreen() {
  const colorScheme = useColorScheme();
  const { connectedDevice, writeToDevice, receivedData } = useBluetooth();
  const [data, setData] = useState('');

  useEffect(() => {
    if (connectedDevice) {
      fetchSettings();
      console.log('Connected to device:', connectedDevice);
    }
  }, [connectedDevice]);

  useEffect(() => {
    if (receivedData) {
      try {
        const trimmedData = receivedData.replace(/\n/g, ''); // Remove \n characters
        const decodedData = base64.decode(trimmedData);
        setData(decodedData);
      } catch (error) {
        console.error('Failed to decode received data', error);
      }
    }
  }, [receivedData]);

  const fetchSettings = async () => {
    try {
      await writeToDevice(connectedDevice?.address, 'g\n', 'utf8');
    } catch (error) {
      console.error('Failed to fetch settings', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity onPress={fetchSettings} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
        </TouchableOpacity>
      </View>
      <Text style={styles.data}>{data}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 10,
  },
  refreshButton: {
    padding: 10,
  },
  data: {
    marginTop: 20,
  },
});