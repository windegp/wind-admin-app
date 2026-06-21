import { useEffect, useState } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';

// 🔥 هذا الملف بيشتغل فقط للحظة الأولى من تشغيل التطبيق، بعدها
// بيحوّل الشاشة بالكامل لفتح windeg.com/admin عن طريق window.location.href
// (مش عن طريق server.url في capacitor.config.ts، عشان الكود هنا
// - تسجيل التوكن الـ Native - يتنفذ فعليًا الأول).
//
// الكود هنا مسؤول عن: طلب إذن الإشعارات، تسجيل التوكن الـ Native،
// إرساله لباك إندك عشان يُحفظ في adminTokens، وبعدين التحويل للموقع.

const ADMIN_URL = 'https://windeg.com/admin';
const REDIRECT_DELAY_MS = 1200; // عشان المستخدم يلحق يشوف رسالة الحالة قبل التحويل

function goToAdmin() {
  setTimeout(() => {
    window.location.href = ADMIN_URL;
  }, REDIRECT_DELAY_MS);
}

function App() {
  const [status, setStatus] = useState('جاري التحقق من صلاحيات الإشعارات...');

  useEffect(() => {
    const setup = async () => {
      try {
        const permStatus = await PushNotifications.requestPermissions();

        if (permStatus.receive !== 'granted') {
          setStatus('تم رفض إذن الإشعارات — هتفتح لوحة التحكم من غير صوت مخصص.');
          goToAdmin();
          return;
        }

        await PushNotifications.register();
        setStatus('جاري تسجيل الجهاز...');

        PushNotifications.addListener('registration', async (token) => {
          try {
            await fetch('https://windeg.com/api/register-admin-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: token.value, platform: 'android-native' }),
            });
            setStatus('تم تسجيل الجهاز بنجاح ✅');
          } catch (err) {
            setStatus('فشل إرسال التوكن للسيرفر — هتفتح لوحة التحكم وهنحاول تاني المرة الجاية.');
            console.error('Token send error:', err);
          } finally {
            // 🔥 سواء التسجيل نجح أو فشل، التطبيق لازم يكمل لوحة التحكم
            // دايمًا — التطبيق مش المفروض يفضل واقف على الشاشة دي أبدًا.
            goToAdmin();
          }
        });

        PushNotifications.addListener('registrationError', (err) => {
          setStatus('فشل تسجيل الإشعارات: ' + JSON.stringify(err));
          console.error('Registration error:', err.error);
          goToAdmin();
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Notification received (foreground):', notification);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          console.log('Notification tapped:', action);
        });
      } catch (err) {
        setStatus('حدث خطأ غير متوقع: ' + String(err));
        console.error(err);
        goToAdmin();
      }
    };

    setup();
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <h2>WIND Admin</h2>
      <p>{status}</p>
      <p style={{ fontSize: '12px', color: '#888' }}>
        سيتم تحويلك تلقائيًا إلى لوحة التحكم...
      </p>
    </div>
  );
}

export default App;
