const fs = require("fs");
const path = require("path");

const autolinkFile = path.join(
  "node_modules",
  "expo-modules-autolinking",
  "scripts",
  "android",
  "autolinking_implementation.gradle"
);

fs.readFile(autolinkFile, "utf8", (err, data) => {
  if (err) {
    console.error("❌ Could not read autolinking file:", err);
    return;
  }

  const patchedData = data.replace(
    /project\.plugins\.apply\(modulePlugin\.id\)/g,
    `if (
        modulePlugin.id == 'expo-module-gradle-plugin' &&
        project.name == 'app'
    ) {
        println "⛔ Skipping plugin '\${modulePlugin.id}' to prevent app/library conflict"
        continue
    }
    project.plugins.apply(modulePlugin.id)`
  );

  fs.writeFile(autolinkFile, patchedData, "utf8", (err) => {
    if (err) {
      console.error("❌ Failed to patch autolinking script:", err);
    } else {
      console.log("✅ Successfully patched expo autolinking to avoid plugin conflict");
    }
  });
});
