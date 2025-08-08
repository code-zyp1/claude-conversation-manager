#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { format } from 'date-fns'
import { ConversationManager } from './core/manager'
import { ConversationMetadata } from './core/types'
import { I18n } from './core/i18n'

const program = new Command()
const manager = new ConversationManager()

// Utility functions
function formatFileSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd HH:mm:ss')
}

function truncateText(text: string, maxLength: number = 80): string {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffHours < 1) {
    return 'now'
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else if (diffDays < 30) {
    return `${diffDays}d ago`
  } else {
    return format(date, 'MMM dd')
  }
}

// Commands
program
  .name('ccm')
  .description('Claude Conversation Manager - Manage your Claude Code conversation history')
  .version('1.0.0')

// List conversations
program
  .command('list')
  .description('List all conversations')
  .option('-d, --detailed', 'Show detailed information')
  .option('-p, --project <project>', 'Filter by project path')
  .option('-c, --corrupted', 'Show only corrupted conversations')
  .option('--limit <number>', 'Limit number of results', '50')
  .action(async (options) => {
    try {
      await manager.initialize()
      
      const searchOptions: any = {}
      if (options.project) searchOptions.project = options.project
      if (options.corrupted) searchOptions.corrupted = true
      
      let conversations = await manager.searchConversations(searchOptions)
      
      const limit = parseInt(options.limit)
      if (conversations.length > limit) {
        conversations = conversations.slice(0, limit)
        console.log(chalk.yellow(`Showing first ${limit} of ${conversations.length} conversations\\n`))
      }
      
      if (conversations.length === 0) {
        console.log(chalk.yellow('No conversations found.'))
        return
      }
      
      console.log(chalk.bold(`Found ${conversations.length} conversations:\\n`))
      
      if (options.detailed) {
        conversations.forEach((conv, index) => {
          console.log(`${index + 1}. ${chalk.bold(conv.id)}`)
          console.log(`   Project: ${chalk.cyan(conv.projectPath)}`)
          console.log(`   Directory: ${chalk.gray(conv.workingDirectory)}`)
          console.log(`   Summary: ${truncateText(conv.summary, 100)}`)
          console.log(`   Messages: ${conv.messageCount}, Size: ${formatFileSize(conv.fileSize)}`)
          console.log(`   Created: ${formatDate(conv.created)}, Modified: ${formatDate(conv.modified)}`)
          if (conv.gitBranch) console.log(`   Git Branch: ${chalk.green(conv.gitBranch)}`)
          if (conv.isCorrupted) console.log(`   ${chalk.red('⚠️  CORRUPTED:')} ${conv.corruptionReason}`)
          console.log('')
        })
      } else {
        // Claude -r style format
        console.log(chalk.bold('    Modified    Created     # Messages Git Branch     Summary'))
        console.log(chalk.bold('    Modified    Created     # Messages Git Branch     Summary'))
        
        conversations.forEach((conv, index) => {
          const modifiedTime = formatRelativeTime(conv.modified)
          const createdTime = formatRelativeTime(conv.created)
          const messageCount = conv.messageCount.toString().padStart(3)
          const gitBranch = (conv.gitBranch || 'unknown').padEnd(12)
          const summary = truncateText(conv.summary, 60)
          
          const line = `${index + 1}. ${modifiedTime.padEnd(10)} ${createdTime.padEnd(10)} ${messageCount} ${gitBranch} ${summary}`
          const projectInfo = `     Project: ${chalk.cyan(conv.projectPath)} | Directory: ${chalk.gray(conv.workingDirectory)}`
          
          if (conv.isCorrupted) {
            console.log(chalk.red('❯ ' + line))
            console.log(chalk.red(projectInfo))
          } else {
            console.log('  ' + line)
            console.log(chalk.gray(projectInfo))
          }
          console.log('')
        })
      }
      
    } catch (error) {
      console.error(chalk.red('Error listing conversations:'), error)
      process.exit(1)
    }
  })

