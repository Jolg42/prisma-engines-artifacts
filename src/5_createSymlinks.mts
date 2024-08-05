import fs from 'fs'
import path from 'path'

const data = fs.readFileSync(
  '../artifacts/meta/2-prisma-versions-with-commit-sha.json',
  'utf-8',
)
const json = JSON.parse(data)

process.chdir('../artifacts')

for (const version in json) {
  const commitSha = json[version]
  console.log(`\n\n${version}: ${commitSha}`)

  try {
    await fs.symlinkSync(`../all_commits/${commitSha}`, `./versions/${version}`, 'dir')
  } catch (e) {
    console.log(e)
  }
}

export {}
