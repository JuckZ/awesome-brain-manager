
# 👨‍💻 开发者须知

## 日志开关

打开设置面板，在 `Advance` 分组下有 `Enable debug` 选项

## 调试方法

### 编译ntfy

```powershell
$env:GOOS = "js"
$env:GOARCH = "wasm"
go build -o src/utils/ntfy.wasm ntfy.go
```

```sh
GOOS=js GOARCH=wasm go build -o src/utils/ntfy.wasm ntfy.go
```

### Windows(cmd.exe)

```cmd
set "OUTDIR=path_to_this_plugin_in_your_obsidian_vault" && pnpm run dev
```

### Windows(Powershell)

```powershell
($env:OUTDIR = "path_to_this_plugin_in_your_obsidian_vault") -and (pnpm run dev)
```

eg.

```powershell
($env:OUTDIR="../../../one-blog/posts/.obsidian/plugins/awesome-brain-manager") -and (pnpm run dev)
```

### Linux, macOS(Bash)

```bash
OUTDIR="path_to_this_plugin_in_your_obsidian_vault" pnpm run dev
```

eg.

```bash
OUTDIR="../../../one-blog/posts/.obsidian/plugins/awesome-brain-manager" pnpm run dev
```
<!-- 📌🔥⭐🌟⛳🎯📲🎬🔎📩📬🗂️📆🌏🌄⚡ -->

