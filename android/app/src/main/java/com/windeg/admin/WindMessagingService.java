package com.windeg.admin;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;

import com.capacitorjs.plugins.pushnotifications.MessagingService;
import com.google.firebase.messaging.RemoteMessage;

// 🔥 بنورّث من MessagingService بتاع Capacitor (اللي بدوره بيورّث من
// FirebaseMessagingService) عشان نضيف large icon (لوجو WIND) على كل
// إشعار بدون ما نكسر أي حاجة في الـ plugin.
//
// onMessageReceived بيشتغل لما التطبيق يكون في الـ foreground، أو لما
// الـ payload يكون data-only (مفيش "notification" key). لما التطبيق
// في الخلفية والـ payload فيه "notification" key، FCM بيعرض الإشعار
// لوحده من غير ما يعدي على onMessageReceived — وده اللي بنحله بالـ
// <meta-data> في AndroidManifest.xml للصوت والأيقونة الصغيرة.
//
// الـ large icon دي محتاج نبنيها يدوياً هنا عشان FCM مش بيدعمها
// من خلال الـ meta-data أو الـ payload على الإصدارات القديمة.

public class WindMessagingService extends MessagingService {

    private static final String CHANNEL_ID = "order_alerts_v2";
    private static final int NOTIFICATION_ID_BASE = 2000;

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        // 🔥 لازم ننادي super الأول عشان Capacitor Plugin يعمل شغله
        // (بيبعت الـ remote message للـ JS layer عشان يشتغل
        // pushNotificationReceived listener في App.tsx)
        super.onMessageReceived(remoteMessage);

        RemoteMessage.Notification notification = remoteMessage.getNotification();
        if (notification == null) return;

        String title = notification.getTitle();
        String body = notification.getBody();
        if (title == null && body == null) return;

        // اللوجو الكبير (أبيض على أسود) اللي بيظهر على اليمين في الإشعار
        Bitmap largeBitmap = BitmapFactory.decodeResource(
                getResources(),
                R.drawable.ic_notification_large
        );

        // الـ Intent اللي بيتفتح لما المستخدم يدوس على الإشعار
        // بنفتح MainActivity اللي بتحوّلنا لـ windeg.com/admin عبر Custom Tabs
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);

        // نضيف الـ orderId في الـ intent لو موجود في الـ data payload
        String orderId = remoteMessage.getData().get("orderId");
        if (orderId != null && !orderId.isEmpty()) {
            intent.putExtra("orderId", orderId);
        }

        int notificationId = NOTIFICATION_ID_BASE + (int) (System.currentTimeMillis() % 1000);

        PendingIntent pendingIntent = PendingIntent.getActivity(
                this,
                notificationId,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_stat_wind)
                .setLargeIcon(largeBitmap)
                .setContentTitle(title)
                .setContentText(body)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(pendingIntent);

        NotificationManager manager =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) {
            manager.notify(notificationId, builder.build());
        }
    }
}