// Search conversations  
program
  .command('search <keyword>')
  .description('Search conversations by keyword')
  .option('-p, --project <project>', 'Filter by project path')
  .option('--from <date>', 'Filter from date (YYYY-MM-DD)')
  .option('--to <date>', 'Filter to date (YYYY-MM-DD)')
  .option('--min-size <bytes>', 'Minimum file size in bytes', parseInt)
  .option('--max-size <bytes>', 'Maximum file size in bytes', parseInt)
  .action(async (keyword, options) => {
    try {
      await manager.initialize()
      
      const searchOptions: any = { keyword }
      if (options.project) searchOptions.project = options.project
      if (options.from) searchOptions.dateFrom = new Date(options.from)
      if (options.to) searchOptions.dateTo = new Date(options.to)
      if (options.minSize) searchOptions.minSize = options.minSize
      if (options.maxSize) searchOptions.maxSize = options.maxSize
      
      const conversations = await manager.searchConversations(searchOptions)
      
      if (conversations.length === 0) {
        console.log(chalk.yellow(`No conversations found matching "${keyword}".`))
        return
      }
      
      console.log(chalk.bold(`Found ${conversations.length} conversations matching "${keyword}":\\n`))
      
      // Claude -r style display
      console.log(chalk.bold('    Modified    Created     # Messages Git Branch     Summary'))
      console.log(chalk.bold('    Modified    Created     # Messages Git Branch     Summary'))
      
      conversations.forEach((conv, index) => {
        const modifiedTime = formatRelativeTime(conv.modified)
        const createdTime = formatRelativeTime(conv.created)
        const messageCount = conv.messageCount.toString().padStart(3)
        const gitBranch = (conv.gitBranch || 'unknown').padEnd(12)
        const summary = truncateText(conv.summary, 60)
        
        const line = `  ${index + 1}. ${modifiedTime.padEnd(10)} ${createdTime.padEnd(10)} ${messageCount} ${gitBranch} ${summary}`
        const projectInfo = `     Project: ${chalk.cyan(conv.projectPath)} | Directory: ${chalk.gray(conv.workingDirectory)}`
        
        if (conv.isCorrupted) {
          console.log(chalk.red('❯ ' + line))
        } else {
          console.log('  ' + line)
        }
        console.log(chalk.gray(projectInfo))
        console.log('')
      })
      
    } catch (error) {
      console.error(chalk.red('Error searching conversations:'), error)
      process.exit(1)
    }
  })

