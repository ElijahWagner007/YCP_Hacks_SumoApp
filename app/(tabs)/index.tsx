import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import Slider from '@react-native-community/slider';
import { useState, useEffect } from 'react';
import { useBluetooth } from 'rn-bluetooth-classic';
import * as ScreenOrientation from 'expo-screen-orientation';


export default function TabOneScreen() {
  const { connectedDevice, writeToDevice } = useBluetooth();
  const [sliderValue1, setSliderValue1] = useState(0);
  const [sliderValue2, setSliderValue2] = useState(0);
  const [deviceName, setDeviceName] = useState("Unconnected");
  const [key1, setKey1] = useState(0);
  const [key2, setKey2] = useState(0);  

  let isLandscape: boolean = false;
  useEffect(() => {
    isLandscape = !isLandscape
  }, [ScreenOrientation.Orientation]);

  useEffect(() => {
    if (connectedDevice) {
      setDeviceName(connectedDevice.name);
      setSliderValue1(0);
      setSliderValue2(0);
    } else {
      setDeviceName("Unconnected");
    }
  }, [connectedDevice]);

  const handleSliderChange = async (value: number, sliderNumber: number) => {
    if (connectedDevice) {
      try {
        const message = `m${sliderNumber}/${value}\n`;
        await writeToDevice(connectedDevice.address, message, 'utf8');
      } catch (error) {
        console.error('Failed to send message', error);
      }
    }
  };

  
  return (
    <View style={styles.container}>   
      <View style={[
          styles.slidersContainer, 
          isLandscape ? styles.slidersContainerLandscape : styles.slidersContainerPortrait
        ]}
      >
        {[1, 2].map((slider, index) => (
          <View style={styles.sliderColumn} key={slider}>
            <View style={styles.sliderWrapper}>
              <Slider
                key={index === 0 ? key1 : key2}
                style={styles.slider}
                minimumValue={-255}
                maximumValue={255}
                value={index === 0 ? sliderValue1 : sliderValue2}
                onValueChange={(value) => {
                  if (index === 0) {
                    setSliderValue1(value);
                    handleSliderChange(value, 1);
                  } else {
                    setSliderValue2(value);
                    handleSliderChange(value, 2);
                  }
                }}
                step={1}
                disabled={!connectedDevice}
                onSlidingComplete={() => {
                  if (index === 0) {
                    setSliderValue1(0);
                    setKey1(prev => prev + 1);
                    handleSliderChange(0, 1);
                  } else {
                    setSliderValue2(0);
                    setKey2(prev => prev + 1);
                    handleSliderChange(0, 2);
                  }
                }}
              />
            </View>
            <Text style={styles.valueText}>{index === 0 ? sliderValue1 : sliderValue2}</Text>
          </View>
        ))}
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
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    width: '80%',
  },
  slidersContainer: {
    flexDirection: 'row',
  },
  slidersContainerPortrait: {
    alignItems: 'flex-start',
    gap: 100,
  },
  slidersContainerLandscape: {
    alignItems: 'center',
    gap: 50,
  },
  sliderColumn: {
    alignItems: 'center',
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
