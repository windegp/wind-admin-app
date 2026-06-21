import { useEffect, useState } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Browser } from '@capacitor/browser';

// 🔥 هذا الملف بيشتغل أول ما التطبيق يفتح: يطلب إذن الإشعارات، يسجل
// التوكن الـ Native، يبعته للسيرفر، وبعدين يفتح windeg.com.
//
// ⚠️ مهم: التحويل بيتم عن طريق Browser.open (Chrome Custom Tabs) مش
// window.location.href جوه نفس الـ WebView. السبب: جوجل بيمنع تسجيل
// الدخول بحساب Google من جوه أي WebView مدمج جوه تطبيق (disallowed_useragent)
// — وده اللي كان بيسبب "بتدوس تسجيل دخول وبيرميك في المتصفح من غير ما
// يكمل". Custom Tabs مختلفة: بتشارك جلسة Chrome العادية (يعني لو
// مسجل دخول في Chrome أصلاً، هيدخل على طول من غير ما يطلب تسجيل دخول
// تاني)، ومسموح بيها رسميًا من جوجل لتسجيل الدخول.

const ADMIN_URL = 'https://windeg.com/admin';
const REDIRECT_DELAY_MS = 1200; // عشان المستخدم يلحق يشوف رسالة الحالة قبل التحويل

// 🔥 guard بسيط عشان لو التطبيق اتفتح بالضغط على إشعار (تاب)، منفتحش
// تابين مختلفين (واحد عام لـ /admin وواحد للطلب المحدد) — اللي يحصل
// الأول بياخد الأولوية وبيقفل التاني.
let hasOpened = false;
function openAdmin(url: string) {
  if (hasOpened) return;
  hasOpened = true;
  Browser.open({ url });
}

function App() {
  const [status, setStatus] = useState('جاري التحقق من صلاحيات الإشعارات...');

  useEffect(() => {
    const setup = async () => {
      try {
        const permStatus = await PushNotifications.requestPermissions();

        if (permStatus.receive !== 'granted') {
          setStatus('تم رفض إذن الإشعارات — هتفتح لوحة التحكم من غير صوت مخصص.');
          setTimeout(() => openAdmin(ADMIN_URL), REDIRECT_DELAY_MS);
          return;
        }

        await PushNotifications.register();
        setStatus('جاري تسجيل الجهاز...');

        PushNotifications.addListener('registration', async (token) => {
          try {
            const res = await fetch('https://windeg.com/api/register-admin-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: token.value, platform: 'android-native' }),
            });

            // 🔥 fetch() مبيرميش Exception غير على فشل الشبكة بس — لو
            // السيرفر رفض الطلب (مثلاً Firestore permission-denied)،
            // fetch() هيكمل عادي بـ res.ok = false من غير ما يدخل catch
            // خالص. عشان كده لازم نتأكد من res.ok يدويًا، وإلا هنفضل
            // نقول "تم التسجيل بنجاح" حتى لو التسجيل فشل فعليًا في
            // السيرفر (وده بالظبط اللي كان بيحصل قبل كده).
            if (!res.ok) {
              const errBody = await res.text().catch(() => '');
              throw new Error(`Server rejected token (${res.status}): ${errBody}`);
            }

            setStatus('تم تسجيل الجهاز بنجاح ✅');
          } catch (err) {
            setStatus('فشل تسجيل الجهاز فعليًا: ' + String(err));
            console.error('Token send error:', err);
          } finally {
            // 🔥 سواء التسجيل نجح أو فشل، التطبيق لازم يكمل لوحة التحكم
            // دايمًا — التطبيق مش المفروض يفضل واقف على الشاشة دي أبدًا.
            setTimeout(() => openAdmin(ADMIN_URL), REDIRECT_DELAY_MS);
          }
        });

        PushNotifications.addListener('registrationError', (err) => {
          setStatus('فشل تسجيل الإشعارات: ' + JSON.stringify(err));
          console.error('Registration error:', err.error);
          setTimeout(() => openAdmin(ADMIN_URL), REDIRECT_DELAY_MS);
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          // التطبيق فاتح قدام المستخدم والإشعار وصل — الصوت بيتشغل من
          // النظام نفسه (channel) مش محتاجين نعمل حاجة هنا.
          console.log('Notification received (foreground):', notification);
        });

        // 🔥 دوس على الإشعار = روح على طول لصفحة الطلب نفسه، مش الصفحة
        // العامة. شغال سواء التطبيق كان في الخلفية أو مقفول تمامًا —
        // Capacitor بيحتفظ بآخر إشعار اتدوس عليه ويبعته هنا أول ما
        // الـ listener يتسجل.
        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          const url = action.notification?.data?.url;
          openAdmin(url || ADMIN_URL);
        });
      } catch (err) {
        setStatus('حدث خطأ غير متوقع: ' + String(err));
        console.error(err);
        setTimeout(() => openAdmin(ADMIN_URL), REDIRECT_DELAY_MS);
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
