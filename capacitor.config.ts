import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.windeg.admin',
  appName: 'WIND Admin',
  webDir: 'dist',
  server: {
    // 🔥 ملحوظة مهمة: شلنا "url" اللي كانت موجودة هنا قبل كده.
    // كانت بتخلي التطبيق يفتح windeg.com/admin مباشرة من أول ثانية،
    // يعني كود App.tsx (تسجيل الإشعارات الـ Native + إنشاء الـ Channel
    // بالصوت المخصص) ما كانش بيتنفذ خالص. دلوقتي التطبيق بيشغّل
    // App.tsx الأول (يجهز كل حاجة Native)، وبعدها هو نفسه بيحوّل
    // الشاشة لموقعك (window.location.href في App.tsx).
    cleartext: false,
    // ✅ لازم نسمح بالتنقل لدومين الموقع، لأننا بقينا ننتقل له
    // بـ JS navigation مش عن طريق "url" الجاهزة
    allowNavigation: ['windeg.com', '*.windeg.com'],
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;