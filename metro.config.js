const { withNativeWind } = require('nativewind/metro');
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

config.transformer.minifierPath = 'metro-minify-uglify';
config.transformer.minifierPath = 'metro-minify-terser';

config.transformer.minifierConfig = {
  compress: {
    // Enable all unsafe optimizations.
    unsafe: true,
    unsafe_arrows: true,
    unsafe_comps: true,
    unsafe_Function: true,
    unsafe_math: true,
    unsafe_symbols: true,
    unsafe_methods: true,
    unsafe_proto: true,
    unsafe_regexp: true,
    unsafe_undefined: true,
    unused: true,
  },
};
config.transformer.getTransformOptions = async () => ({
  transform: {
    inlineRequires: true,
  },
});

// This helps support certain popular third-party libraries
// such as Firebase that use the extension cjs.
config.resolver.sourceExts.push('cjs');

config.resolver.unstable_enablePackageExports = true; 
module.exports = withNativeWind(config, {
  input: './src/app/global.css',
  configPath: './tailwind.config.ts',
});
