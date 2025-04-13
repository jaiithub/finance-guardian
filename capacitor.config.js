// This file configures the app for packaging as an Android app using Capacitor
// Capacitor is a cross-platform native runtime for web apps

module.exports = {
  appId: 'com.financeguardian.app',
  appName: 'FinanceGuardian',
  webDir: 'build',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#3B82F6",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP"
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#3B82F6"
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webViewAllowBackForwardNavigationGestures: true
  }
};
