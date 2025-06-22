
# 👨‍💻 For developer

## Log switch

Open the Settings panel with the `Enable debug` option under th `Advance` group

## Debugging method

### compile ntfy

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

