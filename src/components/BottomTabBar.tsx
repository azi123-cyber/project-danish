import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type AppTab = 'timeline' | 'cabinet' | 'history';

interface BottomTabBarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  pendingDosesCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentTab,
  onSelectTab,
  pendingDosesCount = 0,
}) => {
  return (
    <View style={styles.tabBar}>
      {/* Tab 1: Jadwal */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onSelectTab('timeline')}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name={currentTab === 'timeline' ? 'alarm' : 'alarm-outline'}
            size={22}
            color={currentTab === 'timeline' ? '#0D9488' : '#94A3B8'}
          />
          {pendingDosesCount > 0 && currentTab !== 'timeline' && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingDosesCount}</Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.tabLabel,
            currentTab === 'timeline' && styles.tabLabelActive,
          ]}
        >
          Jadwal
        </Text>
      </TouchableOpacity>

      {/* Tab 2: Kotak Obat */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onSelectTab('cabinet')}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name={currentTab === 'cabinet' ? 'medkit' : 'medkit-outline'}
            size={22}
            color={currentTab === 'cabinet' ? '#0D9488' : '#94A3B8'}
          />
        </View>
        <Text
          style={[
            styles.tabLabel,
            currentTab === 'cabinet' && styles.tabLabelActive,
          ]}
        >
          Kotak Obat
        </Text>
      </TouchableOpacity>

      {/* Tab 3: Riwayat */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onSelectTab('history')}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name={currentTab === 'history' ? 'stats-chart' : 'stats-chart-outline'}
            size={22}
            color={currentTab === 'history' ? '#0D9488' : '#94A3B8'}
          />
        </View>
        <Text
          style={[
            styles.tabLabel,
            currentTab === 'history' && styles.tabLabelActive,
          ]}
        >
          Riwayat
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabLabelActive: {
    color: '#0D9488',
    fontWeight: '800',
  },
});
