#!/usr/bin/env node

import { program } from "commander";
import { findImages, filterLargeImages, compressImage, excludeImages } from '../lib/index.mjs';

program
  .name('mycli')
  .description('A simple CLI tool')
  .version('1.0.0');

program
  .option('-r, --root <root>', '指定目录，批量处理图片')
  .option('-c, --compress <compress...>', '只处理指定图片（可多个）')
  .option('-e, --exclude <exclude...>', '排除图片（可多个）')
  .action(handleAction);

async function handleAction(options) {
  const { root, compress, exclude } = options;
  console.log("🚀 ~ handleAction ~ root, compress, exclude :", root, compress, exclude )
  let images = [];

  if (compress && compress.length > 0) {
    // 只处理指定图片
    images = compress;
  } else {
    // 遍历 root 或当前目录
    const searchDir = root || process.cwd();
    images = await findImages(searchDir);
    // 只保留大于2MB的图片
    images = await filterLargeImages(images, 2 * 1024 * 1024);
  }

  // 排除 exclude
  if (exclude && exclude.length > 0) {
    images = excludeImages(images, exclude);
  }

  // 压缩并替换
  for (const img of images) {
    await compressImage(img);
    console.log(`已压缩: ${img}`);
  }
}

program.parse(process.argv);