-- Wedding Planner Database Schema
-- Supabase SQL Schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 用户表
CREATE TABLE public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nickname VARCHAR(100),
    avatar_url TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- 事件表
CREATE TABLE public.events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(10) DEFAULT '📅',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12, 2),
    currency VARCHAR(3) DEFAULT 'CNY',
    status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'ongoing', 'completed', 'cancelled')),
    creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    location TEXT,
    guest_count INTEGER
);

-- 事件成员表
CREATE TABLE public.event_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('viewer', 'member', 'admin', 'owner')),
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_by UUID REFERENCES public.users(id),
    UNIQUE(event_id, user_id)
);

-- 任务表
CREATE TABLE public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'doing', 'completed', 'cancelled')),
    cost DECIMAL(10, 2) DEFAULT 0,
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    icon VARCHAR(10) DEFAULT '📝',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tags TEXT[]
);

-- 支出表
CREATE TABLE public.expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    vendor VARCHAR(255),
    receipt_url TEXT,
    payment_method VARCHAR(50),
    notes TEXT,
    date DATE NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tags TEXT[]
);

-- 支出分类表
CREATE TABLE public.expense_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(10),
    color VARCHAR(7) DEFAULT '#1890ff',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_system BOOLEAN DEFAULT FALSE,
    UNIQUE(name, is_system)
);

-- 任务模板表
CREATE TABLE public.task_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(10) DEFAULT '📋',
    is_public BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usage_count INTEGER DEFAULT 0
);

-- 模板任务项表
CREATE TABLE public.template_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_id UUID REFERENCES public.task_templates(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    estimated_cost DECIMAL(10, 2) DEFAULT 0,
    category VARCHAR(50),
    due_days_before INTEGER, -- 距离事件开始前的天数
    icon VARCHAR(10) DEFAULT '📝',
    order_index INTEGER DEFAULT 0
);

-- 社区帖子表
CREATE TABLE public.posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL, -- 可选，与特定事件关联
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    images TEXT[], -- 图片URL数组
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 评论表
CREATE TABLE public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE -- 支持嵌套评论
);

-- 通知表
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    type VARCHAR(50) NOT NULL, -- 'task', 'expense', 'event', 'comment', 'system'
    related_id UUID, -- 相关的实体ID (任务、事件等)
    related_type VARCHAR(50), -- 相关的实体类型
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- 文件上传表
CREATE TABLE public.uploads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    bucket_name VARCHAR(100),
    public_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 活动日志表
CREATE TABLE public.activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'join', 'leave'
    entity_type VARCHAR(50) NOT NULL, -- 'event', 'task', 'expense', 'post'
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
-- 用户表索引
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_created_at ON public.users(created_at);

-- 事件表索引
CREATE INDEX idx_events_creator_id ON public.events(creator_id);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_created_at ON public.events(created_at);

-- 事件成员表索引
CREATE INDEX idx_event_members_event_id ON public.event_members(event_id);
CREATE INDEX idx_event_members_user_id ON public.event_members(user_id);
CREATE INDEX idx_event_members_role ON public.event_members(role);

-- 任务表索引
CREATE INDEX idx_tasks_event_id ON public.tasks(event_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at);

-- 支出表索引
CREATE INDEX idx_expenses_event_id ON public.expenses(event_id);
CREATE INDEX idx_expenses_category ON public.expenses(category);
CREATE INDEX idx_expenses_date ON public.expenses(date);
CREATE INDEX idx_expenses_created_by ON public.expenses(created_by);
CREATE INDEX idx_expenses_created_at ON public.expenses(created_at);

-- 帖子表索引
CREATE INDEX idx_posts_author_id ON public.posts(author_id);
CREATE INDEX idx_posts_event_id ON public.posts(event_id);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_created_at ON public.posts(created_at);
CREATE INDEX idx_posts_title_gin ON public.posts USING gin(title gin_trgm_ops);

-- 评论表索引
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_author_id ON public.comments(author_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at);

-- 通知表索引
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);

-- 活动日志索引
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_event_id ON public.activity_logs(event_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);

-- 文件上传表索引
CREATE INDEX idx_uploads_user_id ON public.uploads(user_id);
CREATE INDEX idx_uploads_created_at ON public.uploads(created_at);

