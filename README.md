# devin-img-zip

A command-line tool for batch image compression, supporting jpg, jpeg, png, and webp formats, powered by [sharp](https://github.com/lovell/sharp).

## Installation

Install globally for CLI usage:

```bash
npm install -g devin-img-zip
```

Or locally in your project:

```bash
npm install --save-dev devin-img-zip
```

## Usage

### CLI Usage

```bash
imgzip [options]
```

#### Options

| Option              | Description                                 | Example                        |
|---------------------|---------------------------------------------|---------------------------------|
| -r, --root <dir>    | Specify the root directory to search images  | `-r ./assets`                   |
| -c, --compress <...>| Only process images with these file names   | `-c a.jpg b.png`                |
| -e, --exclude <...> | Exclude images with these file names        | `-e logo.png`                   |
| -q, --quality <num> | Compression quality (1-100, default: 80)    | `-q 90`                         |
| -s, --size-limit <size> | Minimum image size to process (default: 2MB) | `-s 1.5MB` or `-s 2048KB` |

- If `--compress` is not specified, only images larger than the size limit will be processed.
- Size limit supports units: MB (default), KB, B. Examples: `2MB`, `2048KB`, `2.5MB`
- Compression will overwrite the original files.
- Supported formats: jpg, jpeg, png, webp.

### Example

Compress all images larger than 1.5MB in the `./assets` directory with quality 80:

```bash
imgzip -r ./assets -s 1.5MB -q 80
```

Compress all images larger than 1024KB in the current directory:

```bash
imgzip -s 1024KB
```

Compress only `a.jpg` and `b.png` in the current directory with quality 90:

```bash
imgzip -c a.jpg b.png -q 90
```

## License

ISC
