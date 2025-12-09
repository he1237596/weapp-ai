import { supabase } from '../lib/supabase'
import { hasPermission } from './auth'

export type Role = 'owner' | 'admin' | 'member' | 'viewer'
export type Permission = 
  | 'read_event'
  | 'edit_event'
  | 'delete_event'
  | 'manage_members'
  | 'create_task'
  | 'edit_task'
  | 'delete_task'
  | 'create_expense'
  | 'edit_expense'
  | 'delete_expense'
  | 'view_reports'

interface RolePermissions {
  [key: string]: Permission[]
}

// 定义每个角色对应的权限
const ROLE_PERMISSIONS: RolePermissions = {
  owner: [
    'read_event',
    'edit_event',
    'delete_event',
    'manage_members',
    'create_task',
    'edit_task',
    'delete_task',
    'create_expense',
    'edit_expense',
    'delete_expense',
    'view_reports'
  ],
  admin: [
    'read_event',
    'edit_event',
    'manage_members',
    'create_task',
    'edit_task',
    'delete_task',
    'create_expense',
    'edit_expense',
    'delete_expense',
    'view_reports'
  ],
  member: [
    'read_event',
    'create_task',
    'edit_task',
    'create_expense',
    'edit_expense',
    'view_reports'
  ],
  viewer: [
    'read_event',
    'view_reports'
  ]
}

export class PermissionService {
  // 检查用户是否有特定权限
  static async hasPermission(
    userId: string,
    eventId: string,
    permission: Permission
  ): Promise<boolean> {
    try {
      // 获取用户在事件中的角色
      const role = await this.getUserRole(userId, eventId)
      if (!role) return false

      return this.roleHasPermission(role, permission)
    } catch (error) {
      console.error('检查权限失败:', error)
      return false
    }
  }

