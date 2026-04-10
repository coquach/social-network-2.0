const { existsSync } = require("node:fs");
const path = require("node:path");

const { expo: baseConfig } = require("./app.json");

const projectId = "e269aaac-d58b-4520-a4f8-4cf6fc462dad";

const resolveOptionalFile = (envName, localRelativePath) => {
  const envPath = process.env[envName];

  if (envPath) {
    return envPath;
  }

  const localPath = path.resolve(__dirname, localRelativePath);
  return existsSync(localPath) ? localPath : undefined;
};

module.exports = () => {
  const androidGoogleServicesFile = resolveOptionalFile(
    "GOOGLE_SERVICES_JSON",
    "./google-services.json",
  );
  const iosGoogleServicesFile = resolveOptionalFile(
    "GOOGLE_SERVICE_INFO_PLIST",
    "./GoogleService-Info.plist",
  );

  return {
    ...baseConfig,
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      ...baseConfig.updates,
      url: `https://u.expo.dev/${projectId}`,
    },
    ios: {
      ...baseConfig.ios,
      ...(iosGoogleServicesFile
        ? { googleServicesFile: iosGoogleServicesFile }
        : {}),
    },
    android: {
      ...baseConfig.android,
      ...(androidGoogleServicesFile
        ? { googleServicesFile: androidGoogleServicesFile }
        : {}),
    },
    extra: {
      ...baseConfig.extra,
      appEnv:
        process.env.APP_VARIANT ??
        process.env.EAS_BUILD_PROFILE ??
        process.env.NODE_ENV ??
        "development",
      eas: {
        ...baseConfig.extra?.eas,
        projectId,
      },
    },
  };
};