// Delete conversation
program
  .command('delete [conversationId]')
  .description('Delete conversation(s) - interactive selection if no ID provided')
  .option('--no-backup', 'Skip creating backup before deletion')
  .option('-f, --force', 'Force deletion without confirmation')
  .option('-c, --corrupted', 'Show only corrupted conversations for deletion')
  .action(async (conversationId, options) => {
    try {
      await manager.initialize()
      
      if (conversationId) {
        // Direct deletion by ID (original behavior)
        const conversation = await manager.getConversation(conversationId)
        if (!conversation) {
          console.log(chalk.red(`Conversation ${conversationId} not found.`))
          process.exit(1)
        }
        
        // Show conversation info and confirm
        console.log(`About to delete conversation:`)
        console.log(`  ID: ${chalk.bold(conversationId)}`)
        console.log(`  Project: ${chalk.cyan(conversation.metadata.projectPath)}`)
        console.log(`  Summary: ${truncateText(conversation.metadata.summary, 100)}`)
        console.log(`  Messages: ${conversation.metadata.messageCount}`)
        
        if (!options.force) {
          const { confirmed } = await inquirer.prompt([{
            type: 'confirm',
            name: 'confirmed',
            message: 'Are you sure you want to delete this conversation?',
            default: false
          }])
          
          if (!confirmed) {
            console.log('Deletion cancelled.')
            return
          }
        }
        
        const success = await manager.deleteConversation(conversationId, options.backup)
        
        if (success) {
          console.log(chalk.green(`✓ Conversation ${conversationId} deleted successfully.`))
          if (options.backup) {
            console.log(chalk.blue('ℹ Backup created before deletion.'))
          }
        } else {
          console.log(chalk.red(`✗ Failed to delete conversation ${conversationId}.`))
          process.exit(1)
        }
        
      } else {
        // Interactive deletion - show list for selection
        const searchOptions: any = {}
        if (options.corrupted) {
          searchOptions.corrupted = true
        }
        
        const conversations = await manager.searchConversations(searchOptions)
        
        if (conversations.length === 0) {
          console.log(chalk.yellow('No conversations found.'))
          return
        }
        
        // Create choices for inquirer
        const choices = conversations.map((conv, index) => {
          const modifiedTime = formatRelativeTime(conv.modified)
          const status = conv.isCorrupted ? chalk.red(' [CORRUPTED]') : ''
          const summary = truncateText(conv.summary, 60)
          const projectInfo = chalk.gray(`(${conv.projectPath})`)
          
          return {
            name: `${modifiedTime.padEnd(10)} ${conv.messageCount.toString().padStart(3)} messages ${summary}${status} ${projectInfo}`,
            value: conv.id,
            short: conv.id
          }
        })
        
        choices.push({ name: chalk.gray('--- Cancel ---'), value: 'cancel', short: 'cancel' })
        
        console.log(chalk.bold(`\\nSelect conversation(s) to delete:\\n`))
        
        const { selectedConversations } = await inquirer.prompt([{
          type: 'checkbox',
          name: 'selectedConversations',
          message: 'Select conversations to delete (use space to select, enter to confirm):',
          choices,
          validate: (input) => {
            if (input.length === 0) {
              return 'Please select at least one conversation or cancel.'
            }
            if (input.includes('cancel') && input.length > 1) {
              return 'Cannot select cancel with other options.'
            }
            return true
          }
        }])
        
        if (selectedConversations.includes('cancel') || selectedConversations.length === 0) {
          console.log('Deletion cancelled.')
          return
        }
        
        // Show selected conversations and confirm
        console.log(`\\n${chalk.bold('Selected conversations for deletion:')}`)
        for (const id of selectedConversations) {
          const conv = conversations.find(c => c.id === id)
          if (conv) {
            const status = conv.isCorrupted ? chalk.red(' [CORRUPTED]') : ''
            console.log(`  • ${chalk.cyan(conv.projectPath)} - ${truncateText(conv.summary, 50)}${status}`)
          }
        }
        
        if (!options.force) {
          const { finalConfirmed } = await inquirer.prompt([{
            type: 'confirm',
            name: 'finalConfirmed',
            message: `Delete ${selectedConversations.length} conversation(s)?`,
            default: false
          }])
          
          if (!finalConfirmed) {
            console.log('Deletion cancelled.')
            return
          }
        }
        
        // Delete selected conversations
        console.log(`\\n${chalk.yellow('Deleting conversations...')}`)
        const result = await manager.deleteConversations(selectedConversations, options.backup)
        
        if (result.deleted.length > 0) {
          console.log(chalk.green(`✓ Successfully deleted ${result.deleted.length} conversation(s).`))
          if (options.backup) {
            console.log(chalk.blue('ℹ Backup created before deletion.'))
          }
        }
        
        if (result.failed.length > 0) {
          console.log(chalk.red(`✗ Failed to delete ${result.failed.length} conversation(s):`))
          result.failed.forEach(id => console.log(`  - ${id}`))
        }
      }
      
    } catch (error) {
      console.error(chalk.red('Error deleting conversation:'), error)
      process.exit(1)
    }
  })

