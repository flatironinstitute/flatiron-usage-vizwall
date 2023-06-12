module.exports = {
  packagerConfig: {},
  rebuildConfig: {},
  makers: [],
  plugins: [
    {
      name: "@electron-forge/plugin-vite",
      config: {
        build: [
          {
            entry: "src/main.js",
          },
          {
            entry: "src/preload.js",
          },
        ],
        renderer: [
          {
            name: "main_window",
          },
        ],
      },
    },
  ],
};