-- 启用行级安全策略 (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS 策略
-- 用户只能访问自己的数据
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 事件访问策略
CREATE POLICY "Users can view events they are members of" ON public.events FOR SELECT USING (
    id IN (
        SELECT event_id FROM public.event_members 
        WHERE user_id = auth.uid()
    )
);

-- 事件成员策略
CREATE POLICY "Event members can view membership" ON public.event_members FOR SELECT USING (
    user_id = auth.uid() OR 
    event_id IN (
        SELECT event_id FROM public.event_members 
        WHERE user_id = auth.uid()
    )
);

-- 任务访问策略
CREATE POLICY "Users can view tasks from their events" ON public.tasks FOR SELECT USING (
    event_id IN (
        SELECT event_id FROM public.event_members 
        WHERE user_id = auth.uid()
    )
);

-- 支出访问策略
CREATE POLICY "Users can view expenses from their events" ON public.expenses FOR SELECT USING (
    event_id IN (
        SELECT event_id FROM public.event_members 
        WHERE user_id = auth.uid()
    )
);

-- 帖子访问策略
CREATE POLICY "Published posts are viewable by everyone" ON public.posts FOR SELECT USING (status = 'published');
CREATE POLICY "Users can manage own posts" ON public.posts FOR ALL USING (author_id = auth.uid());

-- 评论访问策略
CREATE POLICY "Comments on published posts are viewable" ON public.comments FOR SELECT USING (
    post_id IN (SELECT id FROM public.posts WHERE status = 'published')
);
CREATE POLICY "Users can manage own comments" ON public.comments FOR ALL USING (author_id = auth.uid());

-- 通知访问策略
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- 文件上传策略
CREATE POLICY "Users can view own uploads" ON public.uploads FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own uploads" ON public.uploads FOR ALL USING (user_id = auth.uid());

-- 活动日志策略
CREATE POLICY "Users can view own activity logs" ON public.activity_logs FOR SELECT USING (user_id = auth.uid());

-- 创建触发器函数，用于更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_templates_updated_at BEFORE UPDATE ON public.task_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入默认的支出分类
INSERT INTO public.expense_categories (name, icon, color, description, is_system) VALUES
('场地', '🏢', '#1890ff', '婚礼场地租赁费用', TRUE),
('餐饮', '🍽️', '#52c41a', '婚宴餐饮费用', TRUE),
('摄影', '📸', '#fa8c16', '婚礼摄影摄像费用', TRUE),
('服装', '👗', '#eb2f96', '新娘新郎服装费用', TRUE),
('装饰', '🎨', '#722ed1', '婚礼装饰布置费用', TRUE),
('交通', '🚗', '#13c2c2', '婚礼交通费用', TRUE),
('住宿', '🏨', '#fa541c', '婚礼住宿费用', TRUE),
('娱乐', '🎵', '#a0d911', '婚礼娱乐活动费用', TRUE),
('礼品', '🎁', '#f5222d', '礼品红包费用', TRUE),
('其他', '📦', '#8c8c8c', '其他杂项费用', TRUE);

-- 插入一些默认的任务模板
INSERT INTO public.task_templates (name, description, icon, is_public) VALUES
('标准婚礼模板', '适用于大多数婚礼的标准任务清单', '💑', TRUE),
('小型婚礼模板', '适用于小型婚礼的简化任务清单', '💕', TRUE),
('大型婚礼模板', '适用于大型婚礼的详细任务清单', '💖', TRUE),
('户外婚礼模板', '适用于户外婚礼的特殊任务清单', '🌳', TRUE);

-- 为模板添加示例任务
INSERT INTO public.template_tasks (template_id, title, description, priority, category, due_days_before, order_index, icon) 
SELECT 
    t.id,
    '确定婚礼日期',
    '选择并确定婚礼的具体日期',
    'high',
    'planning',
    180,
    1,
    '📅'
FROM public.task_templates t WHERE t.name = '标准婚礼模板';

INSERT INTO public.template_tasks (template_id, title, description, priority, category, due_days_before, order_index, icon) 
SELECT 
    t.id,
    '确定预算',
    '制定婚礼预算计划',
    'high',
    'planning',
    170,
    2,
    '💰'
FROM public.task_templates t WHERE t.name = '标准婚礼模板';

INSERT INTO public.template_tasks (template_id, title, description, priority, category, due_days_before, order_index, icon) 
SELECT 
    t.id,
    '预定场地',
    '预定婚礼仪式和宴会场地',
    'high',
    'venue',
    150,
    3,
    '🏰'
FROM public.task_templates t WHERE t.name = '标准婚礼模板';

-- 创建视图用于常用查询
CREATE OR REPLACE VIEW event_summary AS
SELECT 
    e.id,
    e.title,
    e.status,
    e.start_date,
    e.budget,
    e.progress,
    u.nickname as creator_name,
    COALESCE(SUM(t.cost), 0) as total_task_cost,
    COALESCE(SUM(ex.amount), 0) as total_expense,
    COUNT(DISTINCT t.id) as task_count,
    COUNT(DISTINCT ex.id) as expense_count,
    COUNT(DISTINCT em.user_id) as member_count
FROM public.events e
LEFT JOIN public.users u ON e.creator_id = u.id
LEFT JOIN public.event_members em ON e.id = em.event_id
LEFT JOIN public.tasks t ON e.id = t.event_id
LEFT JOIN public.expenses ex ON e.id = ex.event_id
GROUP BY e.id, u.nickname;

-- 创建函数用于计算事件统计信息
CREATE OR REPLACE FUNCTION calculate_event_stats(event_uuid UUID)
RETURNS TABLE(
    total_tasks BIGINT,
    completed_tasks BIGINT,
    pending_tasks BIGINT,
    total_expenses DECIMAL,
    task_completion_rate NUMERIC,
    budget_usage_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(t.id)::BIGINT,
        COUNT(t.id FILTER WHERE t.status = 'completed')::BIGINT,
        COUNT(t.id FILTER WHERE t.status = 'pending')::BIGINT,
        COALESCE(SUM(ex.amount), 0),
        CASE 
            WHEN COUNT(t.id) > 0 THEN 
                ROUND(COUNT(t.id FILTER WHERE t.status = 'completed')::NUMERIC / COUNT(t.id) * 100, 2)
            ELSE 0 
        END,
        CASE 
            WHEN e.budget > 0 THEN 
                ROUND(COALESCE(SUM(ex.amount), 0) / e.budget * 100, 2)
            ELSE 0 
        END
    FROM public.events e
    LEFT JOIN public.tasks t ON e.id = t.event_id
    LEFT JOIN public.expenses ex ON e.id = ex.event_id
    WHERE e.id = event_uuid
    GROUP BY e.id, e.budget;
END;
$$ LANGUAGE plpgsql;