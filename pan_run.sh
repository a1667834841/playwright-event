# 默认参数
DEFAULT_URL="https://www.qileso.com"
DEFAULT_TIMES=10


# 获取命令行参数
URL=${1:-$DEFAULT_URL}        # 如果没有提供第一个参数，使用默认URL
TIMES=${2:-$DEFAULT_TIMES}    # 如果没有提供第二个参数，使用默认次数

# 执行 Node 脚本并传递参数
yarn pan 

echo "爬取完成！URL: $URL, 次数: $TIMES"