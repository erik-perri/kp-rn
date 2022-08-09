import React, {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
} from 'react';

import {
  BorderRadiusProps,
  ColorProps,
  SpacingProps,
  Theme,
} from '../theme/types';

interface ThemeState {
  processStyleProps: (
    props: Record<string, unknown>,
  ) => Record<string, unknown>;
  theme: Theme;
}

interface ThemeProviderProps extends PropsWithChildren {
  theme: Theme;
}

const ThemeContext = createContext<ThemeState>({
  processStyleProps: () => {
    throw new Error('Not implemented');
  },
  theme: {} as unknown as Theme,
});

function extractFromObject(
  object: Record<string, unknown>,
  path: string,
): unknown | undefined {
  if (object[path]) {
    return object[path];
  }

  const firstDot = path.indexOf('.');
  if (firstDot === -1) {
    console.warn('Unexpected prop path', path);
    return undefined;
  }

  const branch = path.substring(0, firstDot);
  if (!object[branch] || typeof object[branch] !== 'object') {
    console.warn('Unexpected prop path', path, branch);
    return undefined;
  }

  return extractFromObject(
    object[branch] as Record<string, unknown>,
    path.substring(firstDot + 1),
  );
}

const ThemeProvider: FunctionComponent<ThemeProviderProps> = ({
  children,
  theme,
}) => {
  const propsMap = useMemo<[unknown, Record<string, unknown>][]>(
    () => [
      [ColorProps, theme.colors],
      [SpacingProps, theme.spacing],
      [BorderRadiusProps, theme.borderRadius],
    ],
    [theme],
  );

  const processStyleProps = useCallback(
    (props: Record<string, unknown>): Record<string, unknown> => {
      const updatedProps: Record<string, unknown> = {};

      for (const [prop, value] of Object.entries(props)) {
        let updatedCurrentProp = false;

        for (const [propNames, themeObject] of propsMap) {
          if (Array.prototype.includes.call(propNames, prop)) {
            if (typeof value !== 'string' && typeof value !== 'number') {
              console.warn('Unexpected prop type', prop, '=', value);
            } else {
              updatedProps[prop] = extractFromObject(themeObject, `${value}`);
            }

            // We mark the prop as updated regardless of whether we successfully
            // updated under the assumption that if we were provided an
            // unexpected value type we should not pass it on.
            updatedCurrentProp = true;
          }
        }

        if (!updatedCurrentProp) {
          updatedProps[prop] = value;
        }
      }

      return updatedProps;
    },
    [propsMap],
  );

  return (
    <ThemeContext.Provider
      value={{
        processStyleProps,
        theme,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
