/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "warn",
      comment: "Circular dependencies make code harder to reason about",
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: {
      path: ["node_modules", "dist", "\\.git"],
    },
    exclude: {
      path: ["\\.(test|spec)\\.(ts|tsx|js)$", "__tests__"],
    },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
    },
  },
};
