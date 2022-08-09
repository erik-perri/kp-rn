import React, {FunctionComponent} from 'react';
import {View, ViewProps, ViewStyle} from 'react-native';

import {useStyleProps} from '../hooks/useStyleProps';
import {ToThemeStyle} from '../theme/types';

type BoxStyleProps = ToThemeStyle<Omit<ViewStyle, 'testID'>>;

interface BoxProps extends ViewProps, BoxStyleProps {
  //
}

const Box: FunctionComponent<BoxProps> = ({children, style, ...props}) => {
  const {propsWithoutStyle, styleFromProps} = useStyleProps<
    BoxProps,
    BoxStyleProps
  >(props, [
    'backfaceVisibility',
    'backgroundColor',
    'borderBottomColor',
    'borderBottomEndRadius',
    'borderBottomLeftRadius',
    'borderBottomRightRadius',
    'borderBottomStartRadius',
    'borderBottomWidth',
    'borderColor',
    'borderEndColor',
    'borderLeftColor',
    'borderLeftWidth',
    'borderRadius',
    'borderRightColor',
    'borderRightWidth',
    'borderStartColor',
    'borderStyle',
    'borderTopColor',
    'borderTopEndRadius',
    'borderTopLeftRadius',
    'borderTopRightRadius',
    'borderTopStartRadius',
    'borderTopWidth',
    'borderWidth',
    'opacity',
    'elevation',
  ]);

  return (
    <View style={[styleFromProps, style]} {...propsWithoutStyle}>
      {children}
    </View>
  );
};

export default Box;
