import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { HomeIcon, WalletIcon, HeartIcon, UserIcon } from '@/components/icons';

type TabName = 'home' | 'wallet' | 'favorites' | 'profile';

function TabIcon({ name, focused }: { name: TabName; focused: boolean }) {
  const color = focused ? '#FF385C' : '#717171';
  const size = 24;

  const icons: Record<TabName, React.ReactNode> = {
    home: <HomeIcon size={size} color={color} filled={focused} />,
    wallet: <WalletIcon size={size} color={color} />,
    favorites: <HeartIcon size={size} color={color} filled={focused} />,
    profile: <UserIcon size={size} color={color} filled={focused} />,
  };

  return (
    <View className="items-center justify-center" style={{ width: 28, height: 28 }}>
      {icons[name]}
    </View>
  );
}

export default function CustomerLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: 28,
          height: 88,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarActiveTintColor: '#FF385C',
        tabBarInactiveTintColor: '#717171',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home.title'),
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: t('wallet.title'),
          tabBarIcon: ({ focused }) => <TabIcon name="wallet" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: null, // Hide from tab bar, accessible from home search bar
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: t('profile.favorites'),
          tabBarIcon: ({ focused }) => <TabIcon name="favorites" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile.title'),
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="quotations"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
