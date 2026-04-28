window.MathJax = {
  skipStartupTypeset: true,
  messageStyle: 'none',
  tex2jax: {
    inlineMath: [['$','$']],
    displayMath: [['$$','$$']],
    processEscapes: true
  },
  jax: [
    "input/TeX",
    "output/HTML-CSS",
    "output/PreviewHTML"
  ],
  extensions: [
    "tex2jax.js",
    "MathMenu.js",
    "MathZoom.js",
    "fast-preview.js",
    "AssistiveMML.js",
    "a11y/accessibility-menu.js"
  ],
  TeX: {
    equationNumbers: {
      autoNumber: "AMS"
    },
    extensions: [
      "AMSmath.js",
      "AMSsymbols.js",
      "noErrors.js",
      "noUndefined.js",
      "mhchem.js"
    ],
    mhchem: {
      legacy: false
    }
  },
  "HTML-CSS": {
    availableFonts: [],
    webFont: "STIX-Web"
  }
};
