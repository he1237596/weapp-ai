import Taro from '@tarojs/taro';

const STORAGE_KEYS = {
  USER_INFO: 'user_info',
  EVENTS: 'events',
  TEMPLATES: 'templates',
  COMMUNITY_POSTS: 'community_posts'
};

// 本地存储工具类
export class StorageUtil {
  // 设置数据
  static async set(key, data) {
    try {
      await Taro.setStorage({
        key,
        data: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Storage remove error:', error);
      throw error;
    }
  }

  // 获取数据
  static async get(key, defaultValue = null) {
    try {
      const result = await Taro.getStorage({ key });
      return JSON.parse(result.data);
    } catch (error) {
      return defaultValue;
    }
  }

  // 删除数据
  static async remove(key) {
    try {
      await Taro.removeStorage({ key });
    } catch (error) {
      console.error('Storage remove error:', error);
      throw error;
    }
  }

  // 清空数据
  static async clear() {
    try {
      await Taro.clearStorage();
    } catch (error) {
      console.error('Storage remove error:', error);
      throw error;
    }
  }
}

// 用户存储
export class UserStorage {
  static async saveUser(user) {
    return await StorageUtil.set(STORAGE_KEYS.USER_INFO, user);
  }

  static async getUser() {
    return await StorageUtil.get(STORAGE_KEYS.USER_INFO);
  }

  static async removeUser() {
    return await StorageUtil.remove(STORAGE_KEYS.USER_INFO);
  }
}

// 活动存储
export class EventStorage {
  static async saveEvent(event) {
    const events = await EventStorage.getAllEvents();
    const index = events.findIndex(e => e.id === event.id);
    
    if (index > -1) {
      events[index] = event;
    } else {
      events.push(event);
    }
    
    return await StorageUtil.set(STORAGE_KEYS.EVENTS, events);
  }

  static async getAllEvents() {
    return await StorageUtil.get(STORAGE_KEYS.EVENTS, []);
  }

  static async getEvent(id) {
    const events = await EventStorage.getAllEvents();
    return events.find(e => e.id === id) || null;
  }

  static async deleteEvent(id) {
    const events = await EventStorage.getAllEvents();
    const filteredEvents = events.filter(e => e.id !== id);
    return await StorageUtil.set(STORAGE_KEYS.EVENTS, filteredEvents);
  }
}

// 模板存储
export class TemplateStorage {
  static async saveTemplate(template) {
    const templates = await TemplateStorage.getAllTemplates();
    const index = templates.findIndex(t => t.id === template.id);
    
    if (index > -1) {
      templates[index] = template;
    } else {
      templates.push(template);
    }
    
    return await StorageUtil.set(STORAGE_KEYS.TEMPLATES, templates);
  }

  static async getAllTemplates() {
    return await StorageUtil.get(STORAGE_KEYS.TEMPLATES, []);
  }

  static async getTemplate(id) {
    const templates = await TemplateStorage.getAllTemplates();
    return templates.find(t => t.id === id) || null;
  }

  static async deleteTemplate(id) {
    const templates = await TemplateStorage.getAllTemplates();
    const filteredTemplates = templates.filter(t => t.id !== id);
    return await StorageUtil.set(STORAGE_KEYS.TEMPLATES, filteredTemplates);
  }
}

// 社区存储
export class CommunityStorage {
  static async savePost(post) {
    const posts = await CommunityStorage.getAllPosts();
    const index = posts.findIndex(p => p.id === post.id);
    
    if (index > -1) {
      posts[index] = post;
    } else {
      posts.push(post);
    }
    
    return await StorageUtil.set(STORAGE_KEYS.COMMUNITY_POSTS, posts);
  }

  static async getAllPosts() {
    return await StorageUtil.get(STORAGE_KEYS.COMMUNITY_POSTS, []);
  }

  static async getPost(id) {
    const posts = await CommunityStorage.getAllPosts();
    return posts.find(p => p.id === id) || null;
  }

  static async deletePost(id) {
    const posts = await CommunityStorage.getAllPosts();
    const filteredPosts = posts.filter(p => p.id !== id);
    return await StorageUtil.set(STORAGE_KEYS.COMMUNITY_POSTS, filteredPosts);
  }
}