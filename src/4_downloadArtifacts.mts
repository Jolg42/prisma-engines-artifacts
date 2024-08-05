import pMap from 'p-map'
import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'
import { finished } from 'stream/promises'

const downloadFile = async ({ url, fileName, dir }) => {
  if (!fs.existsSync(dir)) {
    await fs.mkdirSync(dir, { recursive: true })
  }

  const destination = path.resolve(dir, fileName)
  console.log(`Downloading ${url} to ${destination}`)

  if (fs.existsSync(destination)) {
    console.log(`Skipping ${destination} - already exists.`)
    return
  }

  const res = await fetch(url)
  const fileStream = fs.createWriteStream(destination, { flags: 'wx' })
  await finished(Readable.fromWeb(res.body).pipe(fileStream))
}

const data = fs.readFileSync('../artifacts/meta/3-prisma-artifacts.json', 'utf-8')
const json = JSON.parse(data)
console.log(`Total artifacts: ${json.length}`)

const mapper = async (artifact) => {
  const { url, dir, name, versions } = artifact
  // fetch
  try {
    await downloadFile({
      url,
      fileName: name,
      dir: `../artifacts/${dir}`,
    })
  } catch (e) {
    console.log(`Error downloading ${url} - versions: ${versions}`)
    throw e
  }
}

const result = await pMap(json, mapper, { concurrency: 150 })
console.log(result)

export {}
