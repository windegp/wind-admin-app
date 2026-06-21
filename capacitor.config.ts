import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.windeg.admin',
  appName: 'WIND Admin',
  webDir: 'dist',
  server: {
    // التطبيق هيفتح لوحة الأدمن مباشرة من السيرفر الحقيقي.
    // أي تحديث على الموقع نفسه يظهر تلقائيًا، بدون أي rebuild للتطبيق.
    url: 'https://windeg.com/admin',
    cleartext: false,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
