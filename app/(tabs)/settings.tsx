import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, Button, FlatList, TouchableOpacity, Alert, View } from 'react-native';
import { Text } from '@/components/Themed';
import { useBluetooth } from 'rn-bluetooth-classic';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import base64 from 'react-native-base64';

export default function TabTwoScreen() {
  const colorScheme = useColorScheme();
  const { connectedDevice, writeToDevice, receivedData } = useBluetooth();
  const [name, setName] = useState('');
  const [motorPinA, setMotorPinA] = useState<number[]>([]);
  const [motorPinB, setMotorPinB] = useState<number[]>([]);
  const [incomingData, setIncomingData] = useState('');

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
        const parsedData = JSON.parse(decodedData);
        setName(parsedData.name);
        setMotorPinA(parsedData.motorPinA);
        setMotorPinB(parsedData.motorPinB);
        setIncomingData(JSON.stringify(parsedData, null, 2)); // Pretty print JSON
      } catch (error) {
        console.error('Failed to decode or parse JSON:', error);
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

  const saveSettings = async () => {
    const settings = {
      name,
      motorPinA,
      motorPinB,
    };
    const settingsString = JSON.stringify(settings);
    try {
      await writeToDevice(connectedDevice?.address, `s/${settingsString}\n`, 'utf8');
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const restartESP32 = async () => {
    try {
      await writeToDevice(connectedDevice?.address, 'r\n', 'utf8');
      Alert.alert('Success', 'ESP32 restarted successfully');
    } catch (error) {
      console.error('Failed to restart ESP32', error);
      Alert.alert('Error', 'Failed to restart ESP32');
    }
  };

  const addMotor = () => {
    if (motorPinA.length < 4 && motorPinB.length < 4) {
      setMotorPinA([...motorPinA, -1]);
      setMotorPinB([...motorPinB, -1]);
    } else {
      Alert.alert('Error', 'Maximum of 4 motors allowed');
    }
  };

  const deleteMotor = (index: number) => {
    setMotorPinA(motorPinA.filter((_, i) => i !== index));
    setMotorPinB(motorPinB.filter((_, i) => i !== index));
  };

  const textColor = colorScheme === 'dark' ? 'white' : 'black';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Settings</Text>
        <TouchableOpacity onPress={fetchSettings} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={textColor} />
        </TouchableOpacity>
      </View>
      <View style={styles.nameContainer}>
        <Text style={[styles.label, { color: textColor }]}>Name:</Text>
        <TextInput
          style={[styles.nameInput, { color: textColor }]}
          placeholder="Name"
          placeholderTextColor={textColor}
          value={name}
          onChangeText={setName}
        />
      </View>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { color: textColor }]}>Motor</Text>
          <Text style={[styles.tableHeaderText, { color: textColor }]}>Pin A</Text>
          <Text style={[styles.tableHeaderText, { color: textColor }]}>Pin B</Text>
          <Text style={[styles.tableHeaderText, { color: textColor }]}>Remove</Text>
        </View>
        {motorPinA.map((pin, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableRowText, { color: textColor }]}>M{index + 1}</Text>
            <TextInput
              style={[styles.tableInput, { color: textColor }]}
              placeholder={`Pin A`}
              placeholderTextColor={textColor}
              keyboardType="numeric"
              value={pin.toString()}
              onChangeText={(value) => {
                const newMotorPinA = [...motorPinA];
                newMotorPinA[index] = parseInt(value, 10);
                setMotorPinA(newMotorPinA);
              }}
            />
            <TextInput
              style={[styles.tableInput, { color: textColor }]}
              placeholder={`Pin B`}
              placeholderTextColor={textColor}
              keyboardType="numeric"
              value={motorPinB[index].toString()}
              onChangeText={(value) => {
                const newMotorPinB = [...motorPinB];
                newMotorPinB[index] = parseInt(value, 10);
                setMotorPinB(newMotorPinB);
              }}
            />
            <TouchableOpacity onPress={() => deleteMotor(index)} style={styles.deleteButton}>
              <Ionicons name="close" size={24} color="red" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <TouchableOpacity onPress={addMotor} style={styles.addButton}>
        <Text style={styles.addButtonText}>Add Motor</Text>
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
        <Button title="Save Settings" onPress={saveSettings} />
        <Button title="Restart ESP32" onPress={restartESP32} />
      </View>
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
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginRight: 10,
  },
  nameInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    width: '50%',
  },
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tableHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tableRowText: {
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
  tableInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    flex: 1,
    textAlign: 'center',
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  addButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
});