/**
 * WheelColumn - Single scrollable column for wheel picker
 *
 * Uses FlatList with snap behavior for native iOS/Android feel.
 * Uses raw <div> with CSS scroll-snap for reliable web behavior.
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
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

// Web-specific wheel column using raw <div> with CSS scroll-snap
function WebWheelColumn({
  items,
  selectedIndex,
  onSelect,
  itemHeight = ITEM_HEIGHT,
  visibleItems = VISIBLE_ITEMS,
  testID,
}: WheelColumnProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [internalIndex, setInternalIndex] = useState(selectedIndex);
  const isUserScrolling = useRef(false);
  const containerId = useRef(`wheel-${Math.random().toString(36).slice(2, 8)}`);

  const containerHeight = itemHeight * visibleItems;
  const paddingVertical = (itemHeight * (visibleItems - 1)) / 2;

  // Scroll to a given index
  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      scrollRef.current?.scrollTo({ top: index * itemHeight, behavior });
    },
    [itemHeight]
  );

  // Resolve index from current scroll position
  const resolveIndex = useCallback(() => {
    if (!scrollRef.current) return selectedIndex;
    const y = scrollRef.current.scrollTop;
    return Math.max(0, Math.min(Math.round(y / itemHeight), items.length - 1));
  }, [itemHeight, items.length, selectedIndex]);

  // Commit the snapped index
  const commitIndex = useCallback(() => {
    const idx = resolveIndex();
    isUserScrolling.current = false;
    setInternalIndex(idx);
    if (idx !== selectedIndex) onSelect(idx);
  }, [resolveIndex, selectedIndex, onSelect]);

  // Scroll-end detection: native scrollend + debounce fallback
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let fallback: ReturnType<typeof setTimeout> | null = null;
    let hasNativeScrollEnd = false;

    const onScrollEnd = () => {
      if (fallback) clearTimeout(fallback);
      hasNativeScrollEnd = true;
      commitIndex();
    };

    const onScroll = () => {
      isUserScrolling.current = true;
      const idx = resolveIndex();
      if (idx !== internalIndex) setInternalIndex(idx);

      // Debounce fallback for browsers without scrollend (Safari 15-17)
      if (!hasNativeScrollEnd) {
        if (fallback) clearTimeout(fallback);
        fallback = setTimeout(commitIndex, 120);
      }
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('scrollend', onScrollEnd);

    return () => {
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('scrollend', onScrollEnd);
      if (fallback) clearTimeout(fallback);
    };
  }, [resolveIndex, commitIndex, internalIndex]);

  // Sync with external selectedIndex changes
  useEffect(() => {
    if (selectedIndex !== internalIndex && !isUserScrolling.current) {
      setInternalIndex(selectedIndex);
      scrollToIndex(selectedIndex);
    }
  }, [selectedIndex, internalIndex, scrollToIndex]);

  // Initial scroll position
  useEffect(() => {
    requestAnimationFrame(() => scrollToIndex(selectedIndex, 'instant'));
  }, []);

  // Tap-to-select
  const handleItemClick = useCallback(
    (index: number) => {
      scrollToIndex(index);
      // Eagerly update in case scrollend doesn't fire (e.g. already at position)
      setInternalIndex(index);
      if (index !== selectedIndex) onSelect(index);
    },
    [scrollToIndex, selectedIndex, onSelect]
  );

  return (
    <View style={[styles.container, { height: containerHeight }]} testID={testID}>
      {/* Hide scrollbar for WebKit browsers */}
      <style
        dangerouslySetInnerHTML={{
          __html: `#${containerId.current}::-webkit-scrollbar { display: none; }`,
        }}
      />
      <div
        id={containerId.current}
        ref={scrollRef}
        style={{
          height: containerHeight,
          overflowY: 'auto',
          scrollSnapType: 'y mandatory',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          position: 'relative',
        }}
      >
        {/* Top padding spacer */}
        <div style={{ height: paddingVertical, flexShrink: 0 }} />

        {items.map((item, index) => (
          <div
            key={`${item.value}`}
            onClick={() => handleItemClick(index)}
            style={{
              height: itemHeight,
              scrollSnapAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <WheelItem
              item={item}
              index={index}
              selectedIndex={internalIndex}
              itemHeight={itemHeight}
            />
          </div>
        ))}

        {/* Bottom padding spacer */}
        <div style={{ height: paddingVertical, flexShrink: 0 }} />
      </div>
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
