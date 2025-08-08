import * as fs from 'fs-extra'
import * as path from 'path'
import * as os from 'os'
import { ConversationFile, ConversationMetadata, ManagerConfig, SearchOptions, BackupInfo } from './types'
import { ConversationParser } from './parser'

export class ConversationManager {
  private config: ManagerConfig

  constructor(customConfig?: Partial<ManagerConfig>) {
    const homeDir = os.homedir()
    const claudeDir = path.join(homeDir, '.claude')
    
    this.config = {
      claudeConfigPath: claudeDir,
      projectsPath: path.join(claudeDir, 'projects'),
      backupPath: path.join(claudeDir, 'backups'),
      maxBackups: 10,
      autoBackup: true,
      ...customConfig
    }
  }

  /**
   * Initialize manager and ensure directories exist
   */
  async initialize(): Promise<void> {
    await fs.ensureDir(this.config.backupPath)
    
    if (!await fs.pathExists(this.config.projectsPath)) {
      throw new Error(`Claude Code projects directory not found: ${this.config.projectsPath}`)
    }
  }

  /**
   * List all conversations with metadata
   */
  async listConversations(): Promise<ConversationMetadata[]> {
    const conversations: ConversationMetadata[] = []
    
    // Scan all project directories
    const projectDirs = await fs.readdir(this.config.projectsPath)
    
    for (const projectDir of projectDirs) {
      const projectPath = path.join(this.config.projectsPath, projectDir)
      const stat = await fs.stat(projectPath)
      
      if (!stat.isDirectory()) continue
      
      // Scan conversation files in project directory
      const files = await fs.readdir(projectPath)
      const jsonlFiles = files.filter(f => f.endsWith('.jsonl'))
      
      for (const file of jsonlFiles) {
        const filePath = path.join(projectPath, file)
        const conversation = await ConversationParser.parseFile(filePath)
        
        if (conversation) {
          conversations.push(conversation.metadata)
        }
      }
    }
    
    // Sort by modification date (newest first)
    return conversations.sort((a, b) => b.modified.getTime() - a.modified.getTime())
  }

  /**
   * Search conversations by criteria
   */
  async searchConversations(options: SearchOptions): Promise<ConversationMetadata[]> {
    const allConversations = await this.listConversations()
    
    return allConversations.filter(conv => {
      // Keyword search in summary
      if (options.keyword) {
        const keyword = options.keyword.toLowerCase()
        if (!conv.summary.toLowerCase().includes(keyword)) {
          return false
        }
      }
      
      // Project path filter
      if (options.project) {
        const project = options.project.toLowerCase()
        if (!conv.projectPath.toLowerCase().includes(project)) {
          return false
        }
      }
      
      // Date range filter
      if (options.dateFrom && conv.modified < options.dateFrom) {
        return false
      }
      if (options.dateTo && conv.modified > options.dateTo) {
        return false
      }
      
      // Size filter
      if (options.minSize && conv.fileSize < options.minSize) {
        return false
      }
      if (options.maxSize && conv.fileSize > options.maxSize) {
        return false
      }
      
      // Corruption filter
      if (options.corrupted !== undefined && conv.isCorrupted !== options.corrupted) {
        return false
      }
      
      // Git branch filter
      if (options.hasGitBranch !== undefined) {
        const hasGit = !!conv.gitBranch
        if (hasGit !== options.hasGitBranch) {
          return false
        }
      }
      
      return true
    })
  }

  /**
   * Get conversation details by ID
   */
  async getConversation(conversationId: string): Promise<ConversationFile | null> {
    const filePath = await this.findConversationFile(conversationId)
    if (!filePath) return null
    
    return ConversationParser.parseFile(filePath)
  }

  /**
   * Delete a conversation by ID
   */
  async deleteConversation(conversationId: string, createBackup: boolean = true): Promise<boolean> {
    const filePath = await this.findConversationFile(conversationId)
    if (!filePath) return false
    
    if (createBackup && this.config.autoBackup) {
      await this.backupConversation(conversationId)
    }
    
    await fs.remove(filePath)
    return true
  }

  /**
   * Delete multiple conversations
   */
  async deleteConversations(conversationIds: string[], createBackup: boolean = true): Promise<{ deleted: string[], failed: string[] }> {
    if (createBackup && this.config.autoBackup) {
      await this.createBackup()
    }
    
    const deleted: string[] = []
    const failed: string[] = []
    
    for (const id of conversationIds) {
      const success = await this.deleteConversation(id, false) // Skip individual backup since we did bulk backup
      if (success) {
        deleted.push(id)
      } else {
        failed.push(id)
      }
    }
    
    return { deleted, failed }
  }

