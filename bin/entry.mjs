#!/usr/bin/env node

import { program } from "commander";
import { findImages, filterLargeImages, compressImage, excludeImages } from '../lib/index.mjs';
import fs from 'fs';
import path from 'path';

program
  .name('mycli')
  .description('A simple CLI tool')
  .version('1.0.0');

program
  .option('-r, --root <root>', 'Specify directory, batch process images')
  .option('-c, --compress <compress...>', 'Only process specified images (multiple allowed)')
  .option('-e, --exclude <exclude...>', 'Exclude images (multiple allowed)')
  .option('-q, --quality <quality>', 'Compression quality (1-100, default: 80)', parseInt, 80)
  .action(handleAction);

async function handleAction(options) {
  const { root, compress, exclude, quality } = options;
  console.log("root, compress, exclude :", root, compress, exclude )
  let images = [];
  const searchDir = root || process.cwd();

  if (compress && compress.length > 0) {
    // Recursively find all images under searchDir
    const allImages = await findImages(searchDir);
    // Map: image name => full path
    const nameToPath = {};
    for (const imgPath of allImages) {
      const fileName = path.basename(imgPath);
      if (!nameToPath[fileName]) {
        nameToPath[fileName] = [];
      }
      nameToPath[fileName].push(imgPath);
    }
    // Find matching images
    images = [];
    for (const name of compress) {
      if (nameToPath[name] && nameToPath[name].length > 0) {
        images.push(...nameToPath[name]);
      } else {
        console.warn(`No image found with name: ${name}`);
      }
    }
    if (images.length === 0) {
      console.warn('No images to process.');
      return;
    }
  } else {
    // Traverse root or current directory
    images = await findImages(searchDir);
    // Only keep images larger than 2MB
    images = await filterLargeImages(images, 2 * 1024 * 1024);
  }

  // Exclude images
  if (exclude && exclude.length > 0) {
    images = excludeImages(images, exclude);
  }

  // Compress and replace
  for (const img of images) {
    // Get size before compression
    let beforeSize = 0;
    try {
      beforeSize = fs.statSync(img).size;
    } catch (e) {
      console.error(`Failed to read file size: ${img}`, e);
      continue;
    }
    console.log(`Image: ${img}`);
    console.log(`Size before compression: ${(beforeSize / 1024).toFixed(2)} KB`);
    await compressImage(img, quality);
    // Get size after compression
    let afterSize = 0;
    try {
      afterSize = fs.statSync(img).size;
    } catch (e) {
      console.error(`Failed to read file size after compression: ${img}`, e);
      continue;
    }
    console.log(`Size after compression: ${(afterSize / 1024).toFixed(2)} KB`);
    console.log(`Compressed: ${img}`);
  }
}

program.parse(process.argv);