  // 检查角色是否有特定权限
  static roleHasPermission(role: Role, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role]?.includes(permission) || false
  }

  // 获取用户在事件中的角色
  static async getUserRole(userId: string, eventId: string): Promise<Role | null> {
    try {
      const { data, error } = await supabase
        .from('event_members')
        .select(`
          role,
          user_id,
          events!inner(
            creator_id
          )
        `)
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single()

      if (error || !data) {
        return null
      }

      return data.role as Role
    } catch (error) {
      console.error('获取用户角色失败:', error)
      return null
    }
  }

  // 获取事件的所有成员
  static async getEventMembers(eventId: string) {
    try {
      const { data, error } = await supabase
        .from('event_members')
        .select(`
          *,
          users (
            id,
            email,
            nickname,
            avatar_url
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data
    } catch (error) {
      console.error('获取事件成员失败:', error)
      throw error
    }
  }

  // 添加成员到事件
  static async addMemberToEvent(
    eventId: string,
    userId: string,
    role: Role = 'member'
  ) {
    try {
      const { data, error } = await supabase
        .from('event_members')
        .insert({
          event_id: eventId,
          user_id: userId,
          role
        })
        .select(`
          *,
          users (
            id,
            email,
            nickname,
            avatar_url
          )
        `)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('添加成员失败:', error)
      throw error
    }
  }

  // 更新成员角色
  static async updateMemberRole(
    eventId: string,
    userId: string,
    newRole: Role
  ) {
    try {
      const { data, error } = await supabase
        .from('event_members')
        .update({ role: newRole })
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .select(`
          *,
          users (
            id,
            email,
            nickname,
            avatar_url
          )
        `)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('更新成员角色失败:', error)
      throw error
    }
  }

  // 移除成员
  static async removeMemberFromEvent(eventId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('event_members')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('移除成员失败:', error)
      throw error
    }
  }

  // 批量添加成员
  static async addMultipleMembers(
    eventId: string,
    members: Array<{ userId: string; role?: Role }>
  ) {
    try {
      const memberData = members.map(member => ({
        event_id: eventId,
        user_id: member.userId,
        role: member.role || 'member'
      }))

      const { data, error } = await supabase
        .from('event_members')
        .insert(memberData)
        .select(`
          *,
          users (
            id,
            email,
            nickname,
            avatar_url
          )
        `)

      if (error) throw error
      return data
    } catch (error) {
      console.error('批量添加成员失败:', error)
      throw error
    }
  }

  // 检查用户是否是事件的创建者（所有者）
  static async isEventOwner(userId: string, eventId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('creator_id')
        .eq('id', eventId)
        .single()

      if (error || !data) {
        return false
      }

      return data.creator_id === userId
    } catch (error) {
      console.error('检查事件所有权失败:', error)
      return false
    }
  }

  // 转移事件所有权
  static async transferOwnership(
    eventId: string,
    fromUserId: string,
    toUserId: string
  ) {
    try {
      // 验证当前用户是否是所有者
      const isOwner = await this.isEventOwner(fromUserId, eventId)
      if (!isOwner) {
        throw new Error('只有事件所有者才能转移所有权')
      }

      // 开始事务
      const { error: updateError } = await supabase
        .from('events')
        .update({ creator_id: toUserId })
        .eq('id', eventId)

      if (updateError) throw updateError

      // 将原所有者角色设为管理员，新所有者设为所有者
      await supabase
        .from('event_members')
        .upsert([
          {
            event_id: eventId,
            user_id: toUserId,
            role: 'owner'
          },
          {
            event_id: eventId,
            user_id: fromUserId,
            role: 'admin'
          }
        ])

      return true
    } catch (error) {
      console.error('转移所有权失败:', error)
      throw error
    }
  }

  // 获取角色的所有权限
  static getRolePermissions(role: Role): Permission[] {
    return ROLE_PERMISSIONS[role] || []
  }

  // 批量检查权限
  static async checkMultiplePermissions(
    userId: string,
    eventId: string,
    permissions: Permission[]
  ): Promise<Record<Permission, boolean>> {
    const results: Record<string, boolean> = {}
    
    for (const permission of permissions) {
      results[permission] = await this.hasPermission(userId, eventId, permission)
    }

    return results as Record<Permission, boolean>
  }
}

// 权限检查高阶组件
export function withPermission(permission: Permission) {
  return function (WrappedComponent: any) {
    return class extends WrappedComponent {
      async componentDidMount() {
        if (super.componentDidMount) {
          await super.componentDidMount()
        }

        const userId = this.state?.userId
        const eventId = this.state?.eventId

        if (userId && eventId) {
          const hasPermission = await PermissionService.hasPermission(
            userId,
            eventId,
            permission
          )

          if (!hasPermission) {
            Taro.showToast({
              title: '没有操作权限',
              icon: 'none'
            })
            Taro.navigateBack()
            return
          }
        }

        if (super.componentDidMount) {
          super.componentDidMount()
        }
      }
    }
  }
}

// 权限工具函数
export const checkAndHandlePermission = async (
  userId: string,
  eventId: string,
  permission: Permission,
  onFail?: () => void
): Promise<boolean> => {
  const hasPermission = await PermissionService.hasPermission(
    userId,
    eventId,
    permission
  )

  if (!hasPermission) {
    Taro.showToast({
      title: '没有操作权限',
      icon: 'none'
    })
    
    if (onFail) {
      onFail()
    } else {
      Taro.navigateBack()
    }
    
    return false
  }

  return true
}

// 角色管理工具
export class RoleManager {
  // 检查是否可以提升角色
  static canPromoteRole(currentRole: Role, targetRole: Role): boolean {
    const roleHierarchy = {
      'viewer': 0,
      'member': 1,
      'admin': 2,
      'owner': 3
    }

    return roleHierarchy[targetRole] > roleHierarchy[currentRole]
  }

  // 检查是否可以降低角色
  static canDemoteRole(currentRole: Role, targetRole: Role): boolean {
    const roleHierarchy = {
      'viewer': 0,
      'member': 1,
      'admin': 2,
      'owner': 3
    }

    return roleHierarchy[targetRole] < roleHierarchy[currentRole]
  }

  // 获取可提升到的角色列表
  static getPromotableRoles(currentRole: Role): Role[] {
    const allRoles: Role[] = ['viewer', 'member', 'admin', 'owner']
    return allRoles.filter(role => this.canPromoteRole(currentRole, role))
  }

  // 获取可降低到的角色列表
  static getDemotableRoles(currentRole: Role): Role[] {
    const allRoles: Role[] = ['viewer', 'member', 'admin', 'owner']
    return allRoles.filter(role => this.canDemoteRole(currentRole, role))
  }
}

export default PermissionService