// Health check
program
  .command('health')
  .description('Check conversation health and detect issues')
  .option('--fix', 'Attempt to fix corrupted conversations')
  .action(async (options) => {
    try {
      await manager.initialize()
      
      console.log(chalk.bold('Checking conversation health...\\n'))
      
      const stats = await manager.getStorageStats()
      
      console.log(`Total conversations: ${chalk.bold(stats.totalConversations.toString())}`)
      console.log(`Total size: ${chalk.bold(formatFileSize(stats.totalSize))}`)
      console.log(`Projects: ${chalk.bold(stats.projectCount.toString())}`)
      console.log(`Corrupted conversations: ${stats.corruptedCount > 0 ? chalk.red(stats.corruptedCount.toString()) : chalk.green('0')}`)
      
      if (stats.largestConversation) {
        console.log(`Largest conversation: ${chalk.yellow(stats.largestConversation.id)} (${formatFileSize(stats.largestConversation.fileSize)})`)
      }
      
      if (stats.oldestConversation) {
        console.log(`Oldest conversation: ${formatDate(stats.oldestConversation.created)}`)
      }
      
      if (stats.corruptedCount > 0) {
        console.log(`\\n${chalk.red('⚠️  Found corrupted conversations!')}`)
        
        const corruptedConversations = await manager.searchConversations({ corrupted: true })
        corruptedConversations.forEach((conv, index) => {
          console.log(`  ${index + 1}. ${conv.id} - ${chalk.red(conv.corruptionReason)}`)
        })
        
        if (options.fix) {
          console.log(`\\n${chalk.yellow('Attempting to repair corrupted conversations...')}`)
          const result = await manager.repairCorruptedConversations()
          
          if (result.repaired.length > 0) {
            console.log(`${chalk.green('✓')} Repaired ${result.repaired.length} conversations:`)
            result.repaired.forEach(id => console.log(`  - ${id}`))
          }
          
          if (result.failed.length > 0) {
            console.log(`${chalk.red('✗')} Failed to repair ${result.failed.length} conversations:`)
            result.failed.forEach(id => console.log(`  - ${id}`))
          }
        } else {
          console.log(`\\nRun ${chalk.cyan('ccm health --fix')} to attempt repairs.`)
        }
      } else {
        console.log(`\\n${chalk.green('✓ All conversations are healthy!')}`)
      }
      
    } catch (error) {
      console.error(chalk.red('Error during health check:'), error)
      process.exit(1)
    }
  })

// Interactive mode
program
  .command('interactive')
  .alias('i')
  .description('Launch interactive conversation manager')
  .action(handleInteractiveMode)

