// 清理项目中多余的控制台输出的脚本

const fs = require('fs')
const path = require('path')

// 需要清理的文件列表
const filesToClean = [
  'src/services/database.ts',
  'src/services/permissions.ts',
  'src/services/realtime.ts',
  'src/utils/storage.ts',
  'src/utils/common.ts'
]

// 清理模式
const patterns = [
  {
    pattern: /console\.error\([^)]*\);\s*/g,
    replacement: ''
  },
  {
    pattern: /console\.warn\([^)]*\);\s*/g,
    replacement: ''
  },
  {
    pattern: /console\.log\([^)]*\);\s*/g,
    replacement: ''
  }
]

filesToClean.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath)
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8')
    
    // 应用清理模式
    patterns.forEach(({ pattern, replacement }) => {
      content = content.replace(pattern, replacement)
    })
    
    fs.writeFileSync(fullPath, content)
    console.log(`✅ 清理完成: ${filePath}`)
  } else {
    console.log(`⚠️ 文件不存在: ${filePath}`)
  }
})

console.log('🎉 控制台输出清理完成！')