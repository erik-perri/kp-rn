/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import findEntriesTask from './src/tasks/findEntriesTask';

AppRegistry.registerHeadlessTask('FindEntries', () => findEntriesTask);
AppRegistry.registerComponent(appName, () => App);
