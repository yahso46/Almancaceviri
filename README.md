# Almanca Dinleyici

Mikrofonu dinler, Almanca konuşmayı canlı yazar. Her kelimenin altında Türkçe anlamı çıkar,
cümle bitince cümlenin çevirisi ve kelimelerin o cümledeki anlamı gelir. Çeviri DeepSeek ile yapılır.

## Yayınlama (Vercel)

1. Bu klasörü bir GitHub deposuna koy ya da `npx vercel` ile doğrudan yükle.
2. Vercel > Project > Settings > Environment Variables bölümüne ekle:
   `DEEPSEEK_API_KEY` = DeepSeek anahtarın (`sk-...` ile başlar)
3. Yeniden deploy et (Deployments > Redeploy).
4. Adresi Chrome'da (Android) ya da Safari'de (iPhone) aç, mikrofon iznini ver.

Anahtar yalnızca sunucuda (`api/translate.js`) kalır, sayfaya hiç girmez.
Adresi herkese verme: uç nokta senin DeepSeek bakiyeni kullanır.

## Dosyalar

- `index.html`: sayfa (konuşma tanıma + arayüz)
- `api/translate.js`: DeepSeek'e istek atan sunucu fonksiyonu
