# 🧹 Claude Conversation Manager (CCM)

Simple & lightweight conversation cleaner for Claude Code / 简单轻量的 Claude Code 对话清理工具

## ✨ Features / 特点

- **🚀 Simple to use**: Run `npm run dev` to enter interactive mode / 运行 `npm run dev` 直接进入交互界面
- **🛡️ Safe cleanup**: Automatic backup before deletion / 删除前自动创建备份  
- **🔍 Smart detection**: Auto-detect corrupted conversation files / 自动检测损坏的对话文件
- **📊 Claude -r style**: Familiar display format / 熟悉的显示格式
- **⚡ Lightweight**: Focus on core cleanup, avoid complexity / 专注核心清理功能，避免复杂化
- **🌐 Multi-language**: English & Chinese support / 支持中英文界面

## 🚀 Quick Start / 快速开始

### Install Dependencies / 安装依赖
```bash
cd claude-conversation-manager
npm install
```

### Launch Interactive Mode / 启动交互界面
```bash
npm run dev
```
or / 或者
```bash
npm run clean
```

## 📋 Features / 功能说明

### 📋 List All Conversations / 查看所有对话
- Browse all your Claude Code conversations / 浏览所有对话记录
- Show project path, creation date, message count / 显示项目路径、创建日期、消息数量
- Highlight corrupted conversations in red / 用红色标记损坏的对话

### 🗑️ Delete Conversation / 删除对话
- Select and delete individual conversations / 选择并删除单个对话
- Safe interactive selection / 安全的交互式选择
- Automatic backup before deletion / 删除前自动备份

### ❌ Delete Corrupted Conversations / 删除损坏对话 (推荐优先使用)
- **Most useful feature for fixing Claude Code scroll issues** / **修复Claude Code滚动问题的最有用功能**
- One-click cleanup of all corrupted conversations / 一键清理所有损坏对话
- Shows corruption reason for each file / 显示每个文件的损坏原因
- Automatic backup before batch deletion / 批量删除前自动备份

### 📊 View Statistics / 查看统计信息
- Total conversations and storage usage / 对话总数和存储使用情况
- Number of projects and corrupted files / 项目数量和损坏文件数
- Largest conversation file identification / 识别最大的对话文件

### 🏥 Health Check & Repair / 健康检查和修复
- Scan all conversations for corruption / 扫描所有对话是否损坏
- Attempt automatic repair of corrupted files / 尝试自动修复损坏文件
- Generate comprehensive health report / 生成综合健康报告

### 💾 Create Backup / 创建备份
- Manual backup creation / 手动创建备份
- Backup location and restore instructions / 备份位置和恢复说明

### 🌐 Language/语言
- Switch between English and Chinese / 中英文界面切换
- Auto-detect system language / 自动检测系统语言

## 💾 Backup System / 备份系统详解

### How Backup Works / 备份工作原理

CCM uses a comprehensive backup system to ensure your data safety:
CCM 使用全面的备份系统确保数据安全：

1. **Automatic Backups / 自动备份**
   - Created before every delete operation / 每次删除操作前自动创建
   - Stored in `backups/` folder inside the tool directory / 存储在工具目录的 `backups/` 文件夹中
   - Filename format: `backup-YYYY-MM-DD-HH-mm-ss.tar.gz` / 文件名格式

2. **Manual Backups / 手动备份**
   - Use "💾 Create backup" option in interactive menu / 使用交互菜单中的"💾 创建备份"选项
   - Backs up entire conversation directory / 备份整个对话目录
   - Includes metadata and conversation files / 包含元数据和对话文件

3. **Backup Contents / 备份内容**
   - All `.jsonl` conversation files / 所有 `.jsonl` 对话文件
   - Directory structure preserved / 保持目录结构
   - Project organization maintained / 维持项目组织结构

### How to Restore from Backup / 如何从备份恢复

1. **Locate backup file / 找到备份文件**
   ```bash
   ls claude-conversation-manager/backups/
   ```

2. **Manual restore / 手动恢复**
   ```bash
   # Extract backup to temporary location
   tar -xzf backup-2025-01-08-14-30-25.tar.gz -C /tmp/restore
   
   # Copy files back to Claude directory
   cp -r /tmp/restore/* ~/.claude/projects/
   ```

3. **Verify restoration / 验证恢复**
   - Run CCM and check conversation list / 运行 CCM 并检查对话列表
   - Use health check to verify file integrity / 使用健康检查验证文件完整性

### Backup Location / 备份位置
- **Tool backups**: `claude-conversation-manager/backups/` / 工具备份
- **Size**: Backups are compressed, typically 10-50% of original size / 备份已压缩，通常为原始大小的10-50%
- **Retention**: Keep important backups permanently, others can be deleted after verification / 重要备份永久保存，其他可在验证后删除

## 🎯 Problem Solving / 解决的问题

### Primary Issue / 主要问题
**Claude Code conversation scroll bug** - Can't scroll up to view conversation history
**Claude Code对话滚动错误** - 无法向上滚动查看对话历史记录

