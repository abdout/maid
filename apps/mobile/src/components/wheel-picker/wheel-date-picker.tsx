/**
 * WheelDatePicker - Apple-style three-column date picker
 *
 * Features:
 * - Day, Month, Year columns with smooth scrolling
 * - RTL support (Year-Month-Day order for Arabic)
 * - Auto-adjusts days based on month/year (handles Feb 28/29)
 * - Selection highlight with gradient fade
 * - Works on iOS, Android, and Web
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { WheelColumn } from './wheel-column';
import {
  WheelDatePickerProps,
  WheelColumnItem,
  MONTH_NAMES_EN,
  MONTH_NAMES_AR,
  ITEM_HEIGHT,
  VISIBLE_ITEMS
} from './types';

// Get number of days in a month
function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Generate year range
function generateYears(minYear: number, maxYear: number): WheelColumnItem[] {
  const years: WheelColumnItem[] = [];
  for (let year = maxYear; year >= minYear; year--) {
    years.push({ value: year, label: String(year) });
  }
  return years;
}

// Generate months
function generateMonths(monthNames: string[]): WheelColumnItem[] {
  return monthNames.map((name, index) => ({
    value: index,
    label: name,
  }));
}

// Generate days
function generateDays(maxDay: number): WheelColumnItem[] {
  const days: WheelColumnItem[] = [];
  for (let day = 1; day <= maxDay; day++) {
    days.push({ value: day, label: String(day) });
  }
  return days;
}

export function WheelDatePicker({
  value,
  onChange,
  minimumDate,
  maximumDate,
  locale
}: WheelDatePickerProps) {
  const { i18n } = useTranslation();
  const isRTL = locale ? locale === 'ar' : i18n.language === 'ar';
  const monthNames = isRTL ? MONTH_NAMES_AR : MONTH_NAMES_EN;

  // Current selections
  const [selectedDay, setSelectedDay] = useState(value.getDate());
  const [selectedMonth, setSelectedMonth] = useState(value.getMonth());
  const [selectedYear, setSelectedYear] = useState(value.getFullYear());

  // Calculate year range from min/max dates
  const minYear = minimumDate?.getFullYear() ?? 1950;
  const maxYear = maximumDate?.getFullYear() ?? new Date().getFullYear();

  // Generate column data
  const years = useMemo(() => generateYears(minYear, maxYear), [minYear, maxYear]);
  const months = useMemo(() => generateMonths(monthNames), [monthNames]);

  // Days in current month (adjusts for leap years, etc.)
  const daysInMonth = useMemo(
    () => getDaysInMonth(selectedMonth, selectedYear),
    [selectedMonth, selectedYear]
  );
  const days = useMemo(() => generateDays(daysInMonth), [daysInMonth]);

  // Auto-adjust day if it exceeds days in month (e.g., March 31 -> Feb 28)
  useEffect(() => {
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [daysInMonth, selectedDay]);

  // Notify parent of date changes
  useEffect(() => {
    const newDate = new Date(selectedYear, selectedMonth, selectedDay);

    // Clamp to min/max dates
    if (minimumDate && newDate < minimumDate) {
      setSelectedYear(minimumDate.getFullYear());
      setSelectedMonth(minimumDate.getMonth());
      setSelectedDay(minimumDate.getDate());
      return;
    }
    if (maximumDate && newDate > maximumDate) {
      setSelectedYear(maximumDate.getFullYear());
      setSelectedMonth(maximumDate.getMonth());
      setSelectedDay(maximumDate.getDate());
      return;
    }

    // Only notify if date actually changed
    if (
      newDate.getDate() !== value.getDate() ||
      newDate.getMonth() !== value.getMonth() ||
      newDate.getFullYear() !== value.getFullYear()
    ) {
      onChange(newDate);
    }
  }, [selectedDay, selectedMonth, selectedYear, minimumDate, maximumDate, onChange, value]);

  // Find indices for current selections
  const yearIndex = years.findIndex(y => y.value === selectedYear);
  const monthIndex = selectedMonth;
  const dayIndex = selectedDay - 1;

  // Handle column selections
  const handleDaySelect = useCallback((index: number) => {
    setSelectedDay(index + 1);
  }, []);

  const handleMonthSelect = useCallback((index: number) => {
    setSelectedMonth(index);
  }, []);

  const handleYearSelect = useCallback((index: number) => {
    const year = years[index]?.value as number;
    if (year) {
      setSelectedYear(year);
    }
  }, [years]);

  // Columns in display order (RTL: Year-Month-Day, LTR: Day-Month-Year)
  const columns = isRTL
    ? [
        { key: 'year', items: years, index: yearIndex, onSelect: handleYearSelect },
        { key: 'month', items: months, index: monthIndex, onSelect: handleMonthSelect },
        { key: 'day', items: days, index: dayIndex, onSelect: handleDaySelect },
      ]
    : [
        { key: 'day', items: days, index: dayIndex, onSelect: handleDaySelect },
        { key: 'month', items: months, index: monthIndex, onSelect: handleMonthSelect },
        { key: 'year', items: years, index: yearIndex, onSelect: handleYearSelect },
      ];

  const pickerHeight = ITEM_HEIGHT * VISIBLE_ITEMS;
  const highlightTop = (VISIBLE_ITEMS - 1) / 2 * ITEM_HEIGHT;

  return (
    <View style={styles.container}>
      {/* Selection highlight */}
      <View
        style={[
          styles.selectionHighlight,
          {
            top: highlightTop,
            height: ITEM_HEIGHT,
          }
        ]}
        pointerEvents="none"
      />

      {/* Columns */}
      <View style={[styles.columnsContainer, { height: pickerHeight }]}>
        {columns.map((col, idx) => (
          <View
            key={col.key}
            style={[
              styles.columnWrapper,
              // Add separators between columns
              idx > 0 && (isRTL ? styles.columnBorderRight : styles.columnBorderLeft),
            ]}
          >
            <WheelColumn
              items={col.items}
              selectedIndex={col.index >= 0 ? col.index : 0}
              onSelect={col.onSelect}
              itemHeight={ITEM_HEIGHT}
              visibleItems={VISIBLE_ITEMS}
              testID={`wheel-column-${col.key}`}
            />
          </View>
        ))}
      </View>

      {/* Top gradient fade */}
      <LinearGradient
        colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
        style={[styles.gradientTop, { height: highlightTop }]}
        pointerEvents="none"
      />

      {/* Bottom gradient fade */}
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
        style={[styles.gradientBottom, { height: highlightTop }]}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  columnsContainer: {
    flexDirection: 'row',
  },
  columnWrapper: {
    flex: 1,
  },
  columnBorderLeft: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: '#E5E7EB',
  },
  columnBorderRight: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#E5E7EB',
  },
  selectionHighlight: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    zIndex: 0,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
});
