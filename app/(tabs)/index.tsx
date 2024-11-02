import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useState } from 'react';
import Slider from '@react-native-community/slider';

export default function TabOneScreen() {
  let [sliderValue1, setSliderValue1] = useState(0)
  let [sliderValue2, setSliderValue2] = useState(0)
  let [key1, setKey1] = useState(0)  // Add keys to force re-render
  let [key2, setKey2] = useState(0)
  
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
              onValueChange={setSliderValue1}
              step={1}
              onSlidingComplete={() => {
                setSliderValue1(0);
                setKey1(prev => prev + 1);  // Increment key to force re-render
              }} />
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
              onValueChange={setSliderValue2}
              step={1}
              onSlidingComplete={() => {
                setSliderValue2(0);
                setKey2(prev => prev + 1);  // Increment key to force re-render
              }} />
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