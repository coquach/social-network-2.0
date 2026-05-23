const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withNotificationSounds(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const srcDir = path.join(projectRoot, 'assets/sounds');
      const destDir = path.join(projectRoot, 'android/app/src/main/res/raw');

      try {
        if (fs.existsSync(srcDir)) {
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }
          const files = fs.readdirSync(srcDir);
          for (const file of files) {
            if (file.endsWith('.wav') || file.endsWith('.mp3')) {
              fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
            }
          }
        }
      } catch (error) {
        console.warn('[withNotificationSounds] Failed to copy sound assets:', error);
      }
      return config;
    },
  ]);
};
