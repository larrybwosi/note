import React, { useCallback, memo } from 'react'
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native'
import {ItemCard} from 'src/components/schedule.item'
import { PostponementRecord, ScheduleItem } from './schedule'


type Priority = 'Low' | 'Medium' | 'High'
type ScheduleType = 'task' | 'event'
interface ScheduleListProps {
  items: ScheduleItem[]
  onCompleteItem: (id: number) => void
  onPostpone: (id: number) => void
  theme: 'light' | 'dark'
  ListEmptyComponent?: React.ReactElement
  ListHeaderComponent?: React.ReactElement
  ListFooterComponent?: React.ReactElement
  contentContainerStyle?: any
  refreshing?: boolean
  onRefresh?: () => void
}

const customStyles = {
  cardBg: 'bg-white dark:bg-gray-800',
  textColor: 'text-gray-900 dark:text-white',
  accentColor: 'blue',
  fontFamily: {
    regular: 'roboto-bold',
    medium: 'roboto-bold',
    bold: 'roboto-bold'
  }
} as const

export const ScheduleList = memo<ScheduleListProps>(({
  items,
  onCompleteItem,
  onPostpone,
  theme,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  contentContainerStyle,
  refreshing,
  onRefresh
}) => {
  const keyExtractor = useCallback((item: ScheduleItem) => item.id.toString(), [])

  const renderItem = useCallback(({ item }: ListRenderItemInfo<ScheduleItem>) => (
    <ItemCard
      key={item.id}
      item={item}
      onComplete={onCompleteItem}
      onPostpone={onPostpone}
      handlePostpone={onPostpone}
      theme={theme}
      customStyles={customStyles}
    />
  ), [onCompleteItem, onPostpone, theme])

  const getItemLayout = useCallback((data: ArrayLike<ScheduleItem> | null | undefined, index: number) => ({
    length: 180, // Approximate height of each item
    offset: 180 * index,
    index,
  }), [])

  // Optional: Add separator component if needed
  const ItemSeparator = useCallback(() => (
    <View style={styles.separator} />
  ), [])

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      // ItemSeparatorComponent={ItemSeparator} // Uncomment if you want separators
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      refreshing={refreshing}
      onRefresh={onRefresh}
      removeClippedSubviews={true} // Improve memory usage
      maxToRenderPerBatch={10} // Limit items rendered per batch
      windowSize={5} // Reduce number of items rendered outside screen
      initialNumToRender={8} // Reduce initial render amount
    />
  )
})

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  separator: {
    height: 8,
  }
})

ScheduleList.displayName = 'ScheduleList'

export default ScheduleList