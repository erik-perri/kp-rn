import {useMemo} from 'react';
import {StyleSheet} from 'react-native';

function objectEntries<ObjectType>(
  obj: ObjectType,
): [keyof ObjectType, ObjectType[keyof ObjectType]][] {
  return Object.entries(obj) as [
    keyof ObjectType,
    ObjectType[keyof ObjectType],
  ][];
}

export function useStyleProps<
  AvailableProps,
  AvailableStyleProps extends AvailableProps,
>(props: AvailableProps, supportedStyles: Array<keyof AvailableStyleProps>) {
  const styleFromProps = useMemo(() => {
    const foundStyles: Partial<AvailableProps> = {};

    objectEntries(props).forEach(([key, value]) => {
      if (supportedStyles.includes(key)) {
        foundStyles[key] = value;
      }
    });

    return StyleSheet.create({
      root: foundStyles,
    }).root;
  }, [props, supportedStyles]);

  const propsWithoutStyle = useMemo(() => {
    const withoutStyle: AvailableProps = {...props};

    objectEntries(props).forEach(([key]) => {
      if (supportedStyles.includes(key)) {
        delete withoutStyle[key];
      }
    });

    return withoutStyle;
  }, [props, supportedStyles]);

  return {propsWithoutStyle, styleFromProps};
}
