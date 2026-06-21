cat > /home/claude/wind-admin-app/capacitor.config.ts << 'EOF'
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.windeg.admin',
  appName: 'WIND Admin',
  webDir: 'dist',
  // ⚠️ تم إزالة server.url عمدًا — كان هذا سبب المشكلة:
  // عند تحديد server.url، Capacitor يستبدل الصفحة المحلية (App.tsx)
  // بالموقع الخارجي فورًا، فكود تسجيل الإشعارات الـ Native لا ينفذ أبدًا.
  // الآن: التطبيق يفتح index.html المحلي أولاً، وكود App.tsx يتولى
  // تسجيل الإشعارات الـ Native، ثم يفتح windeg.com/admin داخل WebView
  // مدمج في التطبيق (عبر @capacitor/browser بنمط in-app)، وليس متصفح خارجي.
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
EOF
echo "done"