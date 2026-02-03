/**
 * WheelColumn - Single scrollable column for wheel picker
 *
 * Uses FlatList with snap behavior for native iOS/Android feel.
 * Uses ScrollView with snap behavior for web.
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
} from 'react-native';
import { WheelColumnProps, WheelColumnItem, ITEM_HEIGHT, VISIBLE_ITEMS } from './types';

interface ItemRendererProps {
  item: WheelColumnItem;
  index: number;
  selectedIndex: number;
  itemHeight: number;
}

// Item that fades based on distance from center
function WheelItem({ item, index, selectedIndex, itemHeight }: ItemRendererProps) {
  const distance = Math.abs(index - selectedIndex);
  const isSelected = index === selectedIndex;

  // Calculate opacity and scale based on distance from selected item
  const opacity = Math.max(0.2, 1 - distance * 0.35);
  const scale = Math.max(0.85, 1 - distance * 0.05);

  return (
    <View style={[styles.item, { height: itemHeight }]}>
      <View style={{ transform: [{ scale }], opacity }}>
        <Text
          style={[styles.itemText, isSelected && styles.selectedItemText]}
          numberOfLines={1}
        >
          {item.label}
        </Text>
      </View>
    </View>
  );
}

// Web-specific wheel column using ScrollView
function WebWheelColumn({
  items,
  selectedIndex,
  onSelect,
  itemHeight = ITEM_HEIGHT,
  visibleItems = VISIBLE_ITEMS,
  testID,
}: WheelColumnProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [internalIndex, setInternalIndex] = useState(selectedIndex);
  const isUserScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const paddingVertical = (itemHeight * (visibleItems - 1)) / 2;

  // Sync with external selectedIndex
  useEffect(() => {
    if (selectedIndex !== internalIndex && !isUserScrolling.current) {
      setInternalIndex(selectedIndex);
      scrollViewRef.current?.scrollTo({
        y: selectedIndex * itemHeight,
        animated: true,
      });
    }
  }, [selectedIndex, itemHeight, internalIndex]);

  // Initial scroll position
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: selectedIndex * itemHeight,
        animated: false,
      });
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      isUserScrolling.current = true;

      // Clear previous timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / itemHeight);
      const clampedIndex = Math.max(0, Math.min(index, items.length - 1));

      if (clampedIndex !== internalIndex) {
        setInternalIndex(clampedIndex);
      }

      // Debounced selection notification
      scrollTimeout.current = setTimeout(() => {
        isUserScrolling.current = false;
        if (clampedIndex !== selectedIndex) {
          onSelect(clampedIndex);
        }
        // Snap to nearest item
        scrollViewRef.current?.scrollTo({
          y: clampedIndex * itemHeight,
          animated: true,
        });
      }, 150);
    },
    [itemHeight, items.length, selectedIndex, onSelect, internalIndex]
  );

  return (
    <View style={[styles.container, { height: itemHeight * visibleItems }]} testID={testID}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={itemHeight}
        contentContainerStyle={{ paddingVertical }}
      >
        {items.map((item, index) => (
          <WheelItem
            key={`${item.value}`}
            item={item}
            index={index}
            selectedIndex={internalIndex}
            itemHeight={itemHeight}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// Native wheel column using FlatList
function NativeWheelColumn({
  items,
  selectedIndex,
  onSelect,
  itemHeight = ITEM_HEIGHT,
  visibleItems = VISIBLE_ITEMS,
  testID,
}: WheelColumnProps) {
  const flatListRef = useRef<FlatList>(null);
  const isScrolling = useRef(false);
  const lastSelectedIndex = useRef(selectedIndex);

  const paddingItems = Math.floor(visibleItems / 2);
  const paddedData: (WheelColumnItem | null)[] = [
    ...Array(paddingItems).fill(null),
    ...items,
    ...Array(paddingItems).fill(null),
  ];

  // Scroll to selected item when selectedIndex changes externally
  useEffect(() => {
    if (selectedIndex !== lastSelectedIndex.current && !isScrolling.current) {
      lastSelectedIndex.current = selectedIndex;
      flatListRef.current?.scrollToOffset({
        offset: selectedIndex * itemHeight,
        animated: true,
      });
    }
  }, [selectedIndex, itemHeight]);

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      isScrolling.current = false;
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / itemHeight);
      const clampedIndex = Math.max(0, Math.min(index, items.length - 1));

      if (clampedIndex !== selectedIndex) {
        lastSelectedIndex.current = clampedIndex;
        onSelect(clampedIndex);
      }
    },
    [itemHeight, items.length, selectedIndex, onSelect]
  );

  const handleScrollBegin = useCallback(() => {
    isScrolling.current = true;
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: WheelColumnItem | null; index: number }) => {
      if (item === null) {
        return <View style={{ height: itemHeight }} />;
      }

      const dataIndex = index - paddingItems;

      return (
        <WheelItem
          item={item}
          index={dataIndex}
          selectedIndex={selectedIndex}
          itemHeight={itemHeight}
        />
      );
    },
    [selectedIndex, itemHeight, paddingItems]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    }),
    [itemHeight]
  );

  const keyExtractor = useCallback(
    (item: WheelColumnItem | null, index: number) => {
      return item ? `item-${item.value}` : `padding-${index}`;
    },
    []
  );

  return (
    <View style={[styles.container, { height: itemHeight * visibleItems }]} testID={testID}>
      <FlatList
        ref={flatListRef}
        data={paddedData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        bounces={false}
        onScrollBeginDrag={handleScrollBegin}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={(e) => {
          if (Math.abs(e.nativeEvent.velocity?.y || 0) < 0.5) {
            handleScrollEnd(e);
          }
        }}
        initialScrollIndex={selectedIndex}
        nestedScrollEnabled
      />
    </View>
  );
}

export function WheelColumn(props: WheelColumnProps) {
  if (Platform.OS === 'web') {
    return <WebWheelColumn {...props} />;
  }
  return <NativeWheelColumn {...props} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
  },
  selectedItemText: {
    color: '#111827',
    fontWeight: '600',
  },
});
