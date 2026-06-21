import { useEffect, useState } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';

// 🔥 هذا الملف بيشتغل للحظة الأولى من تشغيل التطبيق فقط: بيطلب إذن الإشعارات،
// بيسجّل التوكن الـ Native، وبيرسله لباك إندك عشان يُحفظ في adminTokens.
// بعد تسجيل التوكن (أو فشله/رفضه) بيحوّل الشاشة لفتح windeg.com/admin مباشرة
// عن طريق window.location.href (مفيش server.url في capacitor.config.ts،
// والتنقّل مسموح عبر allowNavigation لدومين windeg.com).

const ADMIN_URL = 'https://windeg.com/admin';

function App() {
  const [status, setStatus] = useState('جاري التحقق من صلاحيات الإشعارات...');

  useEffect(() => {
    const goToDashboard = () => {
      window.location.href = ADMIN_URL;
    };

    const setup = async () => {
      // ضمان فتح لوحة التحكم حتى لو ما وصلش حدث التسجيل (إذن مرفوض/خطأ)
      const redirectTimer = setTimeout(goToDashboard, 8000);

      try {
        // نضيف المستمعين قبل register() عشان ما نفوّتش حدث التوكن
        PushNotifications.addListener('registration', async (token) => {
          try {
            await fetch('https://windeg.com/api/register-admin-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: token.value, platform: 'android-native' }),
            });
            setStatus('تم تسجيل الجهاز بنجاح ✅');
          } catch (err) {
            setStatus('فشل إرسال التوكن للسيرفر — تحقق من الاتصال.');
            console.error('Token send error:', err);
          } finally {
            clearTimeout(redirectTimer);
            goToDashboard();
          }
        });

        PushNotifications.addListener('registrationError', (err) => {
          setStatus('فشل تسجيل الإشعارات: ' + JSON.stringify(err));
          console.error('Registration error:', err.error);
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Notification received (foreground):', notification);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          console.log('Notification tapped:', action);
        });

        const permStatus = await PushNotifications.requestPermissions();

        if (permStatus.receive !== 'granted') {
          setStatus('تم رفض إذن الإشعارات — افتح إعدادات التطبيق لتفعيلها يدويًا.');
          return;
        }

        await PushNotifications.register();
        setStatus('جاري تسجيل الجهاز...');
      } catch (err) {
        setStatus('حدث خطأ غير متوقع: ' + String(err));
        console.error(err);
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
