import fs from 'fs'
import semver from 'semver'

const pairs: Record<string, string> = {}

const prismaClientData = fs.readFileSync(
  '../artifacts/meta/1-prisma-client-metadata.json',
  'utf-8',
)
const prismaClientJson = JSON.parse(prismaClientData)

// Check @prisma/engines-version for v2 and v3
for (const version of Object.keys(prismaClientJson.versions)) {
  const pkg = prismaClientJson.versions[version]
  const enginesVersion = pkg.devDependencies?.['@prisma/engines']
  if (!semver.satisfies(version, '>=2.10 <=3')) {
    continue
  }

  if (!enginesVersion) {
    console.log({ pkg })
    throw new Error(`No enginesVersion found for ${version}`)
  }

  const matched = /(\.|\-)(\w{30,})$/.exec(enginesVersion)
  if (!matched) {
    throw new Error(`v2 or v3 No commitSha match for ${version}`)
  }

  pairs[version] = matched[2]
}

const prismaEnginesData = fs.readFileSync(
  '../artifacts/meta/1-prisma-engines-metadata.json',
  'utf-8',
)
const prismaEnginesJson = JSON.parse(prismaEnginesData)

// Check @prisma/engines for versions > v3
for (const version of Object.keys(prismaEnginesJson.versions)) {
  console.log(version)

  const pkg = prismaEnginesJson.versions[version]
  const enginesVersion =
    pkg.devDependencies?.['@prisma/engines-version'] ||
    pkg.dependencies?.['@prisma/engines-version'] ||
    ''

  if (!semver.satisfies(version, '>3')) {
    continue
  }

  if (!enginesVersion) {
    throw new Error(`No enginesVersion found for ${version}`)
  }

  const matched = /\.(\w{30,})$/.exec(enginesVersion)
  if (!matched) {
    throw new Error(`>v3 No commitSha match for ${version}`)
  }

  pairs[version] = matched[1]
}

console.table(pairs)
fs.writeFileSync(
  '../artifacts/meta/2-prisma-versions-with-commit-sha.json',
  JSON.stringify(pairs, null, 2),
)

export {}
