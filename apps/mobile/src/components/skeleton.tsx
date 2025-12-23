import { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle, DimensionValue } from 'react-native';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as DimensionValue,
          height: height as DimensionValue,
          borderRadius,
          backgroundColor: '#e5e7eb',
          opacity,
        } as Animated.WithAnimatedObject<ViewStyle>,
        style,
      ]}
    />
  );
}

export function MaidCardSkeleton() {
  return (
    <View className="bg-background-0 rounded-xl border border-background-200 p-4 mb-3">
      <View className="flex-row">
        {/* Photo skeleton */}
        <Skeleton width={80} height={100} borderRadius={12} />

        <View className="flex-1 ml-4">
          {/* Name */}
          <Skeleton width="70%" height={20} style={{ marginBottom: 8 }} />

          {/* Nationality */}
          <Skeleton width="50%" height={14} style={{ marginBottom: 12 }} />

          {/* Details row */}
          <View className="flex-row gap-4">
            <Skeleton width={60} height={14} />
            <Skeleton width={60} height={14} />
          </View>

          {/* Salary */}
          <Skeleton width="40%" height={18} style={{ marginTop: 12 }} />
        </View>
      </View>
    </View>
  );
}

export function MaidListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View className="px-6">
      {Array.from({ length: count }).map((_, index) => (
        <MaidCardSkeleton key={index} />
      ))}
    </View>
  );
}

export function QuotationCardSkeleton() {
  return (
    <View className="bg-background-0 rounded-xl border border-background-200 p-4 mb-3">
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Skeleton width={150} height={18} style={{ marginBottom: 6 }} />
          <Skeleton width={100} height={14} />
        </View>
        <Skeleton width={80} height={28} borderRadius={14} />
      </View>

      <View className="flex-row gap-4">
        <Skeleton width={80} height={14} />
        <Skeleton width={80} height={14} />
      </View>
    </View>
  );
}

export function QuotationListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View className="px-6">
      {Array.from({ length: count }).map((_, index) => (
        <QuotationCardSkeleton key={index} />
      ))}
    </View>
  );
}

export function ProfileSkeleton() {
  return (
    <View className="px-6">
      {/* Header card */}
      <View className="mb-6 p-6 bg-primary-500 rounded-2xl">
        <View className="flex-row items-center">
          <Skeleton width={64} height={64} borderRadius={32} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <View className="flex-1 ml-4">
            <Skeleton width={120} height={18} style={{ marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.3)' }} />
            <Skeleton width={100} height={14} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
          </View>
        </View>
      </View>

      {/* Menu items */}
      {Array.from({ length: 4 }).map((_, index) => (
        <View key={index} className="flex-row items-center p-4 bg-background-50 rounded-xl mb-3">
          <Skeleton width={32} height={32} borderRadius={8} />
          <Skeleton width="60%" height={16} style={{ marginLeft: 16 }} />
        </View>
      ))}
    </View>
  );
}

export function DashboardSkeleton() {
  return (
    <View className="px-6">
      {/* Stats cards */}
      <View className="flex-row gap-3 mb-6">
        <View className="flex-1 bg-primary-50 rounded-xl p-4">
          <Skeleton width={40} height={40} borderRadius={8} style={{ marginBottom: 8 }} />
          <Skeleton width={60} height={24} style={{ marginBottom: 4 }} />
          <Skeleton width={80} height={14} />
        </View>
        <View className="flex-1 bg-success-500/10 rounded-xl p-4">
          <Skeleton width={40} height={40} borderRadius={8} style={{ marginBottom: 8 }} />
          <Skeleton width={60} height={24} style={{ marginBottom: 4 }} />
          <Skeleton width={80} height={14} />
        </View>
      </View>

      {/* Section title */}
      <Skeleton width={150} height={20} style={{ marginBottom: 16 }} />

      {/* Cards */}
      <MaidCardSkeleton />
      <MaidCardSkeleton />
    </View>
  );
}

export function MaidDetailSkeleton() {
  return (
    <View>
      {/* Photo */}
      <Skeleton width="100%" height={400} borderRadius={0} />

      <View className="px-6 pt-6">
        {/* Name and status */}
        <View className="flex-row justify-between items-start mb-4">
          <View>
            <Skeleton width={200} height={28} style={{ marginBottom: 8 }} />
            <Skeleton width={120} height={16} />
          </View>
          <Skeleton width={80} height={28} borderRadius={14} />
        </View>

        {/* Quick info */}
        <View className="flex-row gap-4 mb-6">
          <Skeleton width={80} height={60} borderRadius={12} />
          <Skeleton width={80} height={60} borderRadius={12} />
          <Skeleton width={80} height={60} borderRadius={12} />
        </View>

        {/* Bio section */}
        <Skeleton width={100} height={20} style={{ marginBottom: 12 }} />
        <Skeleton width="100%" height={14} style={{ marginBottom: 6 }} />
        <Skeleton width="90%" height={14} style={{ marginBottom: 6 }} />
        <Skeleton width="70%" height={14} />
      </View>
    </View>
  );
}
