const sharp = require('sharp')
const path = require('path')

const inputPath = path.join(__dirname, '../public/images/favicon.png')
const outputPath = path.join(
  __dirname,
  '../public/images/favicon-optimized.png'
)

sharp(inputPath)
  .resize(32, 32)
  .png({ quality: 80, compressionLevel: 9 })
  .toFile(outputPath)
  .then(() => {
    console.log('Favicon optimized successfully!')
  })
  .catch((err) => {
    console.error('Error optimizing favicon:', err)
  })
