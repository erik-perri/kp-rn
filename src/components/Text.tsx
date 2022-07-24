import React, {FunctionComponent} from 'react';
import {
  Omit,
  Text as RnText,
  TextProps as RnTextProps,
  TextStyle,
} from 'react-native';

import {useStyleProps} from '../hooks/useStyleProps';

type TextStyleProps = Omit<TextStyle, 'testID'>;

interface TextProps extends RnTextProps, TextStyleProps {
  //
}

const Text: FunctionComponent<TextProps> = ({children, style, ...props}) => {
  const {propsWithoutStyle, styleFromProps} = useStyleProps<
    TextProps,
    TextStyleProps
  >(props, [
    'color',
    'fontFamily',
    'fontSize',
    'fontStyle',
    'fontWeight',
    'letterSpacing',
    'lineHeight',
    'textAlign',
    'textDecorationLine',
    'textDecorationStyle',
    'textDecorationColor',
    'textShadowColor',
    'textShadowOffset',
    'textShadowRadius',
    'textTransform',
  ]);

  return (
    <RnText style={[styleFromProps, style]} {...propsWithoutStyle}>
      {children}
    </RnText>
  );
};

export default Text;
