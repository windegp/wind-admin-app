package com.windeg.admin;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    // 🔥 لازم القناة دي تتعمل قبل ما أي إشعار يوصل عليها — لو الإشعار وصل
    // قبل ما القناة تتعمل، Android بيستخدم قناة افتراضية بصوت النظام
    // العادي بدل cha_ching. عشان كده بتتعمل هنا في onCreate (أول حاجة
    // بتشتغل لما التطبيق يفتح)، مش لما إشعار يوصل.
    //
    // ⚠️ صوت القناة بيتقفل عند أول إنشاء على الجهاز ولا يتغير بعدها حتى
    // لو غيّرنا الكود — لو محتاجين نغيّر الصوت يوماً، لازم ID قناة جديد
    // (مش order_alerts) عشان أجهزة المستخدمين القديمة تاخد الصوت الجديد.
    private static final String CHANNEL_ID = "order_alerts_v2";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createOrderAlertsChannel();
    }

    private void createOrderAlertsChannel() {
        // NotificationChannel نفسه متاح بس من API 26 (Android 8) فأعلى.
        // على الإصدارات الأقدم (من Android 6 لحد 7.1) القنوات مش موجودة
        // أصلاً، والصوت المخصص بيتحدد بدل كده عن طريق
        // default_notification_sound في AndroidManifest.xml.
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }

        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager == null) return;

        // لو القناة موجودة بالفعل (تشغيلة سابقة)، منعملش حاجة — تعديل
        // إعدادات قناة موجودة مش بيتغير من هنا أصلاً.
        if (manager.getNotificationChannel(CHANNEL_ID) != null) {
            return;
        }

        Uri soundUri = Uri.parse(
                "android.resource://" + getPackageName() + "/raw/cha_ching"
        );

        AudioAttributes audioAttributes = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build();

        NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "تنبيهات الأوردرات الجديدة",
                NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("صوت تنبيه مخصص لما يجي أوردر جديد على WIND");
        channel.setSound(soundUri, audioAttributes);
        channel.enableVibration(true);
        channel.setShowBadge(true);

        manager.createNotificationChannel(channel);
    }
}
