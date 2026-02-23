نَصْحَة سريعة لرفع الموقع إلى GitHub (خطوات للمستخدم على جهازه):

1) أنشئ مستودعاً جديداً على GitHub (عام Public). انسخ عنوان المستودع (مثلاً `https://github.com/your-username/elgml-site.git`).

2) من المجلد المحلي حيث وضعت ملفات `elgml-site` نفّذ الأوامر التالية (Windows PowerShell):

```powershell
cd path\to\elgml-site
git init
git add .
git commit -m "Initial Elgml site"
git remote add origin https://github.com/your-username/REPO_NAME.git
git branch -M main
git push -u origin main
```

3) انتقل إلى إعدادات المستودع على GitHub → Pages واختر الفرع `main` والجذر `/ (root)` أو مجلد `docs` إذا وضعت الملفات هناك.

4) انتظر بضع دقائق ثم افتح الرابط الذي يقدمه GitHub Pages لعرض الموقع.

ملاحظة: إذا لا تريد رفع الملفات بنفسك، انسخ رابط المستودع هنا وأرسل لي إذن الوصول (لكن أعلمني أولاً كيف ستعطيني إذن — عادة يحتاج الحساب المدعو أن يكون اسم مستخدم GitHub). بدلاً من ذلك سأعطيك أرشيف ZIP لتنزله ورفعه بنفسك.
