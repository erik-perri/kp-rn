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

const ViewOpacityProps = ['opacity'] as const;

export const OpacityProps = [...ViewOpacityProps] as const;
