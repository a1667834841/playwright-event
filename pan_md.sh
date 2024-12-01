#!/bin/bash

# 接收JSON数据作为参数
json_data=$1

# 创建resource/pan目录（如果不存在）
mkdir -p resource/pan

# 生成当前日期作为文件名
date_str=$(date +%Y%m%d)
file_path="resource/pan/${date_str}.md"

# 从JSON提取数据
title=$(echo $json_data | jq -r '.title')
type=$(echo $json_data | jq -r '.type')
urls=$(echo $json_data | jq -r '.urls[] | "- [资源链接](" + .url + ")"')

# 生成markdown内容
cat << EOF > "$file_path"
# ${title}

| 类型 | 链接 |
|------|------|
| ${type} | ${urls} |
EOF

echo "已生成文件：${file_path}"