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
            entry: "src/main.ts",
          },
          {
            entry: "src/preload.ts",
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
