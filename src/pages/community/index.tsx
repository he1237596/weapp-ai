import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { 
  AtCard,
  AtButton,
  AtIcon,
  AtAvatar,
  AtTag,
  AtTabs,
  AtFab,
  AtSearchBar,
  AtDivider
} from 'taro-ui'
import './index.scss'

interface PostData {
  id: string
  title: string
  content: string
  author: string
  avatar: string
  tags: string[]
  likes: number
  comments: number
  createTime: string
}

const CommunityIndex = () => {
  const [currentTab, setCurrentTab] = useState(0)
  const [searchValue, setSearchValue] = useState('')
  const [posts, setPosts] = useState<PostData[]>([])

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = () => {
    // 模拟社区帖子数据
    const mockPosts: PostData[] = [
      {
        id: '1',
        title: '完美婚礼策划经验分享',
        content: '今天来分享一下我的婚礼策划心得，希望能帮到大家...',
        author: '小美新娘',
        avatar: '👰',
        tags: ['婚礼', '策划', '经验'],
        likes: 128,
        comments: 32,
        createTime: '2024-03-15'
      },
      {
        id: '2',
        title: '预算控制小技巧',
        content: '在筹备婚礼的过程中，我发现了一些省钱小妙招...',
        author: '精打细算',
        avatar: '💰',
        tags: ['预算', '省钱', '技巧'],
        likes: 89,
        comments: 16,
        createTime: '2024-03-14'
      },
      {
        id: '3',
        title: '场地选择心得',
        content: '选择合适的婚礼场地真的很重要，我来分享一下...',
        author: '场地专家',
        avatar: '🏰',
        tags: ['场地', '选择', '推荐'],
        likes: 156,
        comments: 45,
        createTime: '2024-03-13'
      }
    ]

    setPosts(mockPosts)
  }

  const handleCreatePost = () => {
    Taro.navigateTo({
      url: '/pages/community/post'
    })
  }

  const handleTabChange = (value: number) => {
    setCurrentTab(value)
  }

  const handleSearch = (value: string) => {
    setSearchValue(value)
  }

  const handleLike = (postId: string) => {
    console.log('点赞帖子:', postId)
    Taro.showToast({
      title: '点赞成功',
      icon: 'success'
    })
  }

  const handleComment = (postId: string) => {
    console.log('评论帖子:', postId)
    Taro.showToast({
      title: '评论功能开发中',
      icon: 'none'
    })
  }

  const tabList = [
    { title: '推荐' },
    { title: '热门' },
    { title: '最新' },
    { title: '关注' }
  ]

  return (
    <View className='community'>
      {/* 搜索栏 */}
      <AtSearchBar
        value={searchValue}
        onChange={handleSearch}
        placeholder='搜索社区内容...'
        className='search-bar'
      />

      {/* Tab栏 */}
      <AtTabs 
        current={currentTab} 
        tabList={tabList}
        onClick={handleTabChange}
        className='community-tabs'
      />

{/* 内容区域 */}
        <View className='content'>
          {posts.length === 0 ? (
            <View className='empty-state'>
              <AtIcon value='file' size='60' color='#ddd' />
              <Text className='empty-title'>暂无社区内容</Text>
              <Text className='empty-desc'>快来发布你的第一条内容吧</Text>
              <AtButton 
                type='primary' 
                size='normal'
                onClick={handleCreatePost}
                className='empty-btn'
                circle
              >
                <AtIcon value='add' size='16' color='#fff' />
                <Text>发布第一条内容</Text>
              </AtButton>
            </View>
          ) : (
          <View className='posts-list'>
            {posts.map((post) => (
              <AtCard key={post.id} className='post-card'>
                <View className='post-header'>
                  <View className='author-info'>
                    <AtAvatar 
                      circle 
                      size='large'
                      text={post.avatar}
                    />
                    <View className='author-details'>
                      <Text className='author-name'>{post.author}</Text>
                      <Text className='create-time'>{post.createTime}</Text>
                    </View>
                  </View>
                  <AtButton 
                    size='small' 
                    type='primary'
                    onClick={handleCreatePost}
                  >
                    <AtIcon value='add' size='12' color='#fff' />
                    <Text>发布</Text>
                  </AtButton>
                </View>

                <AtDivider />

                <View className='post-content'>
                  <Text className='post-title'>{post.title}</Text>
                  <Text className='post-desc'>{post.content}</Text>
                  
                  <View className='post-tags'>
                    {post.tags.map((tag, index) => (
                      <AtTag key={index} size='small' type='primary' circle>
                        {tag}
                      </AtTag>
                    ))}
                  </View>
                </View>

                <AtDivider />

                <View className='post-actions'>
                  <View className='action-item' onClick={() => handleLike(post.id)}>
                    <AtIcon value='heart' size='16' color='#ff6b6b' />
                    <Text>{post.likes}</Text>
                  </View>
                  <View className='action-item' onClick={() => handleComment(post.id)}>
                    <AtIcon value='message' size='16' color='#1890ff' />
                    <Text>{post.comments}</Text>
                  </View>
                  <View className='action-item'>
                    <AtIcon value='share' size='16' color='#52c41a' />
                    <Text>分享</Text>
                  </View>
                </View>
              </AtCard>
            ))}
          </View>
        )}
      </View>

      {/* 悬浮发布按钮 */}
      <AtFab onClick={handleCreatePost}>
        <AtIcon value='add' size='20' color='#fff' />
      </AtFab>
    </View>
  )
}

export default CommunityIndex