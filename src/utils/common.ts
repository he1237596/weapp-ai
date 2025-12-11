import Taro from '@tarojs/taro'

// 生成唯一ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 格式化金额
export function formatMoney(amount) {
  return new Intl.NumberFormat('zh-CN').format(amount)
}

// 格式化日期
export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 计算剩余天数
export function getDaysRemaining(endDate) {
  const now = new Date().getTime()
  const end = new Date(endDate).getTime()
  const diff = end - now
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
}

// 复制到剪贴板
export async function copyToClipboard(text) {
  try {
    await Taro.setClipboardData({ data: text });
    Taro.showToast({
      title: '复制成功',
      icon: 'success'
    });
  } catch (error) {
    Taro.showToast({
      title: '复制失败',
      icon: 'none'
    });
  }
}

// 显示Toast
export function showToast(title, icon = 'none') {
  Taro.showToast({
    title,
    icon
  });
}

// 显示确认对话框
export function showConfirm(title, content) {
  return Taro.showModal({
    title,
    content,
    confirmText: '确定',
    cancelText: '取消',
    showCancel: true
  });
}

// 选择图片
export function chooseImage() {
  return Taro.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera']
  });
}

// 获取支出分类标签
export function getExpenseCategoryLabel(category) {
  const categoryMap = {
    'venue': '场地',
    'photography': '摄影',
    'clothing': '服装',
    'decoration': '装饰',
    'food': '餐饮',
    'transportation': '交通',
    'accommodation': '住宿',
    'other': '其他'
  }
  return categoryMap[category] || category || '其他'
}

// 计算百分比
export function calculatePercentage(value, total) {
  if (!total || total === 0) return 0
  return Math.round((value / total) * 100)
}