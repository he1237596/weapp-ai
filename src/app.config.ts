export default {
  pages: [
    'pages/login/index',
    'pages/index/index',
    'pages/statistics/index',
    'pages/community/index',
    'pages/profile/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '婚礼策划助手',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#7A7E83',
    selectedColor: '#3cc51f',
    borderStyle: 'black',
    backgroundColor: '#ffffff',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页'
      },
      {
        pagePath: 'pages/statistics/index',
        text: '统计'
      },
      {
        pagePath: 'pages/community/index',
        text: '社区'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
}