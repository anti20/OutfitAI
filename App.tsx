import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, StatusBar, StyleSheet, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {enableScreens} from 'react-native-screens';
import HomeScreen from './src/screens/HomeScreen';
import PhotoPreviewScreen from './src/screens/PhotoPreviewScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import {getOpenAIKey} from './src/storage/openAIKeyStorage';
import {RootStackParamList} from './src/types/navigation';

enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      const savedKey = await getOpenAIKey();
      setHasApiKey(Boolean(savedKey));
    };

    bootstrap();
  }, []);

  const handleSavedKey = useCallback(() => {
    setHasApiKey(true);
  }, []);

  const handleClearedKey = useCallback(() => {
    setHasApiKey(false);
  }, []);

  const stackKey = useMemo(
    () => (hasApiKey ? 'root-home' : 'root-settings'),
    [hasApiKey],
  );
  const navigationKey = useMemo(
    () => (hasApiKey ? 'nav-has-key' : 'nav-no-key'),
    [hasApiKey],
  );

  if (hasApiKey === null) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0B1020" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#7C3AED" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0B1020" />
      <NavigationContainer key={navigationKey}>
        <Stack.Navigator key={stackKey} screenOptions={{headerShown: false}}>
          {hasApiKey ? (
            <>
              <Stack.Screen name="Home">
                {props => <HomeScreen {...props} />}
              </Stack.Screen>
              <Stack.Screen name="Settings">
                {props => (
                  <SettingsScreen
                    {...props}
                    isRequiredSetup={false}
                    onKeySaved={handleSavedKey}
                    onKeyCleared={handleClearedKey}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="PhotoPreview">
                {props => <PhotoPreviewScreen {...props} />}
              </Stack.Screen>
            </>
          ) : (
            <Stack.Screen name="Settings">
              {props => (
                <SettingsScreen
                  {...props}
                  isRequiredSetup
                  onKeySaved={handleSavedKey}
                  onKeyCleared={handleClearedKey}
                />
              )}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0B1020',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
