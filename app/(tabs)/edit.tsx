import React, { useRef, useState, useEffect } from 'react';
import { PanResponder, View } from 'react-native';
import { useBluetooth } from 'rn-bluetooth-classic';

export default function LineDrawer() {
  const maxRadius = 150; // Boundary radius
  const [lineCoordinates, setLineCoordinates] = useState({ startX: 0, startY: 0, endX: 0, endY: 0 });
  const { connectedDevice, writeToDevice } = useBluetooth();

  const handleJoystickChange = async () => {
    if (connectedDevice) {
      try {
        const X_Power = -(lineCoordinates.endX - lineCoordinates.startX) / maxRadius;
        const Y_Power = -(lineCoordinates.endY - lineCoordinates.startY) / maxRadius;

        const m1_Power = Math.round((Y_Power - X_Power) * 255);
        const m2_Power = Math.round((Y_Power + X_Power) * 255);

        const message1 = `m1/${m1_Power}\n`;
        const message2 = `m2/${m2_Power}\n`;

        await writeToDevice(connectedDevice.address, message1, 'utf8');
        await writeToDevice(connectedDevice.address, message2, 'utf8');
      } catch (error) {
        console.error('Failed to send message', error);
      }
    }
  };

  useEffect(() => {
    handleJoystickChange();
  }, [lineCoordinates]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setLineCoordinates({
          startX: locationX,
          startY: locationY,
          endX: locationX,
          endY: locationY,
        });
      },
      onPanResponderMove: (evt, gestureState) => {
        const dx = gestureState.dx;
        const dy = gestureState.dy;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const limitedDx = distance > maxRadius ? (dx / distance) * maxRadius : dx;
        const limitedDy = distance > maxRadius ? (dy / distance) * maxRadius : dy;

        setLineCoordinates((prev) => ({
          ...prev,
          endX: prev.startX + limitedDx,
          endY: prev.startY + limitedDy,
        }));
      },
      onPanResponderRelease: () => {
        setLineCoordinates({ startX: 0, startY: 0, endX: 0, endY: 0 });
      },
    })
  ).current;

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers} />
  );
}
