import React, {FunctionComponent, PropsWithChildren, useMemo} from 'react';
import {
  StyleSheet,
  Text as RnText,
  TextProps as RnTextProps,
  TextStyle,
} from 'react-native';

interface TextProps extends RnTextProps, PropsWithChildren {
  fontFamily?: TextStyle['fontFamily'];
  fontSize?: TextStyle['fontSize'];
  fontWeight?: TextStyle['fontWeight'];
  textAlign?: TextStyle['textAlign'];
}

const Text: FunctionComponent<TextProps> = ({
  children,
  fontFamily,
  fontSize,
  fontWeight,
  style,
  textAlign,
  ...props
}) => {
  const stylesFromProps = useMemo(
    () =>
      StyleSheet.create({
        view: {
          fontFamily,
          fontSize,
          fontWeight,
          textAlign,
        },
      }),
    [fontFamily, fontSize, fontWeight, textAlign],
  );

  return (
    <RnText style={[stylesFromProps.view, style]} {...props}>
      {children}
    </RnText>
  );
};

export default Text;
