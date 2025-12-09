import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Event } from '../../types'
import { 
  AtCard, 
  AtButton, 
  AtList, 
  AtListItem,
  AtIcon,
  AtSearchBar,
  AtTabs,
  AtTabsPane,
  AtTag,
  AtLoadMore,
  AtFab
} from 'taro-ui'
import './list.scss'

const EventList = () => {
  const [events, setEvents] = useState([])
  const [currentTab, setCurrentTab] = useState(0)
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    // 模拟加载活动数据
    setEvents([
      { id: '1', title: '婚礼活动', status: 'planning', description: '筹备完美的婚礼仪式' },
      { id: '2', title: '生日派对', status: 'ongoing', description: '准备精彩的生日庆祝活动' },
      { id: '3', title: '公司年会', status: 'completed', description: '年度总结与展望活动' },
      { id: '4', title: '乔迁之喜', status: 'planning', description: '新家搬迁庆祝活动' }
    ])
  }

  const createEvent = () => {
    Taro.navigateTo({
      url: '/pages/event/create'
    })
  }

  const viewEvent = (eventId) => {
    Taro.navigateTo({
      url: `/pages/event/detail?id=${eventId}`
    })
  }

  // 过滤事件
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchValue.toLowerCase())
    const matchesTab = currentTab === 0 || 
      (currentTab === 1 && event.status === 'ongoing') ||
      (currentTab === 2 && event.status === 'planning') ||
      (currentTab === 3 && event.status === 'completed')
    return matchesSearch && matchesTab
  })

  const tabStats = {
    0: { count: events.length, icon: 'folder', color: '#666' },
    1: { count: events.filter(e => e.status === 'ongoing').length, icon: 'play-circle', color: '#ff6b6b' },
    2: { count: events.filter(e => e.status === 'planning').length, icon: 'clock', color: '#f39c12' },
    3: { count: events.filter(e => e.status === 'completed').length, icon: 'check-circle', color: '#27ae60' }
  }

  return (
    <View className='event-list'>
      {/* 顶部统计栏 */}
      <View className='stats-bar'>
        <View className='stat-cards'>
          {[0, 1, 2, 3].map((tabIndex) => (
            <View 
              key={tabIndex}
              className={`stat-card ${currentTab === tabIndex ? 'active' : ''}`}
              onClick={() => setCurrentTab(tabIndex)}
            >
              <AtIcon 
                value={tabStats[tabIndex].icon} 
                size='16' 
                color={currentTab === tabIndex ? tabStats[tabIndex].color : '#999'} 
              />
              <Text className='stat-number'>{tabStats[tabIndex].count}</Text>
              <Text className='stat-label'>{
                tabIndex === 0 ? '全部' : 
                tabIndex === 1 ? '进行中' : 
                tabIndex === 2 ? '计划中' : '已完成'
              }</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 搜索和操作区 */}
      <View className='action-section'>
        <AtSearchBar
          value={searchValue}
          onChange={(value) => setSearchValue(value)}
          onClear={() => setSearchValue('')}
          placeholder='搜索你的活动...'
          className='search-bar'
        />
        <AtButton 
          type='primary'
          size='small'
          onClick={createEvent}
          className='create-btn'
        >
          <AtIcon value='add' size='14' color='#fff' />
          <Text>创建活动</Text>
        </AtButton>
      </View>

      {/* 事件列表 */}
      <View className='events-container'>
        {filteredEvents.length === 0 ? (
          <View className='empty-state'>
            <View className='empty-icon'>
              <AtIcon value={searchValue ? 'search' : 'folder-open'} size='80' color='#ddd' />
            </View>
            <Text className='empty-title'>
              {searchValue ? '没有找到相关活动' : '还没有创建活动'}
            </Text>
            <Text className='empty-desc'>
              {searchValue ? '试试其他关键词或创建新活动' : '开始创建你的第一个活动吧'}
            </Text>
            <AtButton 
              type='primary' 
              size='normal'
              onClick={createEvent}
              className='empty-btn'
              circle
            >
              <AtIcon value='add' size='16' color='#fff' />
              <Text>立即创建</Text>
            </AtButton>
          </View>
        ) : (
          <View className='events-list'>
            {filteredEvents.map((event, index) => (
              <View 
                key={event.id} 
                className={`event-item ${index === 0 ? 'first' : ''}`}
                onClick={() => viewEvent(event.id)}
              >
                <View className='event-header'>
                  <View className='event-status'>
                    <AtIcon 
                      value={
                        event.status === 'ongoing' ? 'play-circle' : 
                        event.status === 'planning' ? 'clock' : 'check-circle'
                      } 
                      size='16' 
                      color={
                        event.status === 'ongoing' ? '#ff6b6b' : 
                        event.status === 'planning' ? '#f39c12' : '#27ae60'
                      } 
                    />
                  </View>
                  <View className='event-info'>
                    <Text className='event-title'>{event.title}</Text>
                    <Text className='event-desc'>{event.description || '暂无描述'}</Text>
                  </View>
                  <View className='event-actions'>
                    <AtTag 
                      type={event.status === 'ongoing' ? 'primary' : ''}
                      size='small'
                    >
                      {event.status === 'ongoing' ? '进行中' : event.status === 'planning' ? '计划中' : '已完成'}
                    </AtTag>
                    <AtIcon value='chevron-right' size='14' color='#ccc' />
                  </View>
                </View>
                <View className='event-meta'>
                  <View className='meta-item'>
                    <AtIcon value='calendar' size='12' color='#666' />
                    <Text>最近更新</Text>
                  </View>
                  <View className='meta-item'>
                    <AtIcon value='user' size='12' color='#666' />
                    <Text>创建者</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 悬浮按钮 */}
      <AtFab onClick={createEvent}>
        <AtIcon value='add' size='20' color='#fff' />
      </AtFab>
    </View>
  )
}

export default EventList