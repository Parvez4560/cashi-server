import fs from "fs";
import path from "path";

export function translate(lang, key) {
  try {
    const filePath = path.join(process.cwd(), "locales", `${lang}.json`);
    let rawData = fs.existsSync(filePath) 
      ? fs.readFileSync(filePath, "utf-8") 
      : fs.readFileSync(path.join(process.cwd(), "locales", "en.json"), "utf-8"); // ডিফল্ট ইংরেজি
    
    const translations = JSON.parse(rawData);
    
    // ডট নোটেশন হ্যান্ডেল করার জন্য (যেমন: "errors.invalid_request")
    return key.split(".").reduce((obj, k) => (obj ? obj[k] : null), translations) || key;
  } catch (err) {
    return key;
  }
}