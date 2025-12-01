/**
 * Ensures the SharedInboxPlugin is present in ios/App/App/capacitor.config.json.
 * Run after `npx cap copy ios` or use `npm run cap:copy:ios`.
 */
import fs from "fs";
import path from "path";

const configPath = path.join(process.cwd(), "ios", "App", "App", "capacitor.config.json");
const pluginName = "SharedInboxPlugin";

try {
  const raw = fs.readFileSync(configPath, "utf-8");
  const json = JSON.parse(raw);

  if (!Array.isArray(json.packageClassList)) {
    json.packageClassList = [];
  }

  if (!json.packageClassList.includes(pluginName)) {
    json.packageClassList.push(pluginName);
    fs.writeFileSync(configPath, JSON.stringify(json, null, 2));
    console.log(`✅ Added ${pluginName} to packageClassList in ${configPath}`);
  } else {
    console.log(`✅ ${pluginName} already present in ${configPath}`);
  }
} catch (err) {
  console.error(`❌ Failed to patch ${configPath}`, err);
  process.exit(1);
}
