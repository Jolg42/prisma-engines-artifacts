import fs from 'fs'
import path from 'path'

const data = fs.readFileSync(
  '../artifacts/meta/2-prisma-versions-with-commit-sha.json',
  'utf-8',
)
const json = JSON.parse(data)

// const baseUrl = 'https://prisma-builds.s3-eu-west-1.amazonaws.com/'
const baseUrl = 'https://list-binaries.prisma-orm.workers.dev/'
// https://prisma-builds.s3-eu-west-1.amazonaws.com/?delimiter=/&prefix=all_commits/4b759ce11aa29f91524e07e18b85f69a2d529992/

const items: any = []

for (const version in json) {
  const commitSha = json[version]
  console.log(`\n\n${version}: ${commitSha}`)

  const url = `${baseUrl}?delimiter=/&prefix=all_commits/${commitSha}/`
  const commitData = await fetch(url).then((res) => res.json())
  const delimitedPrefixes: string[] = commitData.delimitedPrefixes || []

  for (const delimitedPrefix of delimitedPrefixes) {
    const engineTargetUrl = `${baseUrl}?delimiter=/&prefix=${delimitedPrefix}`
    const engineTargetData = await fetch(engineTargetUrl).then((res) => res.json())

    // https://list-binaries.prisma-orm.workers.dev/?delimiter=/&prefix=all_commits/61023c35d2c8762f66f09bc4183d2f630b541d08/darwin-arm64/
    const objects: {
      uploaded: string
      size: number
      key: string
    }[] = engineTargetData.objects || []
    for (const o of objects) {
      const fullname = o.key
      // ignore size = 0 (i.e. .finished files)
      if (o.size === 0) continue

      const artifactUrl = `https://binaries.prisma.sh/${fullname}`
      const findDuplicate = items.find((i) => i.url === artifactUrl)
      if (findDuplicate) {
        findDuplicate.prismaVersions.push(version)
      } else {
        const name = path.basename(fullname)
        items.push({
          name,
          isDir: false,
          // https://binaries.prisma.sh/all_commits/2452cc6313d52b8b9a96999ac0e974d0aedf88db/darwin-arm64/prisma-fmt.gz
          url: artifactUrl,
          size: o.size,
          date: o.uploaded,
          dir: path.dirname(fullname),
          prismaVersions: [version],
        })
      }
    }
  }
}

fs.writeFileSync(
  '../artifacts/meta/3-prisma-artifacts.json',
  JSON.stringify(items, null, 2),
)

export {}