**Root Cause / 根本原因**: Oversized context continuation messages (>50KB) cause TUI rendering issues
**根本原因**: 超大的上下文延续消息（>50KB）导致TUI渲染问题

**Solution / 解决方案**: Use "❌ Delete corrupted conversations" to remove problematic files
**解决方案**: 使用"❌ 删除损坏对话"移除有问题的文件

### Other Issues / 其他问题
- Large conversation files consuming storage / 大型对话文件消耗存储空间
- Corrupted conversation data / 损坏的对话数据
- Difficulty managing conversation history / 难以管理对话历史记录

## 📁 File Locations / 文件位置

### Claude Code Storage / Claude Code 存储位置
- **Windows**: `C:\Users\[username]\.claude\projects\`
- **macOS/Linux**: `~/.claude/projects/`
- **File format**: `.jsonl` (JSON Lines)
- **Structure**: Each project has encoded directory name / 每个项目都有编码的目录名

### Project Directory Encoding / 项目目录编码
- Path encoding: `C:\Users\user\project` → `C--Users-user-project`
- Each conversation: `[uuid].jsonl`
- Contains message history and metadata / 包含消息历史和元数据

## 🔧 Advanced Usage / 高级用法

### Command Line Interface / 命令行界面
```bash
# View all commands / 查看所有命令
npx ts-node src/cli.ts --help

# List conversations directly / 直接列出对话
npx ts-node src/cli.ts list

# Delete corrupted conversations / 删除损坏对话
npx ts-node src/cli.ts delete --corrupted

# Health check / 健康检查
npx ts-node src/cli.ts health --fix

# Create backup / 创建备份
npx ts-node src/cli.ts interactive
```

### Build and Install Globally / 构建并全局安装
```bash
npm run build
npm link  # Global installation
ccm       # Run from anywhere
```

## 🛡️ Safety & Security / 安全性

### Data Protection / 数据保护
- **Automatic backups** before any destructive operation / 任何破坏性操作前自动备份
- **No system modification** - only operates on conversation files / 不修改系统 - 仅操作对话文件
- **Read-only analysis** for corruption detection / 损坏检测的只读分析
- **Confirmation prompts** prevent accidental deletion / 确认提示防止意外删除

### Best Practices / 最佳实践
- **Close Claude Code** before running CCM / 运行CCM前关闭Claude Code
- **Create manual backup** before major cleanup / 大规模清理前创建手动备份
- **Test with small operations** first / 先测试小操作
- **Keep important conversations** backed up separately / 重要对话单独备份

## 💡 Usage Recommendations / 使用建议

### Regular Maintenance / 定期维护
1. **Weekly health check** / 每周健康检查
   - Run "🏥 Health check & repair"
   - Address any corrupted files immediately / 立即处理任何损坏文件

2. **Monthly cleanup** / 每月清理
   - Review statistics for storage usage / 检查存储使用统计
   - Clean up old or unnecessary conversations / 清理旧的或不必要的对话

3. **Before major updates** / 重大更新前
   - Create full backup / 创建完整备份
   - Run comprehensive health check / 运行综合健康检查

### Troubleshooting Priority / 故障排除优先级
1. **Can't scroll in Claude Code** → Use "❌ Delete corrupted conversations"
2. **Claude Code feels slow** → Check statistics, clean large files
3. **Error messages** → Run health check with repair option
4. **Storage space low** → Review and clean old conversations

## 🔍 Troubleshooting / 故障排除

### Common Issues / 常见问题

1. **Permission errors / 权限错误**
   ```bash
   # Make sure Claude Code is closed / 确保Claude Code已关闭
   # Run with appropriate permissions / 使用适当权限运行
   ```

2. **Cannot find conversations / 找不到对话**
   - Verify Claude Code installation / 验证Claude Code安装
   - Check default directory location / 检查默认目录位置
   - Run as same user as Claude Code / 以与Claude Code相同的用户运行

3. **Backup restore failed / 备份恢复失败**
   - Check backup file integrity / 检查备份文件完整性
   - Verify target directory permissions / 验证目标目录权限
   - Use manual extraction method / 使用手动提取方法

### Getting Help / 获取帮助
- Check health report for specific issues / 检查健康报告中的具体问题  
- Review backup files if data seems missing / 如果数据似乎丢失，检查备份文件
- Use list function to verify conversation restoration / 使用列表功能验证对话恢复

## 🎯 Success Criteria / 成功标准

**Target**: 5-minute setup, solve 90% of Claude Code conversation cleanup needs
**目标**: 5分钟设置，解决90%的Claude Code对话清理需求

### Measurement / 衡量标准
- ✅ **Setup time**: Under 5 minutes from download to first use / 设置时间：从下载到首次使用不到5分钟
- ✅ **Problem resolution**: Fix scroll issues in 1 click / 问题解决：一键修复滚动问题  
- ✅ **Safety**: Zero data loss with automatic backups / 安全性：自动备份零数据丢失
- ✅ **Usability**: Intuitive interface, no documentation required / 可用性：直观界面，无需文档

---

**Made with ❤️ for Claude Code users worldwide** / **为全球Claude Code用户用心制作**