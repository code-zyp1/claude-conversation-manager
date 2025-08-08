// Claude Code Conversation File Format Types

export interface ConversationSummary {
  type: 'summary'
  summary: string
  leafUuid: string
}

export interface ConversationMessage {
  parentUuid?: string | null
  isSidechain?: boolean
  userType?: string
  cwd?: string
  sessionId: string
  version?: string
  gitBranch?: string
  type: 'user' | 'assistant'
  message: {
    role: 'user' | 'assistant'
    content: Array<{ type: string; text: string }> | string
    model?: string
    usage?: {
      input_tokens: number
      output_tokens: number
      cache_creation_input_tokens?: number
      cache_read_input_tokens?: number
    }
  }
  isMeta?: boolean
  uuid: string
  timestamp: string
}

export interface ConversationMetadata {
  id: string                    // File UUID
  projectPath: string          // Project folder name (e.g., "ccmonitor")
  workingDirectory: string     // Full working directory path
  summary: string              // Conversation summary
  messageCount: number         // Total messages
  fileSize: number            // File size in bytes
  created: Date               // First message timestamp
  modified: Date              // Last message timestamp
  isCorrupted: boolean        // Health status
  corruptionReason?: string   // Why it's considered corrupted
  gitBranch?: string          // Git branch if available
}

export interface ConversationFile {
  filePath: string
  metadata: ConversationMetadata
  messages: ConversationMessage[]
  summary?: ConversationSummary
}

export interface ManagerConfig {
  claudeConfigPath: string    // ~/.claude directory
  projectsPath: string        // ~/.claude/projects
  backupPath: string         // Backup directory
  maxBackups: number         // Max backup files to keep
  autoBackup: boolean        // Auto backup before operations
}

export interface SearchOptions {
  keyword?: string
  project?: string
  dateFrom?: Date
  dateTo?: Date
  minSize?: number
  maxSize?: number
  corrupted?: boolean
  hasGitBranch?: boolean
}

export interface ExportOptions {
  format: 'markdown' | 'json' | 'text'
  includeMetadata: boolean
  outputPath?: string
}

export interface BackupInfo {
  timestamp: Date
  filename: string
  size: number
  conversationCount: number
  projectPaths: string[]
}