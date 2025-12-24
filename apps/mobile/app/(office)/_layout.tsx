import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { DashboardIcon, UsersIcon, FileTextIcon, UserIcon } from '@/components/icons';

type TabName = 'dashboard' | 'maids' | 'quotations' | 'profile';

function TabIcon({ name, focused }: { name: TabName; focused: boolean }) {
  const { t } = useTranslation();
  const color = focused ? '#FF385C' : '#717171';
  const size = 24;

  const accessibilityLabels: Record<TabName, string> = {
    dashboard: t('office.dashboard'),
    maids: t('office.maids'),
    quotations: t('office.quotations'),
    profile: t('profile.title'),
  };

  const icons: Record<TabName, React.ReactNode> = {
    dashboard: <DashboardIcon size={size} color={color} filled={focused} />,
    maids: <UsersIcon size={size} color={color} />,
    quotations: <FileTextIcon size={size} color={color} />,
    profile: <UserIcon size={size} color={color} filled={focused} />,
  };

  return (
    <View
      className="items-center justify-center"
      style={{ width: 28, height: 28 }}
      accessible
      accessibilityLabel={accessibilityLabels[name]}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
    >
      {icons[name]}
    </View>
  );
}

export default function OfficeLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        freezeOnBlur: true,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          paddingTop: 12,
          paddingBottom: 24,
          height: 60,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarActiveTintColor: '#FF385C',
        tabBarInactiveTintColor: '#717171',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('office.dashboard'),
          tabBarIcon: ({ focused }) => <TabIcon name="dashboard" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="maids"
        options={{
          title: t('office.maids'),
          tabBarIcon: ({ focused }) => <TabIcon name="maids" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="quotations"
        options={{
          title: t('office.quotations'),
          tabBarIcon: ({ focused }) => <TabIcon name="quotations" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile.title'),
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
      {/* Hidden screens - not shown in tab bar */}
      <Tabs.Screen name="maid-form" options={{ href: null }} />
      <Tabs.Screen name="subscription" options={{ href: null }} />
    </Tabs>
  );
}
