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

export function useBorderRadius(
  value: ThemeBorderRadius | ThemeBorderRadius[],
) {
  return useToken('borderRadius', value);
}

export function useBorderWidth(value: ThemeBorderWidth | ThemeBorderWidth[]) {
  return useToken('borderWidth', value);
}

export function useColor(value: ThemeColor | ThemeColor[]) {
  return useToken('colors', value);
}

export function useFontSize(value: ThemeFontSize | ThemeFontSize[]) {
  return useToken('fontSize', value);
}

export function useLineHeight(value: ThemeLineHeight | ThemeLineHeight[]) {
  return useToken('lineHeight', value);
}

export function useOpacity(value: ThemeOpacity | ThemeOpacity[]) {
  return useToken('opacity', value);
}

export function useSpacing(value: ThemeSpacing | ThemeSpacing[]) {
  return useToken('spacing', value);
}
