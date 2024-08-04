export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/out/index',
    'pages/punish/index',
    'pages/mine/index',
    'pages/statistic/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'Jerry的数仓',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    "color": "#969799",
    "selectedColor": "#2660FF",
    "borderStyle": "white",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "获得自律点",
        "iconPath": "images/demand-hall.png",
        "selectedIconPath": "images/demand-hall-select.png"
      },
      {
        "pagePath": 'pages/punish/index',
        "text": "扣除自律点",
        "iconPath": "images/demand-hall.png",
        "selectedIconPath": "images/demand-hall-select.png"
      },
      {
        "pagePath": "pages/out/index",
        "text": "消费自律点",
        "iconPath": "images/demand-hall.png",
        "selectedIconPath": "images/demand-hall-select.png"
      },
      {
        "pagePath": "pages/mine/index",
        "text": "工作台",
        "iconPath": "images/mine.png",
        "selectedIconPath": "images/mine-select.png"
      },
      {
        "pagePath": "pages/statistic/index",
        "text": "统计分析",
        "iconPath": "images/home.png",
        "selectedIconPath": "images/home-select.png"
      }
    ]
  },
})
