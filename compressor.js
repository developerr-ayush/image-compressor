const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Paths to the image folders
const inputFolder = path.join(__dirname, 'images');        // Folder containing images to compress
const outputFolder = path.join(__dirname, 'compressed');   // Folder to save compressed images

// Function to compress images
async function compressImage(inputPath, outputPath, quality) {
  try {
    await sharp(inputPath)
      .jpeg({ quality: quality }) // Compress to JPEG with the specified quality
      .toFile(outputPath);
    console.log(`Compressed and saved to: ${outputPath}`);
  } catch (err) {
    console.error(`Error compressing ${inputPath}:`, err);
  }
}

// Function to process all images in the input folder
async function compressAllImages(quality) {
  try {
    const files = fs.readdirSync(inputFolder); // Get all files in the input folder
    
    // Ensure the output folder exists
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder);
    }

    // Loop through each file
    for (const file of files) {
      const inputFilePath = path.join(inputFolder, file);
      const outputFilePath = path.join(outputFolder, file);

      // Compress the image and save to the output folder
      await compressImage(inputFilePath, outputFilePath, quality);
    }

    console.log('All images have been compressed.');
  } catch (err) {
    console.error("Error reading the input folder:", err);
  }
}

// Compression quality (adjust as needed)
const quality = 80;

// Start compressing all images
compressAllImages(quality);
