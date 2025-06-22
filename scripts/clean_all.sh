# 删除所有 node_modules 文件夹
find . -name "node_modules" -type d -prune -exec rm -rf {} +

# 删除所有 .turbo 文件夹
find . -name ".turbo" -type d -prune -exec rm -rf {} +

# 删除所有 dist 文件夹
find . -name "dist" -type d -prune -exec rm -rf {} +