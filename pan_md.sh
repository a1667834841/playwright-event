#!/bin/bash

# 获取docs/pan目录下最新的文件
latest_file=$(ls -t docs/pan | head -n 1)

# 提取日期 (假设文件名格式为 aliyun-pan-YYYY-MM-DD.md)
date=$(echo $latest_file | grep -o '[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}')

# 构建新的README内容
content=$'# 网盘资源\n\n## 阿里云盘\n\n'
content+=$'### '"$date"$'\n\n'
content+=$(cat "docs/pan/$latest_file")

# 将新内容写入README.md
echo "$content" > README.md