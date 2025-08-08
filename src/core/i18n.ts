// Simple i18n support for CCM
export type Language = 'en' | 'zh'

interface Messages {
  title: string
  subtitle: string
  menu: {
    list: string
    delete: string
    deleteCorrupted: string
    stats: string
    health: string
    backup: string
    exit: string
  }
  messages: {
    noConversations: string
    corruptedFound: string
    noCorrupted: string
    deletingCorrupted: string
    deletionCancelled: string
    goodbye: string
    backupCreated: string
    healthyConversations: string
    confirm: string
    selectConversation: string
    selectedConversation: string
    pressEnter: string
    reason: string
  }
  stats: {
    totalConversations: string
    totalSize: string
    projects: string
    corrupted: string
    largestConversation: string
    oldestConversation: string
  }
  actions: {
    deleteAll: string
    delete: string
    cancel: string
  }
}

const messages: Record<Language, Messages> = {
  en: {
    title: '🧹 Claude Conversation Manager',
    subtitle: 'Simple & lightweight conversation cleaner for Claude Code',
    menu: {
      list: '📋 List all conversations',
      delete: '🗑️  Delete conversation',
      deleteCorrupted: '❌ Delete corrupted conversations (recommended)',
      stats: '📊 View statistics',
      health: '🏥 Health check & repair',
      backup: '💾 Create backup',
      exit: '🚪 Exit'
    },
    messages: {
      noConversations: 'No conversations found.',
      corruptedFound: 'Found {count} corrupted conversations:',
      noCorrupted: '✓ No corrupted conversations found. Your conversations are healthy!',
      deletingCorrupted: 'Deleting corrupted conversations...',
      deletionCancelled: 'Deletion cancelled.',
      goodbye: '👋 Goodbye! Keep your conversations clean!',
      backupCreated: 'ℹ Backup created before deletion.',
      healthyConversations: '✓ All conversations are healthy!',
      confirm: 'Are you sure?',
      selectConversation: 'Select conversation to delete:',
      selectedConversation: 'Selected conversation:',
      pressEnter: 'Press Enter to continue...',
      reason: 'Reason:'
    },
    stats: {
      totalConversations: 'Total conversations:',
      totalSize: 'Total size:',
      projects: 'Projects:',
      corrupted: 'Corrupted conversations:',
      largestConversation: 'Largest conversation:',
      oldestConversation: 'Oldest conversation:'
    },
    actions: {
      deleteAll: 'Delete all {count} corrupted conversations?',
      delete: 'Delete this conversation?',
      cancel: '--- Cancel ---'
    }
  },
  zh: {
    title: '🧹 Claude 对话管理器',
    subtitle: '简单轻量的 Claude Code 对话清理工具',
    menu: {
      list: '📋 查看所有对话',
      delete: '🗑️  删除对话',
      deleteCorrupted: '❌ 删除损坏对话（推荐）',
      stats: '📊 查看统计信息',
      health: '🏥 健康检查和修复',
      backup: '💾 创建备份',
      exit: '🚪 退出'
    },
    messages: {
      noConversations: '没有找到对话。',
      corruptedFound: '发现 {count} 个损坏的对话：',
      noCorrupted: '✓ 没有发现损坏的对话，你的对话很健康！',
      deletingCorrupted: '正在删除损坏的对话...',
      deletionCancelled: '删除已取消。',
      goodbye: '👋 再见！保持你的对话整洁！',
      backupCreated: 'ℹ 删除前已创建备份。',
      healthyConversations: '✓ 所有对话都很健康！',
      confirm: '你确定吗？',
      selectConversation: '选择要删除的对话：',
      selectedConversation: '已选择的对话：',
      pressEnter: '按回车继续...',
      reason: '原因：'
    },
    stats: {
      totalConversations: '对话总数：',
      totalSize: '总大小：',
      projects: '项目数：',
      corrupted: '损坏对话：',
      largestConversation: '最大对话：',
      oldestConversation: '最老对话：'
    },
    actions: {
      deleteAll: '删除全部 {count} 个损坏的对话？',
      delete: '删除这个对话？',
      cancel: '--- 取消 ---'
    }
  }
}

export class I18n {
  private static language: Language = 'en'

  static setLanguage(lang: Language) {
    this.language = lang
  }

  static getLanguage(): Language {
    return this.language
  }

  static t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.')
    let value: any = messages[this.language]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    if (typeof value !== 'string') {
      return key // fallback to key if not found
    }

    // Replace placeholders like {count}
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match: string, key: string) => 
        params[key]?.toString() || match
      )
    }
    
    return value
  }

  static detectLanguage(): Language {
    // Try to detect from system locale
    const locale = process.env.LANG || process.env.LC_ALL || process.env.LC_MESSAGES || 'en'
    return locale.startsWith('zh') ? 'zh' : 'en'
  }
}

// Auto-detect language on import
I18n.setLanguage(I18n.detectLanguage())