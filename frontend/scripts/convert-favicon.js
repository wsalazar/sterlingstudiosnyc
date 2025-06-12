const sharp = require('sharp')
const path = require('path')

const inputPath = path.join(__dirname, '../assets/Logo_Final2022.jpg')
const outputPath = path.join(__dirname, '../public/images/favicon.png')

sharp(inputPath)
  .resize(32, 32)
  .png()
  .toFile(outputPath)
  .then(() => {
    console.log('Favicon created successfully!')
  })
  .catch((err) => {
    console.error('Error creating favicon:', err)
  })
