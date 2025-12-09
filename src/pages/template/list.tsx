import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { 
  AtCard, 
  AtButton, 
  AtIcon,
  AtTag,
  AtFab,
  AtSearchBar
} from 'taro-ui'
import './list.scss'

interface Template {
  id: string
  title: string
  category: string
  usageCount: number
  description: string
  icon: string
  color: string
}

const TemplateList = () => {
  const [templates, setTemplates] = useState<Template[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = () => {
    const mockTemplates: Template[] = [
      {
        id: '1',
        title: '婚礼策划模板',
        category: 'wedding',
        usageCount: 156,
        description: '完整的婚礼策划流程和预算管理',
        icon: '💒',
        color: '#ff6b6b'
      },
      {
        id: '2',
        title: '生日派对模板',
        category: 'birthday',
        usageCount: 89,
        description: '生日派对活动策划和预算控制',
        icon: '🎂',
        color: '#4ecdc4'
      },
      {
        id: '3',
        title: '企业年会模板',
        category: 'corporate',
        usageCount: 45,
        description: '企业年会活动组织和管理',
        icon: '🏢',
        color: '#45b7d1'
      },
      {
        id: '4',
        title: '乔迁之喜模板',
        category: 'housewarming',
        usageCount: 67,
        description: '乔迁庆祝活动策划',
        icon: '🏠',
        color: '#9b59b6'
      },
      {
        id: '5',
        title: '毕业典礼模板',
        category: 'graduation',
        usageCount: 34,
        description: '毕业典礼活动安排',
        icon: '🎓',
        color: '#f39c12'
      },
      {
        id: '6',
        title: '宝宝满月模板',
        category: 'baby',
        usageCount: 78,
        description: '宝宝满月酒庆祝活动',
        icon: '👶',
        color: '#e74c3c'
      }
    ]

    setTemplates(mockTemplates)
  }

  const useTemplate = (_templateId: string) => {
    Taro.showToast({
      title: '使用模板功能开发中',
      icon: 'none'
    })
  }

  const createTemplate = () => {
    Taro.showToast({
      title: '创建模板功能开发中',
      icon: 'none'
    })
  }

  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'wedding': '婚礼',
      'birthday': '生日',
      'corporate': '企业',
      'housewarming': '乔迁',
      'graduation': '毕业',
      'baby': '宝宝'
    }
    return categoryMap[category] || category
  }

  // 过滤模板
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchValue.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // 分类数据
  const categories = [
    { key: 'all', label: '全部', icon: 'folder' },
    { key: 'wedding', label: '婚礼', icon: 'heart' },
    { key: 'birthday', label: '生日', icon: 'bookmark' },
    { key: 'corporate', label: '企业', icon: 'credit-card' },
    { key: 'housewarming', label: '乔迁', icon: 'home' },
    { key: 'graduation', label: '毕业', icon: 'tag' },
    { key: 'baby', label: '宝宝', icon: 'user' }
  ]

  return (
    <View className='template-list'>
      {/* 头部 */}
      <View className='header'>
        <Text className='title'>模板中心</Text>
        <AtButton 
          type='primary'
          size='small'
          onClick={createTemplate}
          className='create-btn'
        >
          <AtIcon value='add' size='14' color='#fff' />
          <Text>创建</Text>
        </AtButton>
      </View>

      {/* 搜索栏 */}
      <View className='search-section'>
        <AtSearchBar
          value={searchValue}
          onChange={(value) => setSearchValue(value)}
          onClear={() => setSearchValue('')}
          placeholder='搜索模板...'
          className='search-bar'
        />
      </View>

      {/* 分类筛选 */}
      <View className='category-section'>
        <View className='category-tabs'>
          {categories.map((category) => (
            <View
              key={category.key}
              className={`category-tab ${selectedCategory === category.key ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.key)}
            >
              <AtIcon 
                value={category.icon} 
                size='16' 
                color={selectedCategory === category.key ? '#667eea' : '#999'} 
              />
              <Text>{category.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 模板列表 */}
      <View className='content'>
        {filteredTemplates.length === 0 ? (
          <View className='empty-state'>
            <AtIcon value='file' size='60' color='#ddd' />
            <Text className='empty-title'>
              {searchValue ? '没有找到相关模板' : '暂无模板'}
            </Text>
            <Text className='empty-desc'>
              {searchValue ? '试试其他关键词' : '创建你的第一个模板吧'}
            </Text>
            <AtButton 
              type='primary' 
              size='normal'
              onClick={createTemplate}
              className='empty-btn'
              circle
            >
              <AtIcon value='add' size='16' color='#fff' />
              <Text>立即创建</Text>
            </AtButton>
          </View>
        ) : (
          <View className='templates-grid'>
            {filteredTemplates.map((template) => (
              <AtCard key={template.id} className='template-card'>
                <View className='template-header'>
                  <View className='template-icon' style={{ background: `${template.color}20` }}>
                    <Text>{template.icon}</Text>
                  </View>
                  <View className='template-category'>
                    <AtTag type='primary' size='small' circle>
                      {getCategoryLabel(template.category)}
                    </AtTag>
                  </View>
                </View>
                
                <View className='template-content'>
                  <Text className='template-title'>{template.title}</Text>
                  <Text className='template-desc'>{template.description}</Text>
                  
                  <View className='template-stats'>
                    <View className='stat-item'>
                      <AtIcon value='download' size='14' color='#666' />
                      <Text>{template.usageCount} 次使用</Text>
                    </View>
                  </View>
                </View>
                
                <View className='template-actions'>
                  <AtButton 
                    type='primary'
                    size='small'
                    onClick={() => useTemplate(template.id)}
                    className='use-btn'
                  >
                    使用模板
                  </AtButton>
                </View>
              </AtCard>
            ))}
          </View>
        )}
      </View>

      {/* 悬浮按钮 */}
      <AtFab onClick={createTemplate}>
        <AtIcon value='add' size='20' color='#fff' />
      </AtFab>
    </View>
  )
}

export default TemplateList