import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';

import { HomeScreen } from './src/screens/HomeScreen';
import { PhotoPreviewScreen } from './src/screens/PhotoPreviewScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { getOpenAIApiKey } from './src/storage/apiKeyStorage';
import type { RootStackParamList } from './src/types/navigation';

enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [booting, setBooting] = React.useState(true);
  const [hasKey, setHasKey] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    (async () => {
      const key = await getOpenAIApiKey();
      if (!active) return;
      setHasKey(Boolean(key));
      setBooting(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (booting) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color="#0A84FF" />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        key={hasKey ? 'has-key' : 'no-key'}
        initialRouteName={hasKey ? 'Home' : 'Settings'}
        screenOptions={{
          headerStyle: { backgroundColor: '#0B0B0F' },
          headerTintColor: '#FFFFFF',
          contentStyle: { backgroundColor: '#0B0B0F' },
        }}
      >
        {hasKey ? (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'OutfitAI' }}
            />
            <Stack.Screen
              name="PhotoPreview"
              component={PhotoPreviewScreen}
              options={{ title: 'Preview' }}
            />
            <Stack.Screen name="Settings" options={{ title: 'Settings' }}>
              {(props) => (
                <SettingsScreen
                  {...props}
                  hasApiKey={hasKey}
                  onKeySaved={() => setHasKey(true)}
                  onKeyCleared={() => setHasKey(false)}
                />
              )}
            </Stack.Screen>
          </>
        ) : (
          <Stack.Screen
            name="Settings"
            options={{ title: 'Settings', headerBackVisible: false }}
          >
            {(props) => (
              <SettingsScreen
                {...props}
                hasApiKey={hasKey}
                onKeySaved={() => setHasKey(true)}
                onKeyCleared={() => setHasKey(false)}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B0B0F',
  },
});
