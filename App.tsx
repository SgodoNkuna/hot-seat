import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WEB_BASE } from './src/config';
import { useFonts, AlfaSlabOne_400Regular } from '@expo-google-fonts/alfa-slab-one';
import { Fraunces_400Regular, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { GameProvider } from './src/state/GameContext';
import { OnlineProvider } from './src/online/OnlineContext';
import { RootStackParamList } from './src/navigation/types';
import { colors, fonts } from './src/theme';
import HomeScreen from './src/screens/HomeScreen';
import SetupScreen from './src/screens/SetupScreen';
import PlayScreen from './src/screens/PlayScreen';
import WinScreen from './src/screens/WinScreen';
import DeckEditorScreen from './src/screens/DeckEditorScreen';
import HowToPlayScreen from './src/screens/HowToPlayScreen';
import OnlineHomeScreen from './src/screens/OnlineHomeScreen';
import OnlineLobbyScreen from './src/screens/OnlineLobbyScreen';
import OnlinePlayScreen from './src/screens/OnlinePlayScreen';
import OnlineWinScreen from './src/screens/OnlineWinScreen';

// per-screen URLs so the browser back button walks the app's own history
const linking = {
  prefixes: [],
  config: {
    screens: {
      Home: WEB_BASE.slice(0, -1),
      Setup: WEB_BASE + 'setup',
      Play: WEB_BASE + 'play',
      Win: WEB_BASE + 'win',
      DeckEditor: WEB_BASE + 'categories',
      HowToPlay: WEB_BASE + 'how-to-play',
      OnlineHome: WEB_BASE + 'online',
      OnlineLobby: WEB_BASE + 'lobby',
      OnlinePlay: WEB_BASE + 'online-play',
      OnlineWin: WEB_BASE + 'online-win',
    },
  },
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    AlfaSlabOne_400Regular,
    Fraunces_400Regular,
    Fraunces_600SemiBold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.ink }} />;
  }

  return (
    <SafeAreaProvider>
      <GameProvider>
        <OnlineProvider>
          <NavigationContainer linking={linking}>
            <StatusBar style="light" />
            <Stack.Navigator
              screenOptions={{
                headerStyle: { backgroundColor: colors.ink },
                headerTintColor: colors.cream,
                headerTitleStyle: { fontFamily: fonts.display, fontSize: 15 },
                headerShadowVisible: false,
                contentStyle: { backgroundColor: colors.cream },
              }}
            >
              <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Setup" component={SetupScreen} options={{ title: 'GAME SETUP' }} />
              <Stack.Screen
                name="Play"
                component={PlayScreen}
                options={{ title: '', headerBackVisible: false, headerLeft: () => null, gestureEnabled: false }}
              />
              <Stack.Screen
                name="Win"
                component={WinScreen}
                options={{ headerShown: false, gestureEnabled: false }}
              />
              <Stack.Screen
                name="HowToPlay"
                component={HowToPlayScreen}
                options={{ title: 'HOW TO PLAY' }}
              />
              <Stack.Screen
                name="DeckEditor"
                component={DeckEditorScreen}
                options={{ title: 'CATEGORY BOARD' }}
              />
              <Stack.Screen
                name="OnlineHome"
                component={OnlineHomeScreen}
                options={{ title: 'PLAY ONLINE' }}
              />
              <Stack.Screen
                name="OnlineLobby"
                component={OnlineLobbyScreen}
                options={{ title: 'ROOM LOBBY', headerBackVisible: false, gestureEnabled: false }}
              />
              <Stack.Screen
                name="OnlinePlay"
                component={OnlinePlayScreen}
                options={{ title: '', headerBackVisible: false, headerLeft: () => null, gestureEnabled: false }}
              />
              <Stack.Screen
                name="OnlineWin"
                component={OnlineWinScreen}
                options={{ headerShown: false, gestureEnabled: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </OnlineProvider>
      </GameProvider>
    </SafeAreaProvider>
  );
}
