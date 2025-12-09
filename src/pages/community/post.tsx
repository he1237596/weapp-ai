import { View, Text } from '@tarojs/components'
import './post.scss'

const CommunityPost = () => {
  return (
    <View className='community-post'>
      <View className='header'>
        <Text className='title'>发布帖子</Text>
      </View>
      
      <View className='content'>
        <View className='empty-state'>
          <Text className='empty-text'>发帖功能开发中...</Text>
        </View>
      </View>
    </View>
  )
}

export default CommunityPost