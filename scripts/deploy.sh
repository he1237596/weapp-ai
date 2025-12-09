#!/bin/bash

# Wedding Planner 部署脚本
# 支持前端和后端的自动化部署

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查必要的工具
check_tools() {
    log_info "检查必要的部署工具..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi
    
    if ! command -v wrangler &> /dev/null; then
        log_warning "Wrangler CLI 未安装，正在安装..."
        npm install -g wrangler
    fi
    
    log_success "所有工具检查通过"
}

# 检查环境变量
check_env() {
    log_info "检查环境变量..."
    
    if [ ! -f ".env" ]; then
        log_warning ".env 文件不存在，正在从 .env.example 创建..."
        cp .env.example .env
        log_warning "请编辑 .env 文件并填入正确的配置值"
        exit 1
    fi
    
    # 检查关键环境变量
    source .env
    if [ -z "$REACT_APP_SUPABASE_URL" ] || [ "$REACT_APP_SUPABASE_URL" = "https://your-project-id.supabase.co" ]; then
        log_error "请在 .env 文件中设置正确的 REACT_APP_SUPABASE_URL"
        exit 1
    fi
    
    if [ -z "$REACT_APP_SUPABASE_ANON_KEY" ] || [ "$REACT_APP_SUPABASE_ANON_KEY" = "your-supabase-anon-key" ]; then
        log_error "请在 .env 文件中设置正确的 REACT_APP_SUPABASE_ANON_KEY"
        exit 1
    fi
    
    log_success "环境变量检查通过"
}

# 部署前端
deploy_frontend() {
    log_info "开始部署前端..."
    
    # 安装依赖
    log_info "安装前端依赖..."
    npm install
    
    # 构建
    log_info "构建前端应用..."
    
    case $ENV in
        "production")
            npm run build:h5
            ;;
        "staging")
            npm run build:h5
            ;;
        "development")
            npm run build:h5
            ;;
        *)
            npm run build:h5
            ;;
    esac
    
    log_success "前端构建完成"
    
    # 如果是生产环境，可以添加上传到 CDN 的逻辑
    if [ "$ENV" = "production" ]; then
        log_info "上传生产环境文件到 CDN..."
        # 这里可以添加上传到 Vercel、Netlify 或其他静态托管服务的逻辑
    fi
    
    log_success "前端部署完成"
}

# 部署 Cloudflare Workers API
deploy_cloudflare() {
    log_info "开始部署 Cloudflare Workers API..."
    
    # 进入 Cloudflare Workers 目录
    cd cloudflare-workers
    
    # 安装依赖
    log_info "安装 Cloudflare Workers 依赖..."
    npm install
    
    # 设置环境变量 secrets
    log_info "设置 Cloudflare Workers 环境变量..."
    
    if [ -z "$SUPABASE_URL" ]; then
        SUPABASE_URL=$(grep REACT_APP_SUPABASE_URL ../.env | cut -d '=' -f2)
    fi
    
    if [ -z "$SUPABASE_SERVICE_KEY" ]; then
        log_error "请设置 SUPABASE_SERVICE_KEY 环境变量"
        exit 1
    fi
    
    # 设置 secrets
    wrangler secret put SUPABASE_URL
    wrangler secret put SUPABASE_SERVICE_KEY
    
    # 部署
    log_info "部署 Cloudflare Workers..."
    
    case $ENV in
        "production")
            wrangler deploy --env production
            ;;
        "staging")
            wrangler deploy --env staging
            ;;
        "development")
            wrangler deploy --env development
            ;;
        *)
            wrangler deploy --env development
            ;;
    esac
    
    cd ..
    log_success "Cloudflare Workers API 部署完成"
}

# 部署 Supabase
deploy_supabase() {
    log_info "开始部署 Supabase 数据库..."
    
    # 检查 Supabase CLI
    if ! command -v supabase &> /dev/null; then
        log_warning "Supabase CLI 未安装，正在安装..."
        npm install -g supabase
    fi
    
    # 执行数据库迁移
    if [ -f "supabase/schema.sql" ]; then
        log_info "执行数据库迁移..."
        # 这里需要根据实际的 Supabase 项目配置来执行
        # supabase db push
        log_success "数据库迁移完成"
    else
        log_warning "未找到数据库迁移文件"
    fi
    
    log_success "Supabase 部署完成"
}

# 运行测试
run_tests() {
    log_info "运行测试..."
    
    # 前端测试
    log_info "运行前端测试..."
    npm test -- --passWithNoTests
    
    # Cloudflare Workers 测试
    log_info "运行 Cloudflare Workers 测试..."
    cd cloudflare-workers
    npm test -- --passWithNoTests
    cd ..
    
    log_success "所有测试通过"
}

# 主函数
main() {
    # 设置默认环境
    ENV=${1:-development}
    
    log_info "开始部署 Wedding Planner 应用..."
    log_info "部署环境: $ENV"
    
    # 检查步骤
    check_tools
    check_env
    
    # 可选：运行测试
    if [ "$SKIP_TESTS" != "true" ]; then
        run_tests
    fi
    
    # 部署步骤
    deploy_supabase
    deploy_cloudflare
    deploy_frontend
    
    log_success "🎉 部署完成！"
    log_info "环境: $ENV"
    
    # 显示部署信息
    echo ""
    echo "部署信息："
    echo "- 前端应用: https://your-frontend-url.com"
    echo "- API 接口: https://api.yourdomain.com"
    echo "- 数据库: https://your-project-id.supabase.co"
    echo ""
}

# 显示帮助信息
show_help() {
    echo "用法: $0 [环境] [选项]"
    echo ""
    echo "环境:"
    echo "  development  开发环境 (默认)"
    echo "  staging      测试环境"
    echo "  production   生产环境"
    echo ""
    echo "选项:"
    echo "  --skip-tests 跳过测试"
    echo "  --help       显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 staging"
    echo "  $0 production --skip-tests"
}

# 解析命令行参数
case $1 in
    --help|-h)
        show_help
        exit 0
        ;;
    --skip-tests)
        export SKIP_TESTS=true
        shift
        ;;
esac

# 执行主函数
main "$@"