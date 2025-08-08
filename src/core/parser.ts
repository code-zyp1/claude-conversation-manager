import * as fs from 'fs-extra'
import * as path from 'path'
import { ConversationFile, ConversationMessage, ConversationSummary, ConversationMetadata } from './types'

export class ConversationParser {
  /**
   * Parse a conversation file from disk
   */
  static async parseFile(filePath: string): Promise<ConversationFile | null> {
    try {
      if (!await fs.pathExists(filePath)) {
        return null
      }

      const content = await fs.readFile(filePath, 'utf-8')
      const lines = content.trim().split('\n').filter(line => line.trim())
      
      if (lines.length === 0) {
        return null
      }

      const messages: ConversationMessage[] = []
      let summary: ConversationSummary | undefined

      // Parse each line as JSON
      for (const line of lines) {
        try {
          const data = JSON.parse(line)
          
          if (data.type === 'summary') {
            summary = data as ConversationSummary
          } else if (data.type === 'user' || data.type === 'assistant') {
            messages.push(data as ConversationMessage)
          }
        } catch (parseError) {
          // Skip corrupted lines but continue parsing
          console.warn(`Skipping corrupted line in ${filePath}:`, line.substring(0, 100))
        }
      }

      const metadata = await this.extractMetadata(filePath, messages, summary)
      
      return {
        filePath,
        metadata,
        messages,
        summary
      }
    } catch (error) {
      console.error(`Failed to parse conversation file ${filePath}:`, error)
      return null
    }
  }

  /**
   * Extract metadata from conversation file
   */
  private static async extractMetadata(
    filePath: string, 
    messages: ConversationMessage[], 
    summary?: ConversationSummary
  ): Promise<ConversationMetadata> {
    const stats = await fs.stat(filePath)
    const fileName = path.basename(filePath, '.jsonl')
    
    // Extract project path from file path
    // e.g. ~/.claude/projects/C--Users-user-Desktop-project/ -> C:\Users\user\Desktop\project
    const projectMatch = filePath.match(/projects[\/\\](.+?)[\/\\][^\/\\]+\.jsonl$/)
    let projectPath = 'Unknown'
    let workingDirectory = 'Unknown'
    
    if (projectMatch) {
      const encodedPath = projectMatch[1]
      // Decode the path: C--Users-user-Desktop-project -> C:\Users\user\Desktop\project
      workingDirectory = encodedPath.replace(/--/g, ':\\').replace(/-/g, '\\')
      
      // Extract just the folder name for display
      const pathParts = workingDirectory.split('\\')
      projectPath = pathParts[pathParts.length - 1] || 'Unknown'
    }

    // Find timestamps
    const timestamps = messages
      .map(m => new Date(m.timestamp))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime())

    const created = timestamps[0] || stats.birthtime
    const modified = timestamps[timestamps.length - 1] || stats.mtime

    // Detect corruption
    const corruptionCheck = this.checkCorruption(filePath, messages, stats.size)

    // Extract git branch from first message if available
    const gitBranch = messages[0]?.gitBranch

    return {
      id: fileName,
      projectPath,
      workingDirectory,
      summary: summary?.summary || this.generateAutoSummary(messages),
      messageCount: messages.length,
      fileSize: stats.size,
      created,
      modified,
      isCorrupted: corruptionCheck.isCorrupted,
      corruptionReason: corruptionCheck.reason,
      gitBranch
    }
  }

  /**
   * Check if a conversation file is corrupted
   */
  private static checkCorruption(filePath: string, messages: ConversationMessage[], fileSize: number): {
    isCorrupted: boolean
    reason?: string
  } {
    // Check for extremely large files (>5MB)
    if (fileSize > 5 * 1024 * 1024) {
      return { isCorrupted: true, reason: 'File too large (>5MB)' }
    }

    // Check for extremely large single messages (>50KB)
    for (const message of messages) {
      const messageSize = JSON.stringify(message).length
      if (messageSize > 50 * 1024) {
        return { isCorrupted: true, reason: 'Contains oversized message (>50KB)' }
      }
    }

    // Check for missing essential fields
    if (messages.length === 0) {
      return { isCorrupted: true, reason: 'No valid messages found' }
    }

    // Check for invalid timestamps
    const invalidTimestamps = messages.filter(m => !m.timestamp || isNaN(new Date(m.timestamp).getTime()))
    if (invalidTimestamps.length > messages.length * 0.5) {
      return { isCorrupted: true, reason: 'Too many invalid timestamps' }
    }

    // Check for missing UUIDs
    const missingUuids = messages.filter(m => !m.uuid)
    if (missingUuids.length > 0) {
      return { isCorrupted: true, reason: 'Missing message UUIDs' }
    }

    return { isCorrupted: false }
  }

  /**
   * Validate and potentially repair a conversation file
   */
  static async repairFile(filePath: string): Promise<{ success: boolean; message: string }> {
    try {
      const conversation = await this.parseFile(filePath)
      if (!conversation) {
        return { success: false, message: 'Could not parse conversation file' }
      }

      if (!conversation.metadata.isCorrupted) {
        return { success: true, message: 'File is not corrupted' }
      }

      // Attempt basic repairs
      const repairedMessages = conversation.messages.filter(m => {
        // Remove messages with invalid structure
        return m.uuid && m.timestamp && m.type && m.message
      })

      if (repairedMessages.length === 0) {
        return { success: false, message: 'No valid messages found for repair' }
      }

      // Create minimal conversation structure if needed
      if (!conversation.summary) {
        conversation.summary = {
          type: 'summary',
          summary: 'Repaired conversation',
          leafUuid: repairedMessages[0]?.uuid || 'unknown'
        }
      }

      // Write repaired file
      await this.writeConversationFile(filePath, conversation.summary, repairedMessages)
      
      return { success: true, message: `Repaired conversation with ${repairedMessages.length} messages` }
    } catch (error) {
      return { success: false, message: `Repair failed: ${error}` }
    }
  }

  /**
   * Generate automatic summary from messages (mimics Claude Code behavior)
   */
  private static generateAutoSummary(messages: ConversationMessage[]): string {
    // Find first user message with substantial content
    const firstUserMessage = messages.find(m => 
      m.type === 'user' && 
      m.message?.content && 
      typeof m.message.content === 'object' &&
      Array.isArray(m.message.content)
    )
    
    if (firstUserMessage && Array.isArray(firstUserMessage.message.content)) {
      const textContent = firstUserMessage.message.content
        .filter(c => c.type === 'text')
        .map(c => c.text)
        .join(' ')
      
      // Truncate and clean up text like Claude Code does
      const cleaned = textContent.trim().replace(/\s+/g, ' ')
      if (cleaned.length > 80) {
        return cleaned.substring(0, 77) + '...'
      }
      return cleaned
    }
    
    // Fallback for other message formats
    if (firstUserMessage) {
      const content = firstUserMessage.message?.content
      if (typeof content === 'string') {
        return content.length > 80 ? content.substring(0, 77) + '...' : content
      }
    }
    
    return 'No summary available'
  }

  /**
   * Write conversation data back to file
   */
  static async writeConversationFile(
    filePath: string,
    summary: ConversationSummary,
    messages: ConversationMessage[]
  ): Promise<void> {
    const lines = [
      JSON.stringify(summary),
      ...messages.map(msg => JSON.stringify(msg))
    ]
    
    await fs.writeFile(filePath, lines.join('\n') + '\n', 'utf-8')
  }
}