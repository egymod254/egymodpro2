/* شؤون الموظفين – واجهة جوجل شيت (Google Apps Script)
   الصق هذا الكود في: الشيت ← الإضافات ← Apps Script، ثم انشره كتطبيق ويب (Web app). */
const SECRET = 'غيّر-هذا-المفتاح-قبل-النشر';   // ضع نفس المفتاح في إعدادات التطبيق
const TZ = Session.getScriptTimeZone();
// المفتاح: [اسم التبويب، العناوين، أعمدة النص (تبدأ من 0)، عدد الأعمدة التي يقرأها التطبيق]
const TABS = {
  E:   ['الموظفين', ['الكود','الاسم','تاريخ التعيين','المرحل (ساعات.دقائق)'], [0,1,2,3], 4],
  ot:  ['الإضافي',  ['الكود','اليوم','الحضور','ص/م','الانصراف','ص/م','تاني يوم (1=نعم)','الإضافي (ساعات.دقائق)'], [0,2,3,4,5,7], 7],
  pen: ['الجزاءات', ['الكود','اليوم','أيام الخصم'], [0], 3],
  ab:  ['الغياب',   ['الكود','اليوم','أيام الغياب'], [0], 3],
  adv: ['السلف',    ['الكود','اليوم','المبلغ (ج.م)'], [0], 3],
  lv:  ['الإجازات', ['الكود','من','إلى','عدد الأيام'], [0,1,2], 3]
};
const SUM = ['الملخص', ['الكود','الاسم','الإضافي المستحق','الجزاءات (يوم)','الغياب (يوم)','السلف (ج.م)','رصيد الإجازات']];

function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function doGet(e) {
  if (e.parameter.tok !== SECRET) return out_({ ok: false, err: 'auth' });
  return out_({ ok: true, rows: readAll_() });
}
function doPost(e) {
  const b = JSON.parse(e.postData.contents);
  if (b.tok !== SECRET) return out_({ ok: false, err: 'auth' });
  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  try { writeAll_(b.rows); } finally { lock.releaseLock(); }
  return out_({ ok: true });
}
function sheet_(name) { const ss = SpreadsheetApp.getActive(); return ss.getSheetByName(name) || ss.insertSheet(name); }
function write_(name, head, rows, textCols) {
  const sh = sheet_(name), c = head.length; sh.clear();
  // أعمدة النص أولاً كي لا يحوّل جوجل 7.30 إلى 7.3 أو النص إلى تاريخ
  textCols.forEach(i => sh.getRange(1, i + 1, Math.max(rows.length + 1, 2), 1).setNumberFormat('@'));
  sh.getRange(1, 1, 1, c).setValues([head]).setFontWeight('bold').setBackground('#10253f').setFontColor('#ffffff');
  if (rows.length) sh.getRange(2, 1, rows.length, c).setValues(rows.map(r => { const x = r.slice(0, c); while (x.length < c) x.push(''); return x; }));
  sh.setFrozenRows(1); sh.setRightToLeft(true);
}
function writeAll_(rows) {
  Object.keys(TABS).forEach(k => { const t = TABS[k]; write_(t[0], t[1], rows[k] || [], t[2]); });
  if (rows.sum) write_(SUM[0], SUM[1], rows.sum, [0, 1]);
}
function readAll_() {
  const o = {};
  Object.keys(TABS).forEach(k => {
    const t = TABS[k], sh = SpreadsheetApp.getActive().getSheetByName(t[0]);
    if (!sh || sh.getLastRow() < 2) { o[k] = []; return; }
    o[k] = sh.getRange(2, 1, sh.getLastRow() - 1, t[3]).getValues()
      .filter(r => String(r[0]).trim() !== '')
      .map(r => r.map((v, i) => v instanceof Date ? Utilities.formatDate(v, TZ, 'yyyy-MM-dd') : (t[2].indexOf(i) >= 0 ? String(v) : v)));
  });
  return o;
}
/** يحفظ نسخة إكسل (HR-Data.xlsx) من الشيت في Google Drive.
    شغّلها مرة للتجربة، ثم من Triggers أضف مشغّلاً زمنياً (كل ساعة أو كل يوم). */
function saveExcelCopy() {
  const id = SpreadsheetApp.getActive().getId();
  const res = UrlFetchApp.fetch('https://docs.google.com/spreadsheets/d/' + id + '/export?format=xlsx',
    { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() } });
  const name = 'HR-Data.xlsx', old = DriveApp.getFilesByName(name);
  while (old.hasNext()) old.next().setTrashed(true);
  DriveApp.createFile(res.getBlob().setName(name));
}
