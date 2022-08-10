import React, {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
} from 'react';

import extractFromObject from '../lib/utilities/extractFromObject';
import {
  BorderRadiusProps,
  ColorProps,
  OpacityProps,
  SpacingProps,
  Theme,
  ThemeOpacity,
} from '../theme/types';

interface ThemeState {
  processThemeProps: (
    props: Record<string, unknown>,
  ) => Record<string, unknown>;
  theme: Theme;
}

interface ThemeProviderProps extends PropsWithChildren {
  theme: Theme;
}

const ThemeContext = createContext<ThemeState>({
  processThemeProps: () => {
    throw new Error('Not implemented');
  },
  theme: {} as unknown as Theme,
});

const ThemeProvider: FunctionComponent<ThemeProviderProps> = ({
  children,
  theme,
}) => {
  const isThemeOpacity = useCallback(
    (opacity: unknown): opacity is ThemeOpacity => {
      return (
        (typeof opacity === 'string' || typeof opacity === 'number') &&
        typeof theme.opacity[opacity as ThemeOpacity] !== 'undefined'
      );
    },
    [theme.opacity],
  );

  const processColorProps = useCallback(
    (inputProps: Record<string, unknown>): Record<string, unknown> => {
      const updatedProps: Record<string, unknown> = {};

      for (let [prop, value] of Object.entries(inputProps)) {
        if (!Array.prototype.includes.call(ColorProps, prop)) {
          updatedProps[prop] = value;
          continue;
        }

        let opacity: ThemeOpacity | undefined;
        if (Array.isArray(value)) {
          if (!isThemeOpacity(value[1])) {
            console.warn(`Unexpected opacity for ${prop}: "${value[1]}"`);
          } else {
            opacity = value[1];
          }

          value = value[0];
        }

        if (typeof value !== 'string' && typeof value !== 'number') {
          console.warn('Unexpected prop type', prop, '=', value);
        } else {
          try {
            updatedProps[prop] = extractFromObject(theme.colors, `${value}`);
          } catch (e) {
            console.warn('Unexpected prop path', e);
          }
        }

        if (opacity !== undefined && updatedProps[prop] !== undefined) {
          // TODO Parse color instead of assuming 6 digit hex?
          const opacityValue = Math.round(
            theme.opacity[opacity] * 255,
          ).toString(16);
          updatedProps[prop] = `${updatedProps[prop]}${opacityValue}`;
        }
      }

      return updatedProps;
    },
    [isThemeOpacity, theme.colors, theme.opacity],
  );

  const processProps = useCallback(
    (
      inputProps: Record<string, unknown>,
      supportedProps: unknown,
      themeValues: Record<string, unknown>,
    ): Record<string, unknown> => {
      const updatedProps: Record<string, unknown> = {};

      for (const [prop, value] of Object.entries(inputProps)) {
        if (!Array.prototype.includes.call(supportedProps, prop)) {
          updatedProps[prop] = value;
          continue;
        }

        if (typeof value !== 'string' && typeof value !== 'number') {
          console.warn('Unexpected prop type', prop, '=', value);
        } else {
          try {
            updatedProps[prop] = extractFromObject(themeValues, `${value}`);
          } catch (e) {
            console.warn('Unexpected prop path', e);
          }
        }
      }

      return updatedProps;
    },
    [],
  );

  const processThemeProps = useCallback(
    (props: Record<string, unknown>): Record<string, unknown> => {
      let updatedProps = processColorProps(props);

      for (const [supportedProps, themeValues] of [
        [SpacingProps, theme.spacing],
        [BorderRadiusProps, theme.borderRadius],
        [OpacityProps, theme.opacity],
      ]) {
        updatedProps = processProps(
          updatedProps,
          supportedProps,
          themeValues as Record<string, unknown>,
        );
      }

      return updatedProps;
    },
    [
      processColorProps,
      processProps,
      theme.borderRadius,
      theme.opacity,
      theme.spacing,
    ],
  );

  return (
    <ThemeContext.Provider
      value={{
        processThemeProps,
        theme,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
