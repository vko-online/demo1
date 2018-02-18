import fs from 'fs'
import path from 'path'

export const deleteFile = Key => {
  console.log('deleteFile', Key)
  return new Promise((resolve, reject) => {
    fs.unlink(path.join(__dirname, '../uploads', Key), (err) => {
      if (err) reject(err)
      resolve(Key)
    })
  })
}

export const uploadFile = ({ file, options }) =>
  new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, '../uploads', options.name)
    const readFileStream = fs.createReadStream(file)
    const writeFileStream = fs.createWriteStream(filePath)

    readFileStream.on('error', err => {
      reject(err)
    })
    writeFileStream.on('error', err => {
      reject(err)
    })

    readFileStream.pipe(writeFileStream)

    writeFileStream.on('finish', () => {
      const result = {
        name: options.name,
        type: options.type,
        size: options.size,
        path: filePath
      }
      resolve(result)
    })
  })

export const getFileUrl = key =>
  `http://localhost:8080/uploads/${key}`
