import React, {FunctionComponent} from 'react';
import {
  Omit,
  Text as RnText,
  TextProps as RnTextProps,
  TextStyle,
} from 'react-native';

import {useStyleProps} from '../hooks/useStyleProps';
import {TextStyleProps} from '../theme/props';
import {ToThemeStyle} from '../theme/types';

type TextStyleProps = ToThemeStyle<Omit<TextStyle, 'testID'>>;

interface TextProps extends RnTextProps, TextStyleProps {
  //
}

const Text: FunctionComponent<TextProps> = ({children, style, ...props}) => {
  const {propsWithoutStyle, styleFromProps} = useStyleProps<
    TextProps,
    TextStyleProps
  >(props, [...TextStyleProps]);

  return (
    <RnText style={[styleFromProps, style]} {...propsWithoutStyle}>
      {children}
    </RnText>
  );
};

export default Text;
