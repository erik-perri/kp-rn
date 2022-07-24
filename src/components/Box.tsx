import React, {FunctionComponent, PropsWithChildren, useMemo} from 'react';
import {StyleSheet, View, ViewProps, ViewStyle} from 'react-native';

interface BoxProps extends ViewProps, PropsWithChildren {
  alignItems?: ViewStyle['alignItems'];
  backgroundColor?: ViewStyle['backgroundColor'];
  borderWidth?: ViewStyle['borderWidth'];
  borderColor?: ViewStyle['borderColor'];
  flex?: ViewStyle['flex'];
  flexDirection?: ViewStyle['flexDirection'];
  height?: ViewStyle['height'];
  justifyContent?: ViewStyle['justifyContent'];
  margin?: ViewStyle['margin'];
  marginTop?: ViewStyle['marginTop'];
  marginBottom?: ViewStyle['marginBottom'];
  marginLeft?: ViewStyle['marginLeft'];
  marginRight?: ViewStyle['marginRight'];
  padding?: ViewStyle['padding'];
  paddingTop?: ViewStyle['paddingTop'];
  paddingBottom?: ViewStyle['paddingBottom'];
  paddingLeft?: ViewStyle['paddingLeft'];
  paddingRight?: ViewStyle['paddingRight'];
  width?: ViewStyle['width'];
}

const Box: FunctionComponent<BoxProps> = ({
  alignItems,
  backgroundColor,
  borderWidth,
  borderColor,
  children,
  flex,
  flexDirection,
  height,
  justifyContent,
  margin,
  marginBottom,
  marginLeft,
  marginRight,
  marginTop,
  padding,
  paddingBottom,
  paddingLeft,
  paddingRight,
  paddingTop,
  style,
  width,
  ...props
}) => {
  const stylesFromProps = useMemo(
    () =>
      StyleSheet.create({
        view: {
          alignItems,
          backgroundColor,
          borderWidth,
          borderColor,
          flex,
          flexDirection,
          height,
          justifyContent,
          margin,
          marginBottom,
          marginLeft,
          marginRight,
          marginTop,
          padding,
          paddingBottom,
          paddingLeft,
          paddingRight,
          paddingTop,
          width,
        },
      }),
    [
      alignItems,
      backgroundColor,
      borderWidth,
      borderColor,
      flex,
      flexDirection,
      height,
      justifyContent,
      margin,
      marginBottom,
      marginLeft,
      marginRight,
      marginTop,
      padding,
      paddingBottom,
      paddingLeft,
      paddingRight,
      paddingTop,
      width,
    ],
  );

  return (
    <View style={[stylesFromProps.view, style]} {...props}>
      {children}
    </View>
  );
};

export default Box;
