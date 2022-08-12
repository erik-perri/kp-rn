import {
  BorderRadiusProps,
  ColorProps,
  OpacityProps,
  SpacingProps,
} from './props';
import theme from './theme';

export type Theme = typeof theme;

export type ExtractColors<Colors> = keyof {
  [Name in keyof Colors as Colors[Name] extends string | number
    ? `${(string | number) & Name}`
    : `${(string | number) & Name}.${string & ExtractColors<Colors[Name]>}`]: 1;
};

export type ThemeColor = ExtractColors<Theme['colors']>;
export type ThemeSpacing = keyof Theme['spacing'];
export type ThemeBorderRadius = keyof Theme['borderRadius'];
export type ThemeOpacity = keyof Theme['opacity'];

export type ToThemeStyle<StyleProps> = {
  [Prop in keyof StyleProps]: Prop extends typeof ColorProps[number]
    ? ThemeColor | [ThemeColor, ThemeOpacity]
    : Prop extends typeof SpacingProps[number]
    ? ThemeSpacing
    : Prop extends typeof BorderRadiusProps[number]
    ? ThemeBorderRadius
    : Prop extends typeof OpacityProps[number]
    ? ThemeOpacity
    : StyleProps[Prop];
};
