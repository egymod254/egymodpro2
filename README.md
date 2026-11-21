# شؤون الموظفين — الإضافي والجزاءات والغياب والسلف والإجازات

تطبيق واحد بثلاث نسخ من نفس الكود: **ويب (يتثبت على الهاتف)** و**أندرويد (APK)** و**كمبيوتر (Windows .exe و macOS .app)**.
البيانات الحالية (54 موظفاً) مأخوذة من ملفات الإكسل المرفوعة، والحسابات مطابقة لمعادلات الشيت (60 دقيقة للساعة).

## 1) الرفع على جيت هاب (بدون تعقيد)
1. ادخل github.com ← **New repository** ← اكتب أي اسم (مثلاً `hr-app`) ← **Create repository**.
2. اضغط **uploading an existing file** ثم اسحب **كل محتويات** هذا المجلد (بما فيها مجلد `.github`) ← **Commit changes**.
3. ادخل **Settings ← Pages** وفي **Source** اختر **GitHub Actions**.
4. افتح تبويب **Actions**: ستبدأ ثلاث عمليات بناء تلقائياً (5 إلى 15 دقيقة). لو لم تبدأ اضغط **Run workflow**.

## 2) أين أجد التطبيقات؟
| النسخة | المكان |
|---|---|
| **ويب** | الرابط يظهر في Settings ← Pages (شكله `https://اسمك.github.io/hr-app/`). على الهاتف افتحه ثم **إضافة إلى الشاشة الرئيسية**. |
| **أندرويد** | Actions ← **بناء تطبيق الأندرويد** ← آخر عملية ← **Artifacts ← HRApp-Android-APK** ← فك الضغط ← انقل `app-debug.apk` للهاتف وثبّته (اسمح بالتثبيت من مصادر غير معروفة). |
| **ويندوز** | Actions ← **بناء تطبيق الكمبيوتر** ← Artifacts ← `HRApp-windows-latest` ← ملف `.exe` للتثبيت. |
| **ماك (.app)** | نفس العملية ← `HRApp-macos-latest` ← ملف `.zip` بداخله `HRApp.app` أو ملف `.dmg`. أول فتح: كليك يمين ← Open. |

> الآيفون: التطبيق الأصلي يحتاج حساب Apple Developer مدفوعاً، فاستخدم نسخة الويب من Safari ثم **Add to Home Screen**.

## 3) الربط مع جوجل شيت
1. أنشئ Google Sheet جديداً (فارغاً) ← **الإضافات ← Apps Script**.
2. امسح الكود الموجود والصق محتوى `google-apps-script/Code.gs`، وغيّر `SECRET` إلى مفتاح سري من عندك ← **حفظ**.
3. **Deploy ← New deployment ← Web app**: *Execute as:* **Me** — *Who has access:* **Anyone** ← **Deploy**، ووافق على الصلاحيات. انسخ الرابط الذي ينتهي بـ `/exec`.
4. في التطبيق اضغط ⚙ **الإعدادات** ← الصق الرابط والمفتاح السري ← **حفظ والاتصال** ← **رفع كل البيانات إلى جوجل شيت**. ستظهر التبويبات: الموظفين، الإضافي، الجزاءات، الغياب، السلف، الإجازات، الملخص.
5. بعد ذلك: كل تسجيل يُحفظ على الجهاز فوراً (حتى بدون إنترنت) ويُرسل للشيت تلقائياً عند توفر النت. وعند فتح التطبيق، لو لا توجد تغييرات معلّقة، يسحب أحدث ما في الشيت.

**مهم:** عدّل في مكان واحد في نفس الوقت. عند الإرسال، يستبدل التطبيق محتوى الشيت بما عنده (آخر تعديل يفوز). أثناء التعديل اليدوي في الشيت اكتب الوقت كنص (مثل `7.30`) في الأعمدة كما هي، ثم اضغط في التطبيق **تحميل البيانات من جوجل شيت**.

## 4) الربط مع ملف الإكسل
**الطريقة الأسهل (نسخة إكسل تلقائية):** في Apps Script شغّل الدالة `saveExcelCopy` مرة، ثم من **Triggers** أضف مشغّلاً زمنياً (كل ساعة أو يوم). يُحفظ ملف `HR-Data.xlsx` في Google Drive، وإذا ثبّتّ **Google Drive for desktop** يظهر الملف محدثاً على جهازك وتفتحه بإكسل.

**الطريقة المباشرة (تحديث الإكسل من الشيت):** شارك الشيت **Anyone with the link: Viewer**، ثم في إكسل: **Data ← Get Data ← From Web** والصق الرابط (بعد استبدال `SHEET_ID` بمعرف الشيت من رابطه) ثم **Load**. اجعل التحديث تلقائياً من **Query Properties ← Refresh every**.

| التبويب | رابط إكسل |
|---|---|
| الموظفين | `https://docs.google.com/spreadsheets/d/SHEET_ID/gviz/tq?tqx=out:csv&sheet=%D8%A7%D9%84%D9%85%D9%88%D8%B8%D9%81%D9%8A%D9%86` |
| الإضافي | `https://docs.google.com/spreadsheets/d/SHEET_ID/gviz/tq?tqx=out:csv&sheet=%D8%A7%D9%84%D8%A5%D8%B6%D8%A7%D9%81%D9%8A` |
| الجزاءات | `https://docs.google.com/spreadsheets/d/SHEET_ID/gviz/tq?tqx=out:csv&sheet=%D8%A7%D9%84%D8%AC%D8%B2%D8%A7%D8%A1%D8%A7%D8%AA` |
| الغياب | `https://docs.google.com/spreadsheets/d/SHEET_ID/gviz/tq?tqx=out:csv&sheet=%D8%A7%D9%84%D8%BA%D9%8A%D8%A7%D8%A8` |
| السلف | `https://docs.google.com/spreadsheets/d/SHEET_ID/gviz/tq?tqx=out:csv&sheet=%D8%A7%D9%84%D8%B3%D9%84%D9%81` |
| الإجازات | `https://docs.google.com/spreadsheets/d/SHEET_ID/gviz/tq?tqx=out:csv&sheet=%D8%A7%D9%84%D8%A5%D8%AC%D8%A7%D8%B2%D8%A7%D8%AA` |
| الملخص | `https://docs.google.com/spreadsheets/d/SHEET_ID/gviz/tq?tqx=out:csv&sheet=%D8%A7%D9%84%D9%85%D9%84%D8%AE%D8%B5` |

> تنبيه: مشاركة الشيت بالرابط تتيح لأي شخص يملك الرابط رؤية بيانات الموظفين. الأفضل حفظ الرابط سراً أو استخدام الطريقة الأولى.
> الإكسل يقرأ من الشيت (اتجاه واحد). للتسجيل استخدم التطبيق أو الشيت، والإكسل للتقارير.

## 5) تحديث البيانات من ملفات الإكسل لاحقاً
```
pip install openpyxl
python tools/excel_to_data.py الاضافي.xlsx الاجازات.xlsx السلف_والجزاءات_والغياب.xlsx
```
ينتج `www/data.js` من جديد؛ ارفعه على جيت هاب. في التطبيق: ⚙ ← **استعادة البيانات الأصلية** لتحميلها على الجهاز.

## 6) ملفات المشروع
`www/` التطبيق نفسه • `google-apps-script/Code.gs` الربط مع جوجل • `electron/` نسخة الكمبيوتر • `capacitor.config.json` نسخة الأندرويد • `.github/workflows/` البناء التلقائي • `tools/` تحويل الإكسل.
