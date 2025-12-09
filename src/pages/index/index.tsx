import { useState, useEffect } from 'react'
import { View, Text, Swiper, SwiperItem } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { 
  AtCard, 
  AtButton, 
  AtSearchBar, 
  AtIcon, 
  AtFab, 
  AtTag,
  AtProgress,
  AtNoticebar,
  AtGrid
} from 'taro-ui'
import './index.scss'
import { Event } from '../../types'

const Index = () => {
  const [events, setEvents] = useState([])
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    loadEvents()
  }, [])

  useDidShow(() => {
    loadEvents()
  })

  const loadEvents = async () => {
    try {
      // 模拟数据，实际应该从存储加载
      const mockEvents = [
        {
          id: '1',
          title: '婚礼准备',
          icon: '💍',
          progress: 40,
          startDate: '2025-02-01',
          budget: 56000,
          status: 'ongoing'
        },
        {
          id: '2', 
          title: '新房装修',
          icon: '🏠',
          progress: 12,
          startDate: '2025-03-10',
          budget: 140000,
          status: 'planning'
        },
        {
          id: '3',
          title: '毕业旅行',
          icon: '✈️',
          progress: 65,
          startDate: '2025-06-01',
          budget: 25000,
          status: 'ongoing'
        }
      ]
      setEvents(mockEvents)
    } catch (error) {
      console.error('加载事件失败:', error)
    }
  }

  const handleSearch = (value: string) => {
    setSearchKeyword(value)
  }

  const navigateToCreate = () => {
    Taro.navigateTo({
      url: '/pages/event/create'
    })
  }

  const navigateToDetail = (eventId) => {
    Taro.navigateTo({
      url: `/pages/event/detail?id=${eventId}`
    })
  }

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('zh-CN').format(amount)
  }

  const getEventColor = (status) => {
    const colors = {
      'ongoing': '#ff6b6b',
      'planning': '#f39c12', 
      'completed': '#27ae60'
    }
    return colors[status] || '#666'
  }

  // 过滤事件
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchKeyword.toLowerCase())
  )

  // Banner轮播数据
  const bannerList = [
    {
      title: '婚礼策划',
      subtitle: '打造完美婚礼',
      image: '💒',
      color: '#ff6b6b'
    },
    {
      title: '预算管理', 
      subtitle: '合理规划开支',
      image: '💰',
      color: '#4ecdc4'
    },
    {
      title: '任务追踪',
      subtitle: '不错过每个细节',
      image: '📋',
      color: '#45b7d1'
    }
  ]

  return (
    <View className='index'>
      {/* 顶部通知栏 */}
      <AtNoticebar 
        icon='volume-plus' 
        speed={100}
        marquee>
        欢迎使用婚礼策划助手！让每一个重要时刻都完美呈现 ✨
      </AtNoticebar>

      {/* Banner轮播 */}
      <View className='banner-section'>
        <Swiper
          className='banner-swiper'
          indicatorColor='rgba(255,255,255,0.6)'
          indicatorDots
          autoplay
          interval={3000}
          circular
        >
          {bannerList.map((banner, index) => (
            <SwiperItem key={index}>
              <View 
                className='banner-item' 
                style={{ background: `linear-gradient(135deg, ${banner.color}dd, ${banner.color})` }}
              >
                <Text className='banner-icon'>{banner.image}</Text>
                <View className='banner-text'>
                  <Text className='banner-title'>{banner.title}</Text>
                  <Text className='banner-subtitle'>{banner.subtitle}</Text>
                </View>
              </View>
            </SwiperItem>
          ))}
        </Swiper>
      </View>

      {/* 搜索框 */}
      <View className='search-section'>
          <AtSearchBar
          value={searchKeyword}
          onChange={handleSearch}
          onActionClick={() => handleSearch(searchKeyword)}
          placeholder='搜索你的事件...'
          className='search-bar'
        />
      </View>

      {/* 快捷功能网格 */}
      <View className='quick-actions'>
        <AtGrid 
          columnNum={4} 
          hasBorder={false}
          mode='rect'
          data={[
            {
              image: '',
              value: 'create',
              icon: 'add',
              text: '创建',
              iconColor: '#ff6b6b',
              onClick: navigateToCreate
            },
            {
              image: '',
              value: 'statistics',
              icon: 'bookmark',
              text: '统计', 
              iconColor: '#4ecdc4',
              onClick: () => Taro.navigateTo({ url: '/pages/statistics/index' })
            },
            {
              image: '',
              value: 'template',
              icon: 'download',
              text: '模板',
              iconColor: '#45b7d1',
              onClick: () => Taro.navigateTo({ url: '/pages/template/list' })
            },
            {
              image: '',
              value: 'community',
              icon: 'link',
              text: '社区',
              iconColor: '#9b59b6', 
              onClick: () => Taro.navigateTo({ url: '/pages/community/index' })
            }
          ]}
        />
      </View>

      {/* 事件统计卡片 */}
      <View className='stats-section'>
        <AtCard
          title='📊 数据概览'
        >
          <View className='stats-content'>
            <View className='stat-card ongoing'>
              <AtIcon value='play-circle' size='20' color='#ff6b6b' />
              <View className='stat-info'>
                <Text className='stat-number'>3</Text>
                <Text className='stat-label'>进行中</Text>
              </View>
            </View>
            <View className='stat-card planning'>
              <AtIcon value='clock' size='20' color='#f39c12' />
              <View className='stat-info'>
                <Text className='stat-number'>2</Text>
                <Text className='stat-label'>计划中</Text>
              </View>
            </View>
            <View className='stat-card completed'>
              <AtIcon value='check-circle' size='20' color='#27ae60' />
              <View className='stat-info'>
                <Text className='stat-number'>5</Text>
                <Text className='stat-label'>已完成</Text>
              </View>
            </View>
            <View className='stat-card total'>
              <AtIcon value='folder' size='20' color='#8e44ad' />
              <View className='stat-info'>
                <Text className='stat-number'>10</Text>
                <Text className='stat-label'>总事件</Text>
              </View>
            </View>
          </View>
        </AtCard>
      </View>

      {/* 事件列表 */}
      <View className='event-list-section'>
        <View className='section-header'>
          <Text className='section-title'>📝 最近事件</Text>
          <AtButton 
            size='small' 
            type='secondary'
            onClick={() => Taro.navigateTo({ url: '/pages/event/list' })}
          >
            查看全部
          </AtButton>
        </View>

        <View className='event-list'>
          {filteredEvents.length === 0 ? (
            <View className='empty-state'>
              <AtIcon value='folder-open' size='80' color='#ddd' />
              <Text className='empty-title'>
                {searchKeyword ? '没有找到相关事件' : '还没有创建事件'}
              </Text>
              <Text className='empty-desc'>
                {searchKeyword ? '试试其他关键词' : '创建你的第一个重要事件吧'}
              </Text>
              <AtButton 
                type='primary' 
                size='normal'
                onClick={navigateToCreate}
                className='empty-btn'
                circle
              >
                <AtIcon value='add' size='16' color='#fff' />
                <Text>立即创建</Text>
              </AtButton>
            </View>
          ) : (
            <>
              {filteredEvents.slice(0, 3).map((event, index) => (
                <AtCard
                  key={event.id}
                  className='event-card'
                  onClick={() => navigateToDetail(event.id)}
                  title={event.title}
                >
                  <View className='card-header'>
                    <View className='event-icon' style={{ background: `${getEventColor(event.status)}20` }}>
                      <Text>{event.icon}</Text>
                    </View>
                    <View className='event-info'>
                      <Text className='event-title'>{event.title}</Text>
                      <View className='event-tags'>
                        <AtTag 
                          type={event.status === 'ongoing' ? 'primary' : ''}
                          size='small'
                        >
                          {event.status === 'ongoing' ? '进行中' : event.status === 'planning' ? '计划中' : '已完成'}
                        </AtTag>
                      </View>
                    </View>
                    <AtIcon value='chevron-right' size='14' color='#ccc' />
                  </View>
                  <View className='card-content'>
                    <View className='progress-section'>
                      <Text className='progress-label'>完成进度</Text>
                      <AtProgress 
                        percent={event.progress} 
                        strokeWidth={6}
                        color={event.status === 'ongoing' ? '#ff6b6b' : event.status === 'planning' ? '#f39c12' : '#27ae60'}
                      />
                      <Text className='progress-text'>{event.progress}%</Text>
                    </View>
                    <View className='event-meta'>
                      <View className='meta-item'>
                        <AtIcon value='calendar' size='14' color='#666' />
                        <Text>{event.startDate}</Text>
                      </View>
                      <View className='meta-item'>
                        <AtIcon value='credit-card' size='14' color='#666' />
                        <Text>¥{formatMoney(event.budget)}</Text>
                      </View>
                    </View>
                  </View>
                </AtCard>
              ))}
              {filteredEvents.length > 3 && (
                <AtButton 
                  type='secondary' 
                  size='small' 
                  onClick={() => Taro.navigateTo({ url: '/pages/event/list' })}
                  className='more-btn'
                >
                  查看更多事件
                </AtButton>
              )}
            </>
          )}
        </View>
      </View>

      {/* 悬浮按钮 */}
      <AtFab onClick={navigateToCreate}>
        <AtIcon value='add' size='20' color='#fff' />
      </AtFab>
    </View>
  )
}

export default Index