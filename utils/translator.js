import fs from "fs";
import path from "path";

const cache = {};

export const translate = (lang, key) => {
  if (!lang) lang = "en";
  if (!cache[lang]) {
    const filePath = path.join(process.cwd(), "locales", `${lang}.json`);
    if (fs.existsSync(filePath)) {
      cache[lang] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } else {
      cache[lang] = {};
    }
  }
  const keys = key.split(".");
  return keys.reduce((obj, k) => obj?.[k], cache[lang]) || key;
};