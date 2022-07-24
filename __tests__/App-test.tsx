/**
 * @format
 */

import 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {act, render} from '@testing-library/react-native';
import React from 'react';

import App from '../App';

it('renders correctly', async () => {
  let capturedResolve: ((key: string | null) => void) | undefined;

  const getItemSpy = jest
    .spyOn(AsyncStorage, 'getItem')
    .mockImplementation(() => {
      return new Promise(resolve => {
        capturedResolve = resolve;
      });
    });

  const {getByText, queryByText} = render(<App />);

  expect(getByText('Loading')).toBeTruthy();

  await act(async () => {
    capturedResolve?.(null);
  });

  expect(queryByText('Loading')).toBeNull();
  expect(getItemSpy).toHaveBeenCalledTimes(1);
});
