import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import Slider from '@react-native-community/slider';

import { useState, useEffect } from 'react';
import { useBluetooth } from 'rn-bluetooth-classic';

import { DeviceMotion } from 'expo-sensors';

export default function TabOneScreen() {
  const { connectedDevice, writeToDevice } = useBluetooth();
  const [sliderValue1, setSliderValue1] = useState(0);
  const [sliderValue2, setSliderValue2] = useState(0);
  const [deviceName, setDeviceName] = useState("Disconnected");
  const [key1, setKey1] = useState(0);  // Add keys to force re-render
  const [key2, setKey2] = useState(0);

  const [orientation, setOrientation] = useState("Portrait");

  useEffect(() => {
    DeviceMotion.addListener((motionData) => {
      if (motionData.orientation == 0 || motionData.orientation == 180) {
        setOrientation("Portrait");
      } else {
        setOrientation("Landscape");
      }
      return () => DeviceMotion.removeAllListeners();
    });
  }, []);

  useEffect(() => {
    if (connectedDevice) {
      setDeviceName(connectedDevice.name);
      setSliderValue1(0);
      setSliderValue2(0);
    } else {
      setDeviceName("Disconnected");
    }
  }, [connectedDevice]);

  const handleSliderChange = async (value: number, sliderNumber: number) => {
    if (connectedDevice) {
      try {
        const message = `m${sliderNumber}/${value}\n`
        await writeToDevice(connectedDevice.address, message, 'utf8');
      } catch (error) {
        console.error('Failed to send message', error);
      }
    }
  };

  const getStyles = (orientation: string) => {
    if (orientation === "Landscape") {
      return {
        sliderColumn: {
          alignItems: 'center',
          height: 140, // Original height
          width: 100, // Adjusted width
        },
        sliderWrapper: {
          height: 100, // Original height
          width: 40, // Adjusted width
          justifyContent: 'center',
          alignItems: 'center',
        },
        slider: {
          width: 100, // Original width
          height: 40, // Adjusted height
          transform: [{ rotate: '-90deg' }], // Original rotation
        },
      };
    } else {
      return {
        sliderColumn: {
          alignItems: 'center',
          height: 340, // Original height
          width: 100, // Adjusted width
        },
        sliderWrapper: {
          height: 300, // Original height
          width: 40, // Adjusted width
          justifyContent: 'center',
          alignItems: 'center',
        },
        slider: {
          width: 300, // Original width
          height: 40, // Adjusted height
          transform: [{ rotate: '-90deg' }], // Original rotation
        },
      };
    }
  };

  const dynamicStyles = getStyles(orientation);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{deviceName}</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      
      <View style={styles.slidersContainer}>
        <View style={dynamicStyles.sliderColumn}>
          <View style={dynamicStyles.sliderWrapper}>
            <Slider
              key={key1}  // Add key prop
              style={dynamicStyles.slider}
              minimumValue={-255}
              maximumValue={255}
              value={sliderValue1}   // Set initial value directly
              onValueChange={(value) => {
                setSliderValue1(value);
                handleSliderChange(value, 1);
              }}
              step={1}
              disabled={!connectedDevice}
              onSlidingComplete={() => {
                setSliderValue1(0);
                setKey1(prev => prev + 1);  // Increment key to force re-render
                handleSliderChange(0, 1);
              }}
            />
          </View>
          <Text style={styles.valueText}>{sliderValue1}</Text>
        </View>

        <View style={dynamicStyles.sliderColumn}>
          <View style={dynamicStyles.sliderWrapper}>
            <Slider
              key={key2}  // Add key prop
              style={dynamicStyles.slider}
              minimumValue={-255}
              maximumValue={255}
              value={sliderValue2}   // Set initial value directly
              onValueChange={(value) => {
                setSliderValue2(value);
                handleSliderChange(value, 2);
              }}
              step={1}
              disabled={!connectedDevice}
              onSlidingComplete={() => {
                setSliderValue2(0);
                setKey2(prev => prev + 1); // Increment key to force re-render
                handleSliderChange(0, 2);
              }}
            />
          </View>
          <Text style={styles.valueText}>{sliderValue2}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  slidersContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 100,
  },
  valueText: {
    marginTop: 10,
  },
});