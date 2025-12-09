export default {
  pages: [
    'pages/login/index',
    'pages/index/index',
    'pages/event/list',
    'pages/event/create',
    'pages/event/detail',
    'pages/event/edit',
    'pages/event/tasks',
    'pages/event/calendar',
    'pages/event/expenses',
    'pages/task/list',
    'pages/task/create',
    'pages/task/detail',
    'pages/expense/list',
    'pages/expense/create',
    'pages/expense/detail',
    'pages/statistics/index',
    'pages/template/list',
    'pages/template/detail',
    'pages/community/index',
    'pages/community/post',
    'pages/profile/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '大事记',
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
        pagePath: 'pages/event/list',
        text: '事件'
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
  },
  permission: {
    'scope.userLocation': {
      desc: '你的位置信息将用于小程序位置接口的效果展示'
    }
  }
}