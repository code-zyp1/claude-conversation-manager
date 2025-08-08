# Claude Conversation Manager

> [中文版本](#中文版本) | [English Version](#english-version)

A professional CLI tool for managing Claude Code conversation history with advanced parsing and internationalization support.

## English Version

### Overview

Claude Conversation Manager (CCM) is a command-line utility designed to help developers manage, clean, and optimize their Claude Code conversation history. It addresses common issues such as scroll lag, corrupted conversation files, and storage optimization.

### Key Features

- **Conversation Management**: List, analyze, and manage Claude Code conversations
- **Corruption Detection**: Automatically detect and repair corrupted conversation files
- **Safe Cleanup**: Remove problematic conversations with automatic backup
- **Storage Optimization**: Analyze and optimize conversation storage usage
- **Health Monitoring**: Comprehensive conversation health checks and repairs
- **Backup System**: Automatic and manual backup creation with restore capabilities
- **Multi-language Support**: English and Chinese interface support
- **TypeScript**: Full TypeScript support with type definitions

### Installation

#### NPM Installation (Recommended)

```bash
# Install globally
npm install -g claude-conversation-manager

# Run the tool
ccm
# or
ccm interactive
```

#### Development Setup

```bash
git clone https://github.com/code-zyp1/claude-conversation-manager.git
cd claude-conversation-manager
npm install
npm run dev
```

### Usage

#### Interactive Mode

```bash
ccm interactive
```

Provides a full interactive interface with menu-driven options for all operations.

#### Command Line Interface

```bash
# View all available commands
ccm --help

# List all conversations
ccm list

# Delete corrupted conversations
ccm delete --corrupted

# Run health check with automatic repair
ccm health --fix

# Create manual backup
ccm backup
```

### Core Functions

#### 1. List Conversations
Browse all Claude Code conversations with detailed information including project path, creation date, and message count. Corrupted conversations are clearly highlighted.

#### 2. Delete Corrupted Conversations
**Primary use case**: Fix Claude Code scroll issues by removing oversized context continuation messages (>50KB) that cause TUI rendering problems.

#### 3. Health Check & Repair
Comprehensive scan of all conversation files with automatic repair attempts for recoverable corruption.

#### 4. Statistics & Analysis
- Total conversation count and storage usage
- Project distribution and largest files identification
- Performance impact analysis

#### 5. Backup Management
- Automatic backups before destructive operations
- Manual backup creation with compression
- Restore instructions and verification

### File Locations

#### Claude Code Storage
- **Windows**: `C:\Users\[username]\.claude\projects\`
- **macOS/Linux**: `~/.claude/projects/`
- **Format**: `.jsonl` (JSON Lines)
- **Structure**: Encoded directory names with UUID-based conversation files

#### Backup Storage
- **Location**: `./backups/` within tool directory
- **Format**: Compressed tar.gz archives
- **Naming**: `backup-YYYY-MM-DD-HH-mm-ss.tar.gz`

### Troubleshooting

#### Common Issues

1. **Claude Code Scroll Problems**
   - **Solution**: Use "Delete corrupted conversations" feature
   - **Cause**: Oversized conversation files (>50KB)

2. **Permission Errors**
   - **Solution**: Ensure Claude Code is closed before running
   - **Alternative**: Run with appropriate system permissions

3. **Cannot Find Conversations**
   - **Solution**: Verify Claude Code installation and user account
   - **Check**: Default directory locations and permissions

### Safety & Security

- **Data Protection**: Automatic backups before any destructive operation
- **Non-invasive**: Only operates on conversation files, no system modifications
- **Verification**: Confirmation prompts prevent accidental operations
- **Transparency**: Clear reporting of all operations and changes

### Best Practices

1. **Close Claude Code** before running cleanup operations
2. **Create manual backups** before major cleanup sessions
3. **Run health checks** weekly to prevent issues
4. **Monitor statistics** monthly for storage optimization

### Requirements

- **Node.js**: Version 16.0.0 or higher
- **Operating System**: Windows, macOS, or Linux
- **Claude Code**: Any version with standard conversation storage

---

## 中文版本

### 概述

Claude 对话管理器（CCM）是一个专业的命令行工具，帮助开发者管理、清理和优化 Claude Code 对话历史记录。解决滚动延迟、损坏的对话文件和存储优化等常见问题。

### 主要功能

- **对话管理**：列出、分析和管理 Claude Code 对话
- **损坏检测**：自动检测和修复损坏的对话文件
- **安全清理**：自动备份后删除有问题的对话
- **存储优化**：分析和优化对话存储使用
- **健康监控**：全面的对话健康检查和修复
- **备份系统**：自动和手动备份创建及恢复功能
- **多语言支持**：支持英文和中文界面
- **TypeScript**：完整的 TypeScript 支持和类型定义

### 安装方法

#### NPM 安装（推荐）

```bash
# 全局安装
npm install -g claude-conversation-manager

# 运行工具
ccm
# 或者
ccm interactive
```

#### 开发环境设置

```bash
git clone https://github.com/code-zyp1/claude-conversation-manager.git
cd claude-conversation-manager
npm install
npm run dev
```

### 使用方法

#### 交互模式

```bash
ccm interactive
```

提供完整的交互界面，通过菜单驱动的选项执行所有操作。

#### 命令行界面

```bash
# 查看所有可用命令
ccm --help

# 列出所有对话
ccm list

# 删除损坏的对话
ccm delete --corrupted

# 运行健康检查并自动修复
ccm health --fix

# 创建手动备份
ccm backup
```

### 核心功能

#### 1. 对话列表
浏览所有 Claude Code 对话，包含项目路径、创建日期和消息数量等详细信息。损坏的对话会被明确标记。

#### 2. 删除损坏对话
**主要用途**：通过删除超大的上下文延续消息（>50KB）来修复 Claude Code 滚动问题，这些消息会导致 TUI 渲染问题。

#### 3. 健康检查和修复
全面扫描所有对话文件，对可恢复的损坏进行自动修复尝试。

#### 4. 统计和分析
- 对话总数和存储使用情况
- 项目分布和最大文件识别
- 性能影响分析

#### 5. 备份管理
- 破坏性操作前自动备份
- 压缩的手动备份创建
- 恢复说明和验证

### 文件位置

#### Claude Code 存储
- **Windows**: `C:\Users\[username]\.claude\projects\`
- **macOS/Linux**: `~/.claude/projects/`
- **格式**: `.jsonl`（JSON Lines）
- **结构**: 编码的目录名和基于 UUID 的对话文件

#### 备份存储
- **位置**: 工具目录内的 `./backups/`
- **格式**: 压缩的 tar.gz 档案
- **命名**: `backup-YYYY-MM-DD-HH-mm-ss.tar.gz`

### 故障排除

#### 常见问题

1. **Claude Code 滚动问题**
   - **解决方案**：使用"删除损坏对话"功能
   - **原因**：超大对话文件（>50KB）

2. **权限错误**
   - **解决方案**：运行前确保 Claude Code 已关闭
   - **替代方案**：使用适当的系统权限运行

3. **找不到对话**
   - **解决方案**：验证 Claude Code 安装和用户账户
   - **检查**：默认目录位置和权限

### 安全性

- **数据保护**：任何破坏性操作前自动备份
- **非侵入性**：仅操作对话文件，不修改系统
- **验证机制**：确认提示防止意外操作
- **透明度**：清晰报告所有操作和更改

### 最佳实践

1. **关闭 Claude Code** 后再运行清理操作
2. **创建手动备份** 在主要清理会话之前
3. **运行健康检查** 每周一次以预防问题
4. **监控统计** 每月一次进行存储优化

### 系统要求

- **Node.js**: 16.0.0 或更高版本
- **操作系统**: Windows、macOS 或 Linux
- **Claude Code**: 任何使用标准对话存储的版本