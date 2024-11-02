import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useState, useEffect } from 'react';
import Slider from '@react-native-community/slider';
import { useBluetooth } from 'rn-bluetooth-classic';

export default function TabOneScreen() {
  const { connectedDevice, writeToDevice } = useBluetooth();
  const [sliderValue1, setSliderValue1] = useState(0);
  const [sliderValue2, setSliderValue2] = useState(0);
  const [key1, setKey1] = useState(0);  // Add keys to force re-render
  const [key2, setKey2] = useState(0);

  useEffect(() => {
    if (connectedDevice) {
      // Reset slider values when a device is connected
      setSliderValue1(0);
      setSliderValue2(0);
    }
  }, [connectedDevice]);

  const handleSliderChange = async (value: number, sliderNumber: number) => {
    if (connectedDevice) {
      try {
        const message = `M${sliderNumber}:${value}`;
        await writeToDevice(message, 'utf8');
      } catch (error) {
        console.error('Failed to send message', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Slider Controls</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      
      <View style={styles.slidersContainer}>
        <View style={styles.sliderColumn}>
          <View style={styles.sliderWrapper}>
            <Slider
              key={key1}  // Add key prop
              style={styles.slider}
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
              }}
            />
          </View>
          <Text style={styles.valueText}>{sliderValue1}</Text>
        </View>

        <View style={styles.sliderColumn}>
          <View style={styles.sliderWrapper}>
            <Slider
              key={key2}  // Add key prop
              style={styles.slider}
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
                setKey2(prev => prev + 1);  // Increment key to force re-render
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
  sliderColumn: {
    alignItems: 'center',
    height: 340, // Enough height for slider + text
  },
  sliderWrapper: {
    height: 300,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    width: 300,
    height: 40,
    transform: [{ rotate: '-90deg' }],
  },
  valueText: {
    marginTop: 10,
  },
});