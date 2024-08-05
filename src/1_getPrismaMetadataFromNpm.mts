import fs from 'fs'

const prismaClientData = await fetch('https://registry.npmjs.org/@prisma/client')
const prismaClientJson = await prismaClientData.json()
fs.writeFileSync(
  '../artifacts/meta/1-prisma-client-metadata.json',
  JSON.stringify(prismaClientJson, null, 2),
)

const prismaEnginesData = await fetch('https://registry.npmjs.org/@prisma/engines')
const prismaEnginesJson = await prismaEnginesData.json()
fs.writeFileSync(
  '../artifacts/meta/1-prisma-engines-metadata.json',
  JSON.stringify(prismaEnginesJson, null, 2),
)

export {}
