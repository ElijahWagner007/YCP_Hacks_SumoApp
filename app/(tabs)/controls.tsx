import { StyleSheet } from 'react-native';
import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { useState } from 'react';
import Slider from '@react-native-community/slider';

export default function TabOneScreen() {
  let [sliderValue1, setSliderValue1] = useState(50)
  let [sliderValue2, setSliderValue2] = useState(50)
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Slider Controls</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      
      <View style={styles.slidersContainer}>
  <View style={styles.sliderContainer}>
    <Slider
      style={styles.slider}
      minimumValue={0}
      maximumValue={100}
      value={sliderValue1}
      onValueChange={setSliderValue1}
      step={1} />
  </View>

  <View style={styles.sliderContainer}>
    <Slider
      style={styles.slider}
      minimumValue={0}
      maximumValue={100}
      value={sliderValue2}
      onValueChange={setSliderValue2}
      step={1} />
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
  sliderContainer: {
    height: 300, // This will be the width of your vertical slider
    width: 40,   // This will be the height of your vertical slider
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    width: 300,  // This needs to match the container height
    height: 40,  // This needs to match the container width
    transform: [{ rotate: '-90deg' }],
  },
  slidersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 100, // Note: gap might not work on older React Native versions
    // alternatively use marginRight on sliderContainer
  },
});