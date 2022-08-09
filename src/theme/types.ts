import theme from './theme';

export type Theme = typeof theme;

type ExtractColors<Colors> = keyof {
  [Name in keyof Colors as Colors[Name] extends string | number
    ? `${(string | number) & Name}`
    : `${(string | number) & Name}.${string & ExtractColors<Colors[Name]>}`]: 1;
};

export type ThemeColor = ExtractColors<Theme['colors']>;
export type ThemeSpacing = keyof Theme['spacing'];
export type ThemeBorderRadius = keyof Theme['borderRadius'];

const ViewColorProps = [
  'backgroundColor',
  'borderBottomColor',
  'borderColor',
  'borderEndColor',
  'borderLeftColor',
  'borderRightColor',
  'borderStartColor',
  'borderTopColor',
] as const;

const TextColorProps = [
  'color',
  'textDecorationColor',
  'textShadowColor',
] as const;

export const ColorProps = [...ViewColorProps, ...TextColorProps] as const;

const ViewSpacingProps = [
  'bottom',
  'left',
  'margin',
  'marginBottom',
  'marginEnd',
  'marginHorizontal',
  'marginLeft',
  'marginRight',
  'marginStart',
  'marginTop',
  'marginVertical',
  'padding',
  'paddingBottom',
  'paddingEnd',
  'paddingHorizontal',
  'paddingLeft',
  'paddingRight',
  'paddingStart',
  'paddingTop',
  'paddingVertical',
  'right',
  'top',
] as const;

export const SpacingProps = [...ViewSpacingProps] as const;

const ViewBorderRadiusProps = [
  'borderBottomEndRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderBottomStartRadius',
  'borderRadius',
  'borderTopEndRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderTopStartRadius',
] as const;

export const BorderRadiusProps = [...ViewBorderRadiusProps] as const;

export type ToThemeStyle<StyleProps> = {
  [Prop in keyof StyleProps]: Prop extends typeof ColorProps[number]
    ? ThemeColor
    : Prop extends typeof SpacingProps[number]
    ? ThemeSpacing
    : Prop extends typeof BorderRadiusProps[number]
    ? ThemeBorderRadius
    : StyleProps[Prop];
};
