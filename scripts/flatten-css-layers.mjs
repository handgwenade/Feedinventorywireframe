import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const assetsDir = path.resolve('dist/assets');

function findMatchingBrace(css, openBraceIndex) {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = openBraceIndex; index < css.length; index += 1) {
    const char = css[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (char === '\\') {
      index += 1;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  throw new Error('Unable to find matching CSS brace.');
}

function flattenCssLayers(css) {
  let output = '';
  let index = 0;

  while (index < css.length) {
    const layerIndex = css.indexOf('@layer', index);

    if (layerIndex === -1) {
      output += css.slice(index);
      break;
    }

    output += css.slice(index, layerIndex);

    const openBraceIndex = css.indexOf('{', layerIndex);
    const semicolonIndex = css.indexOf(';', layerIndex);

    if (openBraceIndex === -1 || (semicolonIndex !== -1 && semicolonIndex < openBraceIndex)) {
      output += css.slice(layerIndex, semicolonIndex + 1);
      index = semicolonIndex + 1;
      continue;
    }

    const header = css.slice(layerIndex, openBraceIndex).trim();

    if (!/^@layer(?:\s+[\w.-]+(?:\s*,\s*[\w.-]+)*)?$/.test(header)) {
      output += css.slice(layerIndex, openBraceIndex + 1);
      index = openBraceIndex + 1;
      continue;
    }

    const closeBraceIndex = findMatchingBrace(css, openBraceIndex);
    output += flattenCssLayers(css.slice(openBraceIndex + 1, closeBraceIndex));
    index = closeBraceIndex + 1;
  }

  return output;
}

const files = await readdir(assetsDir);
const cssFiles = files.filter((file) => file.endsWith('.css'));

await Promise.all(cssFiles.map(async (file) => {
  const filePath = path.join(assetsDir, file);
  const css = await readFile(filePath, 'utf8');
  const flattenedCss = flattenCssLayers(css);

  if (flattenedCss !== css) {
    await writeFile(filePath, flattenedCss);
  }
}));
