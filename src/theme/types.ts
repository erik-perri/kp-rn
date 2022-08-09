import theme from './theme';

export type Theme = typeof theme;

type ExtractColors<ColorObject> = keyof {
  [Name in keyof ColorObject as ColorObject[Name] extends string | number
    ? `${(string | number) & Name}`
    : `${string & Name}.${string & ExtractColors<ColorObject[Name]>}`]: string;
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
