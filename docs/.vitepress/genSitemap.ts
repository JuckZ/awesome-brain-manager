import { SitemapStream } from 'sitemap'
import { createWriteStream } from 'node:fs'
import { resolve } from 'node:path'
import { createContentLoader, type SiteConfig } from 'vitepress'

export async function genSitemap(config: SiteConfig) {
  const { outDir } = config;
  const sitemap = new SitemapStream({ hostname: 'https://laros.io/' })
  const pages = await createContentLoader('*.md').load()
  const writeStream = createWriteStream(resolve(outDir, 'sitemap.xml'))

  sitemap.pipe(writeStream)
  pages.forEach((page) => sitemap.write(
    page.url
      // Strip `index.html` from URL
      .replace(/index.html$/g, '')
      // Optional: if Markdown files are located in a subfolder
      .replace(/^\/docs/, '')
    ))
  sitemap.end()

  await new Promise((r) => writeStream.on('finish', r))
}