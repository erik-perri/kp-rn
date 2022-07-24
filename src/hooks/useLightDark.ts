import {useMemo} from 'react';
import {useColorScheme} from 'react-native';

export default function useLightDark<Type>(
  lightColor: Type,
  darkColor: Type,
): Type {
  const scheme = useColorScheme();

  return useMemo(
    () => (scheme === 'dark' ? darkColor : lightColor),
    [darkColor, lightColor, scheme],
  );
}
