// One-off: add the 5 new UI keys to each web/l10n/<locale>.json translations
// object. Then run `node tools/i18n-merge.js` to regenerate i18n.js.
const fs = require('fs');
const path = require('path');
const L10N = path.join(__dirname, '..', 'web', 'l10n');

const DATA = {
  "es":{"age_intro_lived":"Hasta ahora has vivido","age_more_coming":"Y los mejores números aún están por llegar — no solo los tuyos, sino los que compartes con las personas que quieres. ✨","dash_recent_ping":"¡escríbele! 🎉","tip_anniversary":"💛 También puedes añadir aniversarios — tu boda o el día en que os conocisteis. Míralo en la pestaña Eventos.","tabbar_events":"Eventos"},
  "fr":{"age_intro_lived":"Jusqu'ici, tu as vécu","age_more_coming":"Et les plus beaux chiffres sont encore à venir — pas seulement les tiens, mais ceux que tu partages avec les gens que tu aimes. ✨","dash_recent_ping":"écris-lui ! 🎉","tip_anniversary":"💛 Tu peux aussi ajouter des dates spéciales — ton mariage ou le jour de votre rencontre. C'est dans l'onglet Dates.","tabbar_events":"Dates"},
  "it":{"age_intro_lived":"Finora hai vissuto","age_more_coming":"E i numeri più belli devono ancora arrivare — non solo i tuoi, ma quelli che condividi con le persone a cui vuoi bene. ✨","dash_recent_ping":"fatti sentire! 🎉","tip_anniversary":"💛 Puoi aggiungere anche le ricorrenze — il tuo matrimonio o il giorno in cui vi siete conosciuti. Le trovi nella scheda Eventi.","tabbar_events":"Eventi"},
  "pt":{"age_intro_lived":"Até agora já viveste","age_more_coming":"E os melhores números ainda estão para vir — não só os teus, mas também os que partilhas com quem gostas. ✨","dash_recent_ping":"dá notícias! 🎉","tip_anniversary":"💛 Também podes adicionar datas especiais — o teu casamento ou o dia em que se conheceram. Vê no separador Eventos.","tabbar_events":"Eventos"},
  "pt_BR":{"age_intro_lived":"Até agora você já viveu","age_more_coming":"E os melhores números ainda estão por vir — não só os seus, mas também os que você compartilha com quem ama. ✨","dash_recent_ping":"manda um oi! 🎉","tip_anniversary":"💛 Você também pode adicionar datas especiais — seu casamento ou o dia em que vocês se conheceram. Veja na aba Eventos.","tabbar_events":"Eventos"},
  "de":{"age_intro_lived":"Bisher hast du gelebt","age_more_coming":"Und die schönsten Zahlen kommen erst noch — nicht nur deine eigenen, sondern die, die du mit den Menschen teilst, die du liebst. ✨","dash_recent_ping":"melde dich 🎉","tip_anniversary":"💛 Du kannst auch Jahrestage hinzufügen — eure Hochzeit oder den Tag, an dem ihr euch kennengelernt habt. Schau im Tab „Anlässe“ nach.","tabbar_events":"Anlässe"},
  "nl":{"age_intro_lived":"Tot nu toe heb je geleefd","age_more_coming":"En de mooiste getallen moeten nog komen — niet alleen die van jou, maar ook die je deelt met de mensen van wie je houdt. ✨","dash_recent_ping":"stuur een berichtje 🎉","tip_anniversary":"💛 Je kunt ook jubilea toevoegen — jullie trouwdag of de dag dat jullie elkaar leerden kennen. Kijk onder het tabblad Momenten.","tabbar_events":"Momenten"},
  "pl":{"age_intro_lived":"Do tej pory przeżyłeś","age_more_coming":"A najpiękniejsze liczby dopiero przed tobą — nie tylko twoje własne, ale i te, które dzielisz z bliskimi. ✨","dash_recent_ping":"odezwij się 🎉","tip_anniversary":"💛 Możesz też dodać rocznice — wasz ślub albo dzień, w którym się poznaliście. Zajrzyj do zakładki Wydarzenia.","tabbar_events":"Wydarzenia"},
  "ru":{"age_intro_lived":"Ты уже прожил","age_more_coming":"А самые красивые числа ещё впереди — и твои собственные, и те, что ты делишь с дорогими тебе людьми. ✨","dash_recent_ping":"напиши 🎉","tip_anniversary":"💛 Можно добавить и годовщины — вашу свадьбу или день, когда вы познакомились. Загляни во вкладку «События».","tabbar_events":"События"},
  "hr":{"age_intro_lived":"Dosad si proživio","age_more_coming":"A najljepši brojevi tek dolaze — ne samo tvoji, nego i oni koje dijeliš s ljudima koje voliš. ✨","dash_recent_ping":"javi se 🎉","tip_anniversary":"💛 Možeš dodati i obljetnice — vaše vjenčanje ili dan kad ste se upoznali. Pogledaj u kartici Događaji.","tabbar_events":"Događaji"},
  "sl":{"age_intro_lived":"Doslej si preživel","age_more_coming":"Najlepše številke pa so šele pred tabo — ne le tvoje, ampak tudi tiste, ki jih deliš z ljudmi, ki jih imaš rad. ✨","dash_recent_ping":"javi se 🎉","tip_anniversary":"💛 Dodaš lahko tudi obletnice — vajino poroko ali dan, ko sta se spoznala. Poglej pod zavihek Dogodki.","tabbar_events":"Dogodki"},
  "zh":{"age_intro_lived":"到目前为止，你已经活了","age_more_coming":"而最棒的数字还在前方——不只是你自己的，还有那些与你所爱之人共享的瞬间。✨","dash_recent_ping":"打个招呼 🎉","tip_anniversary":"💛 你也可以添加纪念日——你的婚礼，或你们相遇的那天。在「纪念日」标签里查看。","tabbar_events":"纪念日"},
  "ja":{"age_intro_lived":"これまでに、あなたが生きてきたのは","age_more_coming":"そして、最高の数字はまだこれから——自分だけじゃなく、大切な人と分かち合う数字も。✨","dash_recent_ping":"連絡しよう 🎉","tip_anniversary":"💛 記念日も追加できます——結婚式や、出会った日など。「記念日」タブをご覧ください。","tabbar_events":"記念日"},
  "ko":{"age_intro_lived":"지금까지 당신이 살아온 시간은","age_more_coming":"그리고 가장 멋진 숫자들은 아직 남아 있어요——나만의 숫자뿐 아니라, 사랑하는 사람들과 함께 나누는 숫자까지. ✨","dash_recent_ping":"안부 전하기 🎉","tip_anniversary":"💛 기념일도 추가할 수 있어요——결혼한 날이나 처음 만난 날처럼요. '기념일' 탭에서 확인하세요.","tabbar_events":"기념일"},
  "vi":{"age_intro_lived":"Đến nay bạn đã sống được","age_more_coming":"Và những con số tuyệt vời nhất vẫn còn ở phía trước — không chỉ của riêng bạn, mà cả những khoảnh khắc bạn chia sẻ với người mình yêu thương. ✨","dash_recent_ping":"gửi lời chào 🎉","tip_anniversary":"💛 Bạn cũng có thể thêm các ngày kỷ niệm — ngày cưới hay ngày hai bạn gặp nhau. Xem ở tab Kỷ niệm.","tabbar_events":"Kỷ niệm"},
  "th":{"age_intro_lived":"จนถึงตอนนี้ คุณมีชีวิตอยู่มาแล้ว","age_more_coming":"และตัวเลขที่ดีที่สุดยังรออยู่ข้างหน้า — ไม่ใช่แค่ของคุณเอง แต่รวมถึงช่วงเวลาที่คุณแบ่งปันกับคนที่คุณรักด้วย ✨","dash_recent_ping":"ทักไปหา 🎉","tip_anniversary":"💛 คุณเพิ่มวันครบรอบได้ด้วยนะ — วันแต่งงานหรือวันที่คุณสองคนได้พบกัน ดูได้ที่แท็บวันสำคัญ","tabbar_events":"วันสำคัญ"},
  "id":{"age_intro_lived":"Sampai sekarang kamu telah hidup selama","age_more_coming":"Dan angka-angka terbaik masih menanti di depan — bukan cuma milikmu sendiri, tapi juga momen yang kamu bagi bersama orang-orang tercinta. ✨","dash_recent_ping":"sapa dia 🎉","tip_anniversary":"💛 Kamu juga bisa menambahkan hari jadi — hari pernikahan atau hari kalian pertama bertemu. Lihat di tab Acara.","tabbar_events":"Acara"},
  "hi":{"age_intro_lived":"अब तक आप जी चुके हैं","age_more_coming":"और सबसे ख़ास नंबर तो अभी आने बाक़ी हैं — सिर्फ़ आपके अपने नहीं, बल्कि वो भी जो आप अपने चाहने वालों के साथ बाँटते हैं। ✨","dash_recent_ping":"हाल पूछें 🎉","tip_anniversary":"💛 आप सालगिरह भी जोड़ सकते हैं — अपनी शादी या जिस दिन आप मिले थे। इवेंट्स टैब में देखें।","tabbar_events":"इवेंट्स"},
  "bn":{"age_intro_lived":"এখন পর্যন্ত আপনি বেঁচে আছেন","age_more_coming":"আর সেরা সংখ্যাগুলো এখনও সামনে — শুধু আপনার নিজের নয়, বরং সেগুলোও যা আপনি প্রিয় মানুষদের সঙ্গে ভাগ করে নেন। ✨","dash_recent_ping":"খোঁজ নিন 🎉","tip_anniversary":"💛 আপনি বার্ষিকীও যোগ করতে পারেন — আপনার বিয়ে বা যেদিন দেখা হয়েছিল। ইভেন্টস ট্যাবে দেখুন।","tabbar_events":"ইভেন্টস"}
};

let updated = 0;
for (const [loc, keys] of Object.entries(DATA)) {
    const fp = path.join(L10N, loc + '.json');
    if (!fs.existsSync(fp)) { console.error('missing', fp); continue; }
    const json = JSON.parse(fs.readFileSync(fp, 'utf8'));
    json.translations = json.translations || {};
    Object.assign(json.translations, keys);
    fs.writeFileSync(fp, JSON.stringify(json, null, 2) + '\n');
    updated++;
    console.log('updated', loc, '(+' + Object.keys(keys).length + ' keys)');
}
console.log('\nUpdated', updated, 'locale files. Now run: node tools/i18n-merge.js');
