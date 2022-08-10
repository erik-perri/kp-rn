import {useMemo} from 'react';
import {StyleSheet} from 'react-native';

import {useTheme} from '../components/ThemeProvider';

function objectEntries<ObjectType>(
  obj: ObjectType,
): [keyof ObjectType, ObjectType[keyof ObjectType]][] {
  return Object.entries(obj) as [
    keyof ObjectType,
    ObjectType[keyof ObjectType],
  ][];
}

export function useStyleProps<
  AvailableProps extends {},
  AvailableStyleProps extends AvailableProps,
>(props: AvailableProps, supportedStyles: Array<keyof AvailableStyleProps>) {
  const {processThemeProps} = useTheme();

  const styleFromProps = useMemo(() => {
    const foundStyles: Partial<AvailableProps> = {};

    objectEntries(props).forEach(([key, value]) => {
      if (supportedStyles.includes(key)) {
        foundStyles[key] = value;
      }
    });

    return StyleSheet.create({
      root: processThemeProps(foundStyles),
    }).root;
  }, [processThemeProps, props, supportedStyles]);

  const propsWithoutStyle = useMemo(() => {
    const withoutStyle: AvailableProps = {...props};

    objectEntries(props).forEach(([key]) => {
      if (supportedStyles.includes(key)) {
        delete withoutStyle[key];
      }
    });

    return processThemeProps(withoutStyle);
  }, [processThemeProps, props, supportedStyles]);

  return {propsWithoutStyle, styleFromProps};
}
