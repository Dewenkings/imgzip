import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export async function findImages(dir) {
  const files = await fs.promises.readdir(dir);
  const imagePaths = [];
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = await fs.promises.stat(filePath);
    if (stats.isDirectory()) {
      imagePaths.push(...(await findImages(filePath)));
    } else if (isImage(file)) {
      imagePaths.push(filePath);
    }
  }
  return imagePaths;
}

export async function filterLargeImages(imagePaths, sizeLimit) {
  const largeImages = [];
  for (const imagePath of imagePaths) {
    const stats = await fs.promises.stat(imagePath);
    if (stats.size > sizeLimit) {
      largeImages.push(imagePath);
    }
  }
  return largeImages;
}

export async function compressImage(imagePath, quality = 80) {
  const tempPath = imagePath + '.tmp';

  const image = sharp(imagePath);
  const { format } = await image.metadata();

  if (format === 'jpeg' || format === 'jpg') {
    await image.jpeg({ quality }).toFile(tempPath);
  } else if (format === 'png') {
    await image.png({ quality, compressionLevel: 9 }).toFile(tempPath);
  }

  // Replace original file with temporary file
  await fs.promises.rename(tempPath, imagePath);
}

export function excludeImages(imagePaths, excludeList) {
  return imagePaths.filter((imagePath) => {
    const fileName = path.basename(imagePath);
    return !excludeList.includes(fileName);
  });
}

function isImage(fileName) {
  const lowerCaseFileName = fileName.toLowerCase();
  return (
    lowerCaseFileName.endsWith(".png") ||
    lowerCaseFileName.endsWith(".jpg") ||
    lowerCaseFileName.endsWith(".jpeg") ||
    lowerCaseFileName.endsWith(".webp")
  );
}


// Helper function to parse size strings
export function parseSize(sizeStr) {
  if (!sizeStr) return 2 * 1024 * 1024; // Default 2MB
  
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(MB|KB|B)?$/i);
  if (!match) {
    throw new Error(`Invalid size format: ${sizeStr}. Please use format like: 2MB, 2048KB, 2.5MB`);
  }
  
  const value = parseFloat(match[1]);
  const unit = (match[2] || 'MB').toUpperCase();
  
  switch (unit) {
    case 'MB':
      return value * 1024 * 1024;
    case 'KB':
      return value * 1024;
    case 'B':
      return value;
    default:
      throw new Error(`Unsupported unit: ${unit}`);
  }
}