async function handleInteractiveAction(action: string) {
  switch (action) {
    case 'delete-corrupted':
      const corruptedConversations = await manager.searchConversations({ corrupted: true })
      
      if (corruptedConversations.length === 0) {
        console.log(chalk.green(I18n.t('messages.noCorrupted')))
        return
      }
      
      console.log(`\n${chalk.bold.red(I18n.t('messages.corruptedFound', { count: corruptedConversations.length.toString() }))}\n`)
      
      corruptedConversations.forEach((conv, index) => {
        console.log(`${index + 1}. ${chalk.red(conv.id)}`)
        console.log(`   ${chalk.red(I18n.t('messages.reason'))} ${conv.corruptionReason}`)
        console.log(`   Project: ${chalk.cyan(conv.projectPath)} | Directory: ${chalk.gray(truncateText(conv.workingDirectory, 50))}`)
        console.log(`   Summary: ${truncateText(conv.summary, 60)}`)
        console.log('')
      })
      
      const { confirmDeleteCorrupted } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirmDeleteCorrupted',
        message: I18n.t('actions.deleteAll', { count: corruptedConversations.length.toString() }),
        default: false
      }])
      
      if (confirmDeleteCorrupted) {
        console.log(`\n${chalk.yellow(I18n.t('messages.deletingCorrupted'))}`)
        const corruptedIds = corruptedConversations.map(c => c.id)
        const result = await manager.deleteConversations(corruptedIds, true) // with backup
        
        if (result.deleted.length > 0) {
          console.log(chalk.green(`✓ Successfully deleted ${result.deleted.length} corrupted conversation(s).`))
          console.log(chalk.blue(I18n.t('messages.backupCreated')))
        }
        
        if (result.failed.length > 0) {
          console.log(chalk.red(`✗ Failed to delete ${result.failed.length} conversation(s):`))
          result.failed.forEach(id => console.log(`  - ${id}`))
        }
      } else {
        console.log(I18n.t('messages.deletionCancelled'))
      }
      break

    case 'list':
      const conversations = await manager.listConversations()
      if (conversations.length === 0) {
        console.log(chalk.yellow(I18n.t('messages.noConversations')))
        return
      }
      
      console.log(chalk.bold(`\\nFound ${conversations.length} conversations:\\n`))
      conversations.slice(0, 20).forEach((conv, index) => {
        const status = conv.isCorrupted ? chalk.red(' [CORRUPTED]') : ''
        console.log(`${index + 1}. ${conv.id}${status}`)
        console.log(`   ${truncateText(conv.summary, 80)}`)
        console.log(`   Project: ${chalk.cyan(conv.projectPath)} | Directory: ${chalk.gray(truncateText(conv.workingDirectory, 60))}`)
        console.log(`   ${conv.messageCount} messages - ${formatDate(conv.modified)}`)
        console.log('')
      })
      
      if (conversations.length > 20) {
        console.log(chalk.yellow(`... and ${conversations.length - 20} more. Use 'ccm list' for full output.`))
      }
      break
      
    case 'delete':
      const allConversations = await manager.listConversations()
      
      if (allConversations.length === 0) {
        console.log(chalk.yellow('No conversations found.'))
        return
      }
      
      // Create choices for deletion
      const deleteChoices = allConversations.slice(0, 20).map((conv) => {
        const modifiedTime = formatRelativeTime(conv.modified)
        const status = conv.isCorrupted ? chalk.red(' [CORRUPTED]') : ''
        const summary = truncateText(conv.summary, 50)
        const projectInfo = chalk.gray(`(${conv.projectPath})`)
        
        return {
          name: `${modifiedTime.padEnd(10)} ${conv.messageCount.toString().padStart(3)} msgs ${summary}${status} ${projectInfo}`,
          value: conv.id,
          short: conv.id
        }
      })
      
      deleteChoices.push({ name: chalk.gray(I18n.t('actions.cancel')), value: 'cancel', short: 'cancel' })
      
      const { selectedForDeletion } = await inquirer.prompt([{
        type: 'list',
        name: 'selectedForDeletion',
        message: I18n.t('messages.selectConversation'),
        choices: deleteChoices,
        pageSize: 15
      }])
      
      if (selectedForDeletion !== 'cancel') {
        const conversation = allConversations.find(c => c.id === selectedForDeletion)
        if (conversation) {
          console.log(`\\n${chalk.bold('Selected conversation:')}`)
          console.log(`  Project: ${chalk.cyan(conversation.projectPath)}`)
          console.log(`  Summary: ${truncateText(conversation.summary, 80)}`)
          console.log(`  Messages: ${conversation.messageCount}`)
          if (conversation.isCorrupted) {
            console.log(`  Status: ${chalk.red('CORRUPTED - ' + conversation.corruptionReason)}`)
          }
          
          const { confirmed } = await inquirer.prompt([{
            type: 'confirm',
            name: 'confirmed',
            message: 'Delete this conversation?',
            default: false
          }])
          
          if (confirmed) {
            const success = await manager.deleteConversation(selectedForDeletion)
            if (success) {
              console.log(chalk.green('✓ Conversation deleted successfully.'))
            } else {
              console.log(chalk.red('✗ Failed to delete conversation.'))
            }
          } else {
            console.log('Deletion cancelled.')
          }
        }
      } else {
        console.log('Deletion cancelled.')
      }
      break
      
    case 'health':
      const stats = await manager.getStorageStats()
      console.log(`\\n${chalk.bold('Storage Statistics:')}`)
      console.log(`Conversations: ${stats.totalConversations}`)
      console.log(`Total size: ${formatFileSize(stats.totalSize)}`)
      console.log(`Projects: ${stats.projectCount}`)
      console.log(`Corrupted: ${stats.corruptedCount > 0 ? chalk.red(stats.corruptedCount.toString()) : chalk.green('0')}`)
      break
      
    case 'backup':
      console.log(chalk.yellow('Creating backup...'))
      const backup = await manager.createBackup()
      console.log(chalk.green(`✓ Backup created: ${backup.filename}`))
      console.log(`Conversations: ${backup.conversationCount}`)
      console.log(`Size: ${formatFileSize(backup.size)}`)
      break
      
    case 'stats':
      const storageStats = await manager.getStorageStats()
      console.log(`\\n${chalk.bold('Detailed Storage Statistics:')}`)
      console.log(`Total conversations: ${storageStats.totalConversations}`)
      console.log(`Total size: ${formatFileSize(storageStats.totalSize)}`)
      console.log(`Number of projects: ${storageStats.projectCount}`)
      console.log(`Corrupted conversations: ${storageStats.corruptedCount}`)
      
      if (storageStats.largestConversation) {
        console.log(`\\nLargest conversation:`)
        console.log(`  ID: ${storageStats.largestConversation.id}`)
        console.log(`  Size: ${formatFileSize(storageStats.largestConversation.fileSize)}`)
        console.log(`  Messages: ${storageStats.largestConversation.messageCount}`)
      }
      break
  }
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught exception:'), error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled rejection at:'), promise, 'reason:', reason)
  process.exit(1)
})

