[API Documentation](../index.md) / obsidian

# Module: obsidian

```js
//获取插件列表
Object.values(app.plugins.manifests).map(p=>p.id).sort((a,b)=>a.localeCompare(b)).join('\n')
```