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
  const {processStyleProps} = useTheme();

  const styleFromProps = useMemo(() => {
    const foundStyles: Partial<AvailableProps> = {};

    objectEntries(props).forEach(([key, value]) => {
      if (supportedStyles.includes(key)) {
        foundStyles[key] = value;
      }
    });

    return StyleSheet.create({
      root: processStyleProps(foundStyles),
    }).root;
  }, [processStyleProps, props, supportedStyles]);

  const propsWithoutStyle = useMemo(() => {
    const withoutStyle: AvailableProps = {...props};

    objectEntries(props).forEach(([key]) => {
      if (supportedStyles.includes(key)) {
        delete withoutStyle[key];
      }
    });

    return processStyleProps(withoutStyle);
  }, [processStyleProps, props, supportedStyles]);

  return {propsWithoutStyle, styleFromProps};
}
