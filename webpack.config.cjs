const path = require("path");

const webpackConfig = {
  resolve: {
    extensions: [".js", ".ts"],
  },
  optimization: {
    minimize: false,
    moduleIds: "named",
  },
  mode: "production",
  entry: "./src/main.ts",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "index.js",
  },
  target: "node",
  externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
      },
    ],
  },
};

module.exports = webpackConfig;