// Parse command line arguments
program.parse()

// Launch interactive mode if no command provided
if (!process.argv.slice(2).length) {
  console.log(chalk.blue('🚀 Starting Claude Conversation Manager in interactive mode...\n'))
  // Launch interactive mode directly
  handleInteractiveMode()
}

async function handleInteractiveMode() {
  try {
    await manager.initialize()
    
    while (true) {
      console.clear()
      console.log(chalk.bold.blue(I18n.t('title') + '\n'))
      console.log(chalk.gray(I18n.t('subtitle') + '\n'))
      
      const { action } = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: I18n.t('menu.list'), value: 'list' },
          { name: I18n.t('menu.delete'), value: 'delete' },
          { name: I18n.t('menu.deleteCorrupted'), value: 'delete-corrupted' },
          { name: I18n.t('menu.stats'), value: 'stats' },
          { name: I18n.t('menu.health'), value: 'health' },
          { name: I18n.t('menu.backup'), value: 'backup' },
          { name: `🌐 Language/语言 (${I18n.getLanguage().toUpperCase()})`, value: 'language' },
          { name: I18n.t('menu.exit'), value: 'exit' }
        ]
      }])
      
      if (action === 'exit') {
        console.log(chalk.green(I18n.t('messages.goodbye')))
        process.exit(0)
      }
      
      if (action === 'language') {
        await handleLanguageChange()
        continue
      }
      
      await handleInteractiveAction(action)
      
      // Wait for user input before continuing
      await inquirer.prompt([{
        type: 'input',
        name: 'continue',
        message: chalk.gray(I18n.t('messages.pressEnter'))
      }])
    }
    
  } catch (error) {
    console.error(chalk.red('Error in interactive mode:'), error)
    process.exit(1)
  }
}

async function handleLanguageChange() {
  const { language } = await inquirer.prompt([{
    type: 'list',
    name: 'language',
    message: 'Select language / 选择语言:',
    choices: [
      { name: 'English', value: 'en' },
      { name: '中文', value: 'zh' },
      { name: '← Back / 返回', value: 'back' }
    ]
  }])
  
  if (language !== 'back') {
    I18n.setLanguage(language)
    console.log(chalk.green(`Language changed to ${language === 'en' ? 'English' : '中文'}`))
  }
}