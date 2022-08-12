import {useTheme} from '../components/ThemeProvider';
import extractFromObject from '../lib/utilities/extractFromObject';
import {
  ExtractColors,
  Theme,
  ThemeBorderRadius,
  ThemeBorderWidth,
  ThemeColor,
  ThemeFontSize,
  ThemeLineHeight,
  ThemeOpacity,
  ThemeSpacing,
} from '../theme/types';

export default function useToken<
  Source extends keyof Theme,
  Value extends 'colors' extends Source
    ? ExtractColors<Theme[Source]> | ExtractColors<Theme[Source]>[]
    : keyof Theme[Source] | (keyof Theme[Source])[],
  ReturnBase extends 'colors' extends Source ? string : number,
  Return extends [] extends Value ? ReturnBase[] : ReturnBase,
>(source: Source, value: Value): Return {
  const {theme} = useTheme();

  if (!Array.isArray(value)) {
    return extractFromObject(theme[source], String(value)) as Return;
  }

  const result: ReturnBase[] = [];
  for (const path of value) {
    result.push(extractFromObject(theme[source], String(path)) as ReturnBase);
  }
  return result as Return;
}

export function useBorderRadius<
  Value extends ThemeBorderRadius | ThemeBorderRadius[],
  Return extends [] extends Value ? number[] : number,
>(value: Value): Return {
  return useToken('borderRadius', value);
}

export function useBorderWidth<
  Value extends ThemeBorderWidth | ThemeBorderWidth[],
  Return extends [] extends Value ? number[] : number,
>(value: Value): Return {
  return useToken('borderWidth', value);
}

export function useColor<
  Value extends ThemeColor | ThemeColor[],
  Return extends [] extends Value ? string[] : string,
>(value: Value): Return {
  return useToken('colors', value);
}

export function useFontSize<
  Value extends ThemeFontSize | ThemeFontSize[],
  Return extends [] extends Value ? number[] : number,
>(value: Value): Return {
  return useToken('fontSize', value);
}

export function useLineHeight<
  Value extends ThemeLineHeight | ThemeLineHeight[],
  Return extends [] extends Value ? number[] : number,
>(value: Value): Return {
  return useToken('lineHeight', value);
}

export function useOpacity<
  Value extends ThemeOpacity | ThemeOpacity[],
  Return extends [] extends Value ? number[] : number,
>(value: Value): Return {
  return useToken('opacity', value);
}

export function useSpacing<
  Value extends ThemeSpacing | ThemeSpacing[],
  Return extends [] extends Value ? number[] : number,
>(value: Value): Return {
  return useToken('spacing', value);
}