  /**
   * Delete all conversations for a project
   */
  async deleteProjectConversations(projectPath: string, createBackup: boolean = true): Promise<number> {
    const conversations = await this.searchConversations({ project: projectPath })
    const ids = conversations.map(c => c.id)
    
    const result = await this.deleteConversations(ids, createBackup)
    return result.deleted.length
  }

  /**
   * Repair corrupted conversations
   */
  async repairCorruptedConversations(): Promise<{ repaired: string[], failed: string[] }> {
    const corruptedConversations = await this.searchConversations({ corrupted: true })
    const repaired: string[] = []
    const failed: string[] = []
    
    for (const conv of corruptedConversations) {
      const filePath = await this.findConversationFile(conv.id)
      if (filePath) {
        const result = await ConversationParser.repairFile(filePath)
        if (result.success) {
          repaired.push(conv.id)
        } else {
          failed.push(conv.id)
        }
      }
    }
    
    return { repaired, failed }
  }

  /**
   * Find conversation file path by ID
   */
  private async findConversationFile(conversationId: string): Promise<string | null> {
    const projectDirs = await fs.readdir(this.config.projectsPath)
    
    for (const projectDir of projectDirs) {
      const filePath = path.join(this.config.projectsPath, projectDir, `${conversationId}.jsonl`)
      if (await fs.pathExists(filePath)) {
        return filePath
      }
    }
    
    return null
  }

  /**
   * Create backup of specific conversation
   */
  private async backupConversation(conversationId: string): Promise<string | null> {
    const filePath = await this.findConversationFile(conversationId)
    if (!filePath) return null
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFileName = `conversation-${conversationId}-${timestamp}.jsonl`
    const backupPath = path.join(this.config.backupPath, backupFileName)
    
    await fs.copy(filePath, backupPath)
    return backupPath
  }

  /**
   * Create full backup of all conversations
   */
  async createBackup(): Promise<BackupInfo> {
    const timestamp = new Date()
    const dateStr = timestamp.toISOString().replace(/[:.]/g, '-')
    const backupDir = path.join(this.config.backupPath, `backup-${dateStr}`)
    
    await fs.ensureDir(backupDir)
    await fs.copy(this.config.projectsPath, backupDir)
    
    // Calculate backup info
    const conversations = await this.listConversations()
    const projectPaths = [...new Set(conversations.map(c => c.projectPath))]
    const totalSize = conversations.reduce((sum, c) => sum + c.fileSize, 0)
    
    const backupInfo: BackupInfo = {
      timestamp,
      filename: `backup-${dateStr}`,
      size: totalSize,
      conversationCount: conversations.length,
      projectPaths
    }
    
    // Save backup metadata
    await fs.writeJson(path.join(backupDir, 'backup-info.json'), backupInfo, { spaces: 2 })
    
    // Clean up old backups if needed
    await this.cleanupOldBackups()
    
    return backupInfo
  }

  /**
   * List available backups
   */
  async listBackups(): Promise<BackupInfo[]> {
    const backups: BackupInfo[] = []
    
    if (!await fs.pathExists(this.config.backupPath)) {
      return backups
    }
    
    const entries = await fs.readdir(this.config.backupPath)
    
    for (const entry of entries) {
      const backupDir = path.join(this.config.backupPath, entry)
      const infoFile = path.join(backupDir, 'backup-info.json')
      
      if (await fs.pathExists(infoFile)) {
        try {
          const info = await fs.readJson(infoFile)
          info.timestamp = new Date(info.timestamp)
          backups.push(info)
        } catch (error) {
          // Skip corrupted backup info files
        }
      }
    }
    
    return backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Clean up old backups beyond the configured limit
   */
  private async cleanupOldBackups(): Promise<void> {
    const backups = await this.listBackups()
    
    if (backups.length <= this.config.maxBackups) {
      return
    }
    
    const toDelete = backups.slice(this.config.maxBackups)
    
    for (const backup of toDelete) {
      const backupDir = path.join(this.config.backupPath, backup.filename)
      await fs.remove(backupDir)
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalConversations: number
    totalSize: number
    projectCount: number
    corruptedCount: number
    largestConversation: ConversationMetadata | null
    oldestConversation: ConversationMetadata | null
  }> {
    const conversations = await this.listConversations()
    const projectPaths = new Set(conversations.map(c => c.projectPath))
    const corruptedCount = conversations.filter(c => c.isCorrupted).length
    
    const sortedBySize = [...conversations].sort((a, b) => b.fileSize - a.fileSize)
    const sortedByDate = [...conversations].sort((a, b) => a.created.getTime() - b.created.getTime())
    
    return {
      totalConversations: conversations.length,
      totalSize: conversations.reduce((sum, c) => sum + c.fileSize, 0),
      projectCount: projectPaths.size,
      corruptedCount,
      largestConversation: sortedBySize[0] || null,
      oldestConversation: sortedByDate[0] || null
    }
  }
}