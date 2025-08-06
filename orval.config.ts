export default defineConfig({
  exampleAPI: {
    input: {
      target: "https://api.example.com/swagger",
    },
    output: {
      mode: "single",
      target: "./src/api.ts",
      client: "axios",
      override: {
        mutator: {
          path: "./src/lib/axios.ts",
          name: "apiClientInstance",
        },
      },
    },
  },
});
