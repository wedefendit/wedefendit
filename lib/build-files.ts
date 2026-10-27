import fs from "fs";
import path from "path";

const JSON_FILE_EXTENSION = ".json";

export function readJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function publicFileExists(src: string): boolean {
  return fs.existsSync(path.join(process.cwd(), "public", src));
}

export function isJsonFile(fileName: string): boolean {
  return fileName.endsWith(JSON_FILE_EXTENSION);
}

export function jsonFileStem(fileName: string): string {
  return fileName.slice(0, -JSON_FILE_EXTENSION.length);
}

export function jsonFileName(stem: string): string {
  return `${stem}${JSON_FILE_EXTENSION}`;
}
