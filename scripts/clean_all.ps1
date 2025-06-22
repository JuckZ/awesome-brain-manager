# 删除所有 node_modules 文件夹
Get-ChildItem -Path . -Include "node_modules" -Directory -Recurse | Remove-Item -Recurse -Force

# 删除所有 .turbo 文件夹
Get-ChildItem -Path . -Include ".turbo" -Directory -Recurse | Remove-Item -Recurse -Force

# 删除所有 dist 文件夹
Get-ChildItem -Path . -Include "dist" -Directory -Recurse | Remove-Item -Recurse -Force