import { AppRegistry } from 'react-native';
// Import the unified example instead of the manual platform check example
import UnifiedExample from './src/UnifiedExample';
import { name as appName } from './app.json';

// Use UnifiedExample to showcase the useAgeRange hook
// To see the manual platform-specific approach, change to: import App from './src/App';
AppRegistry.registerComponent(appName, () => UnifiedExample);
