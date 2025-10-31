import React from 'react';
import { Image, StyleSheet } from 'react-native';

interface LogoProps {
  width?: number;
  height?: number;
  style?: any;
}

export default function AriomeLogo({ width = 200, height = 100, style }: LogoProps) {
  return (
    <Image
      source={require('../../assets/images/ariome-logo.png')}
      style={[
        {
          width,
          height,
          resizeMode: 'contain',
        },
        style,
      ]}
    />
  );
}
