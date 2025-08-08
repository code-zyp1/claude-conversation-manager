# Claude Conversation Manager - 使用指南

## 🚀 快速开始

### 安装依赖
```bash
cd claude-conversation-manager
npm install
```

### 运行开发版本
```bash
npm run dev list
```

### 构建并安装
```bash
npm run build
npm link  # 全局安装，可以直接使用 ccm 命令
```

## 📋 命令示例

### 查看所有对话
```bash
# 基本列表
ccm list

# 详细信息
ccm list --detailed

# 只显示损坏的对话
ccm list --corrupted

# 按项目过滤
ccm list --project "ccmonitor"

# 限制显示数量
ccm list --limit 10
```

### 搜索对话
```bash
# 按关键词搜索
ccm search "monitor"

# 按项目和日期搜索
ccm search "typescript" --project "ccmonitor" --from "2025-01-01"

# 按文件大小搜索
ccm search "large" --min-size 1000000  # 大于1MB的对话
```

### 删除对话
```bash
# 交互式删除 - 从列表中选择（推荐）
ccm delete

# 只显示损坏的对话供删除
ccm delete --corrupted

# 批量删除 - 多选模式
ccm delete

# 直接删除指定ID（原始方式）
ccm delete 72e3fc34-adaf-4553-9865-ab40d9b6eb9a

# 强制删除，不确认
ccm delete 72e3fc34-adaf-4553-9865-ab40d9b6eb9a --force

# 删除时不创建备份
ccm delete --no-backup
```

### 健康检查
```bash
# 检查所有对话的健康状态
ccm health

# 检查并自动修复损坏的对话
ccm health --fix
```

### 交互模式
```bash
# 启动交互式界面（推荐新手使用）
ccm interactive
# 或简写
ccm i
```

## 🛠️ 解决你的问题

### 删除损坏的对话
```bash
# 1. 交互式删除损坏对话（推荐）
ccm delete --corrupted

# 2. 查看损坏对话列表
ccm list --corrupted

# 3. 尝试修复损坏对话
ccm health --fix

# 4. 从交互模式删除
ccm interactive
```

### 快速清理项目对话
```bash
# 交互式删除（推荐）
ccm delete

# 查看项目的所有对话
ccm list --project "ccmonitor"

# 搜索并删除
ccm search "关键词" 
# 然后使用: ccm delete
```

### 备份重要对话
```bash
# 在删除前，先创建备份
ccm interactive
# 选择 "Create backup"
```

## 💡 实用技巧

1. **找到最大的对话文件**：
   ```bash
   ccm health
   ```
   会显示最大的对话文件信息

2. **批量清理**：
   使用交互模式 (`ccm i`) 比较安全，会逐个确认

3. **搜索特定内容**：
   ```bash
   ccm search "typescript" --project "ccmonitor"
   ```

4. **检查存储使用情况**：
   ```bash
   ccm health
   ```
   显示总大小、对话数量等统计信息

## 🚨 注意事项

- 删除操作默认会创建备份，除非使用 `--no-backup`
- 修复损坏对话可能会丢失部分数据，建议先备份
- 交互模式对新手更友好，有确认步骤
- 所有操作都是安全的，不会影响Claude Code本身