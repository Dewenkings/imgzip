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

export async function compressImage(imagePath) {
  const tempPath = imagePath + '.tmp';

  const image = sharp(imagePath);
  const { format } = await image.metadata();

  if (format === 'jpeg' || format === 'jpg') {
    await image.jpeg({ quality: 70 }).toFile(tempPath);
  } else if (format === 'png') {
    await image.png({ quality: 70, compressionLevel: 9 }).toFile(tempPath);
  }

  // 用临时文件覆盖原文件
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
