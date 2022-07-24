import React, {FunctionComponent, PropsWithChildren, useMemo} from 'react';
import {ScrollView, ScrollViewProps, StyleSheet} from 'react-native';

interface ScrollViewFill extends ScrollViewProps, PropsWithChildren {
  //
}

const ScrollViewFill: FunctionComponent<ScrollViewFill> = ({
  children,
  contentContainerStyle,
  ...props
}) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flexGrow: 1,
        },
      }),
    [],
  );

  return (
    <ScrollView
      contentContainerStyle={[styles.root, contentContainerStyle]}
      {...props}>
      {children}
    </ScrollView>
  );
};

export default ScrollViewFill;
