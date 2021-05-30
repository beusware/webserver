const path = require("path");

const mode = "development";

const moduleRules = {
  rules: [
    {
      test: /(\.js?$)|(\.tsx?$)|(\.ts?$)/,
      use: "ts-loader",
      exclude: /node_modules/,
    },
    { 
      test: /\.env$/,
      use: "raw-loader", 
    },
    {
      test: /\.js$/,
      use: "babel-loader",
      exclude: /node_modules/,
    }
  ],
};

const resolveExtensions = {
  extensions: [".tsx", ".ts", ".js"],
};

const backendConfig = {
  mode: mode,
  entry: {
    app: [
      "./backend/src/app.ts",
    ],
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "build/"),
  },
  resolve: resolveExtensions,
  module: moduleRules,
  target: "node",
};

const frontendConfig = {
  mode: mode,
  entry: {
    cloud: [
      "./frontend/src/cloud.ts",
    ],
    poker: [
      "./frontend/src/poker.ts",
    ],
    dashboard: [
      "./frontend/src/dashboard.ts",
    ],
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "public/scripts/"),
  },
  resolve: resolveExtensions,
  module: moduleRules,
  target: "web",
};

module.exports = [
  backendConfig, frontendConfig
];