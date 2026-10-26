// ÖZEN ATLAS - çeviri sistemi
// Statik metinler: data-translate="anahtar"  → aşağıdaki sözlükten
// Dinamik metinler (tarif/seyahat içeriği): class="dyn" → Google (proxy) / MyMemory ile çevrilir

const CACHE_KEY = "translationCache";
const CACHE_LIMIT = 1500;      // önbellekte tutulacak en fazla çeviri sayısı
const REQUEST_TIMEOUT = 8000;  // ms, takılan istekleri iptal et
const SUPPORTED_LANGS = ["tr", "en", "ar", "ru"];

class TranslationSystem {
  constructor() {
    const saved = localStorage.getItem("selectedLanguage");
    this.lang = SUPPORTED_LANGS.includes(saved) ? saved : "tr";
    this.translations = this.loadTranslations();
    this.cache = this.loadCache();
    this.active = 0;       // eşzamanlı istek sayısı
    this.observerTimer = null;
    this.saveTimer = null;
    this.init();
  }

  init() {
    this.applyDirection();
    this.updateLanguageUI();
    this.translatePage();
    this.observeContentChanges();
  }

  loadTranslations() {
    return {
      tr: {
        "nav.home": "ANASAYFA", "nav.travels": "SEYAHATLER", "nav.recipes": "TARİFLER","nav.map": "HARİTA",
        "nav.contact": "İLETİŞİM / ABONE OL", "nav.turkey": "Türkiye", "nav.abroad": "Yurtdışı",
        "nav.desserts": "Tatlılar", "nav.meals": "Yemekler",
        "hero.title": "Birlikte Keşfediyoruz",
        "hero.subtitle": "Hem seyahatlerimizden anılar hem de mutfağımızdan çıkan tatlı ve yemek tarifleriyle dolu bir yolculuğa davet ediyoruz.",
        "hero.explore": "Keşfetmeye Başla",
        "hero.title1": "Lezzetin Sanata Dönüştüğü Mutfak",
        "hero.subtitle1": "Sevgiyle hazırlanan, denenmiş tariflerimizi keşfedin.",
        "hero.subcontent": "Rotalar, tüyolar ve daha fazlası için Instagram'da buluşalım!",
        "features.travel.title": "Gezginlerin İzinden", "features.travel.desc": "Dünyayı gezerken anılarımızı paylaşıyoruz.",
        "features.recipes.title": "Tarifler", "features.recipes.desc": "Sevgiyle hazırladığımız yemekler ve tatlıları adım adım tariflerle keşfet.",
        "features.social.title": "Sosyal Medya", "features.social.desc": "Paylaşımlarımızı sosyal medya hesaplarımızda takip ederek yeni yazılarımızdan haberdar olabilirsiniz.",
        "destinations.international.title": "Yurtdışı Destinasyonları", "destinations.international.subtitle": "Dünyanın en güzel ve heyecan verici yerlerini keşfedin",
        "destinations.turkey.title": "Türkiye Destinasyonları", "destinations.turkey.subtitle": "Ülkemizin eşsiz güzelliklerini keşfedin",
        "destinations.turkey": "Türkiye", "destinations.saudi": "Suudi Arabistan", "destinations.egypt": "Mısır",
        "destinations.nevsehir": "Nevşehir", "destinations.istanbul": "İstanbul", "destinations.cappadocia": "Kapadokya",
        "destinations.giza": "Gize",
        "contact.title": "İLETİŞİM & ABONE OL", "contact.subtitle": "Hayalinizdeki seyahati planlamaya hazır mısınız? Bugün bizimle iletişime geçin!",
        "contact.info.title": "İLETİŞİM BİLGİLERİ", "contact.info.location": "Türkiye",
        "contact.form.title": "Mesaj Gönder", "contact.form.name": "Ad Soyad *", "contact.form.email": "E-posta *",
        "contact.form.phone": "Telefon", "contact.form.subject": "Konu *", "contact.form.message": "Mesajınız *",
        "contact.form.newsletter": "E-bülten ve kampanya bilgilerini almak istiyorum", "contact.form.submit": "Mesaj Gönder",
        "contact.form.name.error": "Lütfen adınızı girin.", "contact.form.email.error": "Geçerli bir e-posta adresi girin.",
        "contact.form.subject.error": "Lütfen konu başlığını yazın.", "contact.form.message.error": "Lütfen mesajınızı yazın.",
        "contact.form.required": "Lütfen zorunlu alanları doğru şekilde doldurun.",
        "contact.form.noservice": "E-posta servisi yüklenemedi. Lütfen sayfayı yenileyin.",
        "contact.form.sending": "Gönderiliyor...",
        "contact.form.success": "Mesajınız başarıyla gönderildi! En kısa sürede dönüş yapacağız.",
        "contact.form.error": "Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
        "footer.description": "2026'dan beri unutulmaz seyahat deneyimleri yaratıyoruz. Hayalinizdeki destinasyonlara yolculuk burada başlıyor.",
        "footer.quick.title": "Hızlı Linkler", "footer.destinations.title": "Popüler Destinasyonlar",
        "footer.copyright": "© 2026 ÖZEN ATLAS. Tüm hakları saklıdır.",
        "recipes.empty": "Bu kategoride henüz tarif bulunmuyor.", "recipes.ingredients": "Malzemeler:",
        "recipes.instructions": "Yapılışı:", "recipes.view": "Tarifi Görüntüle",
        "travels.empty": "Bu kategoride henüz seyahat bulunmuyor.", "travels.details": "Detayları Gör",
        "header.title": "Destinasyonlarımız", "header.subtitle": "Dünyanın en güzel yerlerini keşfedin ve unutulmaz anılar biriktirin",
        "filter.btn": "Tümü", "filter.Tr": "Türkiye", "filter.abroad": "Yurtdışı",
        "filter.all": "Tümü", "filter.desert": "Tatlılar", "filter.meal": "Yemekler", "filter.soup": "Çorbalar",
        "container.Tr": "Türkiye", "container.abroad": "Yurtdışı",
        "cta.title": "Sen de Bize Katıl, Hayalindeki Seyahati Planlayalım", "cta.insta": "Instagram'dan Takip Et",
        "section.title": "Sıkça Sorulan Sorular", "section.subtitle": "Merak ettiğiniz soruların cevapları burada",
        "question": "En çok ilhamı nereden alıyorsun: gezilerden mi yoksa mutfaktan mı?",
        "answer": "Aslında ikisi birbirini besliyor! Seyahat ettiğim yerlerde tattığım yöresel lezzetler beni mutfakta denemeler yapmaya yönlendiriyor. Mutfakta geliştirdiğim tarifler de bazen yeni rotalar keşfetme isteği uyandırıyor. İlham hem tabaktan hem yoldan geliyor diyebilirim.",
        "map.title": "Gezilecek Yerler Haritası",
        "map.subtitle": "Keşfetmek istediğiniz yerleri harita üzerinden inceleyin.",
        "map.search": "Yer ara",
        "map.all": "Tüm yerler",
        "map.turkey": "Türkiye",
        "map.abroad": "Yurtdışı", 
        "map.directions": "Yol tarifi al",
        "map.location": "Konumu görüntüle",
        "suggester.title.recipe": "Bugün ne pişirsem?",
        "suggester.title.travel": "Nereye gitsem?",
        "suggester.button.recipe": "Bana tarif öner",
        "suggester.button.travel": "Bana seyahat öner",
        "suggester.details": "Detaya git →",
        "suggestions.title": "Sana Özel Öneriler",
        "suggestions.subtitle": "Bugün ne pişireceğini veya nereye gideceğini birlikte keşfedelim.",
        "suggester.description": "Bugün senin için bir öneri seçelim.",
        
      },
      en: {
        "nav.home": "HOME", "nav.travels": "TRAVELS", "nav.recipes": "RECIPES","nav.map": "MAP",
        "nav.contact": "CONTACT / SUBSCRIBE", "nav.turkey": "Türkiye", "nav.abroad": "International",
        "nav.desserts": "Desserts", "nav.meals": "Meals",
        "hero.title": "Exploring Together",
        "hero.subtitle": "We invite you to a journey full of memories from our travels and sweet and savory recipes from our kitchen.",
        "hero.explore": "Start Exploring",
        "hero.title1": "Kitchen Where Taste Turns Into Art",
        "hero.subtitle1": "Discover our tried-and-true recipes made with love.",
        "hero.subcontent": "Let's meet on Instagram for routes, tips, and more!",
        "features.travel.title": "Following Travelers", "features.travel.desc": "We share our memories while traveling the world.",
        "features.recipes.title": "Recipes", "features.recipes.desc": "Discover the dishes and desserts we lovingly prepare with step-by-step recipes.",
        "features.social.title": "Social Media", "features.social.desc": "Follow us on social media to stay up to date with our new posts.",
        "destinations.international.title": "International Destinations", "destinations.international.subtitle": "Discover the most beautiful and exciting places in the world",
        "destinations.turkey.title": "Türkiye Destinations", "destinations.turkey.subtitle": "Discover the unique beauties of our country",
        "destinations.turkey": "Türkiye", "destinations.saudi": "Saudi Arabia", "destinations.egypt": "Egypt",
        "destinations.nevsehir": "Nevşehir", "destinations.istanbul": "Istanbul", "destinations.cappadocia": "Cappadocia",
        "destinations.jeddah": "Jeddah", "destinations.giza": "Giza",
        "contact.title": "CONTACT & SUBSCRIBE", "contact.subtitle": "Are you ready to plan your dream trip? Contact us today!",
        "contact.info.title": "CONTACT INFORMATION", "contact.info.location": "Türkiye",
        "contact.form.title": "Send Message", "contact.form.name": "Full Name *", "contact.form.email": "Email *",
        "contact.form.phone": "Phone", "contact.form.subject": "Subject *", "contact.form.message": "Your Message *",
        "contact.form.newsletter": "I want to receive newsletters and promotions", "contact.form.submit": "Send Message",
        "contact.form.name.error": "Please enter your name.", "contact.form.email.error": "Please enter a valid email address.",
        "contact.form.subject.error": "Please enter the subject.", "contact.form.message.error": "Please enter your message.",
        "contact.form.required": "Please fill in all required fields correctly.",
        "contact.form.noservice": "The email service could not be loaded. Please refresh the page.",
        "contact.form.sending": "Sending...",
        "contact.form.success": "Your message has been sent! We will get back to you soon.",
        "contact.form.error": "An error occurred while sending your message. Please try again.",
        "footer.description": "We have been creating unforgettable travel experiences since 2026. Your journey to dream destinations starts here.",
        "footer.quick.title": "Quick Links", "footer.destinations.title": "Popular Destinations",
        "footer.copyright": "© 6 ÖZEN ATLAS. All rights reserved.",
        "recipes.empty": "No recipes available in this category yet.", "recipes.ingredients": "Ingredients:",
        "recipes.instructions": "Instructions:", "recipes.view": "View Recipe",
        "travels.empty": "No travels available in this category yet.", "travels.details": "View Details",
        "header.title": "Our Destinations", "header.subtitle": "Discover the world's most beautiful places and create unforgettable memories",
        "filter.btn": "All", "filter.Tr": "Türkiye", "filter.abroad": "International",
        "filter.all": "All", "filter.desert": "Desserts", "filter.meal": "Meals", "filter.soup": "Soups",
        "container.Tr": "Türkiye", "container.abroad": "International",
        "cta.title": "Join Us and Let's Plan Your Dream Trip", "cta.insta": "Follow Us on Instagram",
        "section.title": "Frequently Asked Questions", "section.subtitle": "The answers to your questions are here",
        "question": "Where do you get most of your inspiration: from travels or from the kitchen?",
        "answer": "Actually, both feed each other! The local flavors I taste while traveling inspire me to experiment in the kitchen. The recipes I create in the kitchen sometimes spark a desire to discover new routes. I can say that inspiration comes both from the plate and the road.",
        "map.title": "Places to Explore",
        "map.subtitle": "Explore the places you want to visit on the map.",
        "map.search": "Search for a place",
        "map.all": "All places",
        "map.turkey": "Türkiye",
        "map.abroad": "International",
        "map.directions": "Get directions",
        "map.location": "View location",
        "suggester.title.recipe": "What should I cook today?",
        "suggester.title.travel": "Where should I go?",
        "suggester.button.recipe": "Suggest a recipe",
        "suggester.button.travel": "Suggest a destination",
        "suggester.details": "View details →",
        "suggestions.title": "Personalized Suggestions",
        "suggestions.subtitle": "Let's discover together what to cook today or where to go.",
        "suggester.description": "Let's find a recommendation for you today.",
      },
      ar: {
        "nav.home": "الرئيسية", "nav.travels": "الرحلات", "nav.recipes": "الوصفات","nav.map": "رسم خريطة",
        "nav.contact": "اتصل / اشترك", "nav.turkey": "تركيا", "nav.abroad": "الخارج",
        "nav.desserts": "الحلويات", "nav.meals": "الوجبات",
        "hero.title": "نستكشف معًا",
        "hero.subtitle": "ندعوكم إلى رحلة مليئة بالذكريات من رحلاتنا ووصفات الحلويات والطعام من مطبخنا.",
        "hero.explore": "ابدأ الاستكشاف",
        "hero.title1": "المطبخ حيث يتحول الطعم إلى فن",
        "hero.subtitle1": "اكتشف وصفاتنا المجربة والمعدة بحب",
        "hero.subcontent": "لنتقابل على إنستغرام للمسارات والنصائح وأكثر!",
        "features.travel.title": "تتبع المسافرين", "features.travel.desc": "نشارك ذكرياتنا أثناء السفر حول العالم.",
        "features.recipes.title": "الوصفات", "features.recipes.desc": "اكتشف الأطباق والحلويات التي نحضرها بحب مع وصفات خطوة بخطوة.",
        "features.social.title": "وسائل التواصل الاجتماعي", "features.social.desc": "تابعنا على وسائل التواصل الاجتماعي لتبقى على اطلاع بمنشوراتنا الجديدة.",
        "destinations.international.title": "الوجهات الدولية", "destinations.international.subtitle": "اكتشف أجمل وأكثر الأماكن إثارة في العالم",
        "destinations.turkey.title": "جولات تركيا", "destinations.turkey.subtitle": "اكتشف الجمال الفريد لبلدنا",
        "destinations.turkey": "تركيا", "destinations.saudi": "المملكة العربية السعودية", "destinations.egypt": "مصر",
        "destinations.nevsehir": "نيفشهير", "destinations.istanbul": "اسطنبول", "destinations.cappadocia": "كابادوكيا",
        "destinations.jeddah": "جدة", "destinations.giza": "الجيزة",
        "contact.title": "اتصل واشترك", "contact.subtitle": "هل أنت مستعد لتخطيط رحلة أحلامك؟ تواصل معنا اليوم!",
        "contact.info.title": "معلومات الاتصال", "contact.info.location": "تركيا",
        "contact.form.title": "إرسال رسالة", "contact.form.name": "الاسم الكامل *", "contact.form.email": "البريد الإلكتروني *",
        "contact.form.phone": "الهاتف", "contact.form.subject": "الموضوع *", "contact.form.message": "رسالتك *",
        "contact.form.newsletter": "أريد تلقي النشرة الإخبارية والعروض", "contact.form.submit": "إرسال الرسالة",
        "contact.form.name.error": "يرجى إدخال اسمك.", "contact.form.email.error": "يرجى إدخال عنوان بريد إلكتروني صحيح.",
        "contact.form.subject.error": "يرجى إدخال الموضوع.", "contact.form.message.error": "يرجى إدخال رسالتك.",
        "contact.form.required": "يرجى ملء جميع الحقول المطلوبة بشكل صحيح.",
        "contact.form.noservice": "تعذر تحميل خدمة البريد. يرجى تحديث الصفحة.",
        "contact.form.sending": "جارٍ الإرسال...",
        "contact.form.success": "تم إرسال رسالتك بنجاح! سنرد عليك قريبًا.",
        "contact.form.error": "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.",
        "footer.description": "نحن نخلق تجارب سفر لا تُنسى منذ عام 2026. رحلتك إلى وجهات الأحلام تبدأ هنا.",
        "footer.quick.title": "روابط سريعة", "footer.destinations.title": "وجهات شائعة",
        "footer.copyright": "© 2026 ÖZEN ATLAS. جميع الحقوق محفوظة.",
        "recipes.empty": "لا توجد وصفات متاحة في هذه الفئة حتى الآن.", "recipes.ingredients": "المكونات:",
        "recipes.instructions": "طريقة التحضير:", "recipes.view": "عرض الوصفة",
        "travels.empty": "لا توجد رحلات متاحة في هذه الفئة حتى الآن.", "travels.details": "عرض التفاصيل",
        "header.title": "وجهاتنا", "header.subtitle": "اكتشف أجمل أماكن العالم واصنع ذكريات لا تُنسى",
        "filter.btn": "الكل", "filter.Tr": "تركيا", "filter.abroad": "خارج البلاد",
        "filter.all": "الكل", "filter.desert": "الحلويات", "filter.meal": "الوجبات", "filter.soup": "الشوربات",
        "container.Tr": "تركيا", "container.abroad": "خارج البلاد",
        "cta.title": "انضم إلينا ولنخطط رحلة أحلامك", "cta.insta": "تابعنا على إنستغرام",
        "section.title": "الأسئلة الشائعة", "section.subtitle": "إجابات أسئلتك تجدها هنا",
        "question": "من أين تستمد معظم إلهامك: من السفر أم من المطبخ؟",
        "answer": "في الواقع، كلاهما يكمل الآخر! النكهات المحلية التي أتذوقها أثناء السفر تدفعني إلى التجربة في المطبخ. والوصفات التي أطورها في المطبخ تثير أحيانًا رغبتي في اكتشاف وجهات جديدة. أستطيع أن أقول إن الإلهام يأتي من الطبق ومن الطريق معًا.",
        "map.title": "الأماكن التي يمكنك استكشافها",
        "map.subtitle": "استكشف الأماكن التي ترغب في زيارتها على الخريطة.",
        "map.search": "ابحث عن مكان",
        "map.all": "جميع الأماكن",
        "map.turkey": "تركيا",
        "map.abroad": "خارج البلاد",
        "map.directions": "الحصول على الاتجاهات",
        "map.location": "عرض الموقع",
        "suggester.title.recipe": "ماذا أطبخ اليوم؟",
        "suggester.title.travel": "إلى أين أذهب؟",
        "suggester.button.recipe": "اقترح وصفة",
        "suggester.button.travel": "اقترح وجهة سفر",
        "suggester.details": "عرض التفاصيل ←",
        "suggestions.title": "اقتراحات مخصصة لك",
        "suggestions.subtitle": "لنكتشف معًا، ماذا نطبخ اليوم أو إلى أين نذهب.",
        "suggester.description": "لنختر لك اقتراحًا اليوم.",
      },
      
      ru: {
        "nav.home": "ГЛАВНАЯ",
        "nav.travels": "ПУТЕШЕСТВИЯ",
        "nav.recipes": "РЕЦЕПТЫ",
        "nav.map": "КАРТА",
        "nav.contact": "КОНТАКТЫ / ПОДПИСКА",
        "nav.turkey": "Турция",
        "nav.abroad": "За границей",
        "nav.desserts": "Десерты",
        "nav.meals": "Блюда",

        "hero.title": "Открываем мир вместе",
        "hero.subtitle": "Приглашаем вас в путешествие, полное воспоминаний о наших поездках, а также сладких и солёных рецептов из нашей кухни.",
        "hero.explore": "Начать исследовать",
        "hero.title1": "Кухня, где вкус превращается в искусство",
        "hero.subtitle1": "Откройте для себя наши проверенные рецепты, приготовленные с любовью.",
        "hero.subcontent": "Встречаемся в Instagram: маршруты, советы и многое другое!",

        "features.travel.title": "По следам путешественников",
        "features.travel.desc": "Мы делимся воспоминаниями о путешествиях по миру.",
        "features.recipes.title": "Рецепты",
        "features.recipes.desc": "Откройте для себя наши блюда и десерты с пошаговыми рецептами.",
        "features.social.title": "Социальные сети",
        "features.social.desc": "Следите за нами в социальных сетях, чтобы узнавать о новых публикациях.",

        "destinations.international.title": "Международные направления",
        "destinations.international.subtitle": "Откройте для себя самые красивые и удивительные места мира",
        "destinations.turkey.title": "Направления в Турции",
        "destinations.turkey.subtitle": "Откройте для себя уникальную красоту нашей страны",
        "destinations.turkey": "Турция",
        "destinations.saudi": "Саудовская Аравия",
        "destinations.egypt": "Египет",
        "destinations.nevsehir": "Невшехир",
        "destinations.istanbul": "Стамбул",
        "destinations.cappadocia": "Каппадокия",
        "destinations.jeddah": "Джидда",
        "destinations.giza": "Гиза",

        "contact.title": "КОНТАКТЫ И ПОДПИСКА",
        "contact.subtitle": "Готовы спланировать путешествие своей мечты? Свяжитесь с нами сегодня!",
        "contact.info.title": "КОНТАКТНАЯ ИНФОРМАЦИЯ",
        "contact.info.location": "Турция",
        "contact.form.title": "Отправить сообщение",
        "contact.form.name": "Имя и фамилия *",
        "contact.form.email": "Электронная почта *",
        "contact.form.phone": "Телефон",
        "contact.form.subject": "Тема *",
        "contact.form.message": "Ваше сообщение *",
        "contact.form.newsletter": "Хочу получать новости и информацию об акциях",
        "contact.form.submit": "Отправить сообщение",
        "contact.form.name.error": "Пожалуйста, введите ваше имя.",
        "contact.form.email.error": "Введите действительный адрес электронной почты.",
        "contact.form.subject.error": "Пожалуйста, укажите тему.",
        "contact.form.message.error": "Пожалуйста, напишите сообщение.",
        "contact.form.required": "Пожалуйста, правильно заполните все обязательные поля.",
        "contact.form.noservice": "Не удалось загрузить службу электронной почты. Обновите страницу.",
        "contact.form.sending": "Отправка...",
        "contact.form.success": "Ваше сообщение успешно отправлено! Мы скоро свяжемся с вами.",
        "contact.form.error": "При отправке сообщения произошла ошибка. Попробуйте ещё раз.",

        "footer.description": "С 2026 года мы создаём незабываемые впечатления от путешествий. Путь к направлениям вашей мечты начинается здесь.",
        "footer.quick.title": "Быстрые ссылки",
        "footer.destinations.title": "Популярные направления",
        "footer.copyright": "© 2026 ÖZEN ATLAS. Все права защищены.",

        "recipes.empty": "В этой категории пока нет рецептов.",
        "recipes.ingredients": "Ингредиенты:",
        "recipes.instructions": "Приготовление:",
        "recipes.view": "Посмотреть рецепт",
        "travels.empty": "В этой категории пока нет путешествий.",
        "travels.details": "Подробнее",

        "header.title": "Наши направления",
        "header.subtitle": "Откройте для себя самые красивые места мира и создавайте незабываемые воспоминания",

        "filter.btn": "Все",
        "filter.Tr": "Турция",
        "filter.abroad": "За границей",
        "filter.all": "Все",
        "filter.desert": "Десерты",
        "filter.meal": "Блюда",
        "filter.soup": "Супы",
        "container.Tr": "Турция",
        "container.abroad": "За границей",

        "cta.title": "Присоединяйтесь к нам — спланируем путешествие вашей мечты",
        "cta.insta": "Подписаться в Instagram",

        "section.title": "Часто задаваемые вопросы",
        "section.subtitle": "Здесь вы найдёте ответы на свои вопросы",
        "question": "Что вдохновляет вас больше всего: путешествия или кухня?",
        "answer": "На самом деле, они дополняют друг друга! Местные блюда, которые я пробую во время путешествий, вдохновляют меня на эксперименты на кухне. А рецепты, которые я создаю, иногда пробуждают желание открыть новые маршруты. Вдохновение приходит и с тарелки, и с дороги.",

        "map.title": "Карта интересных мест",
        "map.subtitle": "Изучите на карте места, которые хотите посетить.",
        "map.search": "Найти место",
        "map.all": "Все места",
        "map.turkey": "Турция",
        "map.abroad": "За границей",
        "map.directions": "Построить маршрут",
        "map.location": "Посмотреть местоположение",

        "suggester.title.recipe": "Что приготовить сегодня?",
        "suggester.title.travel": "Куда отправиться?",
        "suggester.button.recipe": "Предложить рецепт",
        "suggester.button.travel": "Предложить путешествие",
        "suggester.details": "Подробнее →",
        "suggestions.title": "Персональные рекомендации для вас",
        "suggestions.subtitle": "Давайте вместе узнаем, что приготовить сегодня или куда отправиться." ,  
        "suggester.description": "Давайте подберём для вас рекомендацию на сегодня."
      },

    };
  }

  // ---------- DİL DEĞİŞTİRME ----------
  changeLanguage(lang) {
    if (!this.translations[lang]) return;
    this.lang = lang;
    localStorage.setItem("selectedLanguage", lang);
    this.applyDirection();
    this.updateLanguageUI();
    this.translatePage();
    window.dispatchEvent(
  new CustomEvent("languageChanged", { detail: { lang } })
);
  }

  applyDirection() {
    const root = document.documentElement;
    root.setAttribute("dir", this.lang === "ar" ? "rtl" : "ltr");
    root.setAttribute("lang", this.lang);
  }

  updateLanguageUI() {
    const label = document.getElementById("currentLanguage");
    if (label) {
  label.textContent = {
    tr: "TR",
    en: "EN",
    ar: "العربية",
    ru: "RU"
  }[this.lang] || "TR";
}
    document.querySelectorAll(".language-option").forEach((opt) =>
      opt.classList.toggle("active", opt.dataset.lang === this.lang));
  }

  getTranslation(key) {
    return this.translations[this.lang]?.[key] ?? this.translations.tr[key] ?? null;
  }

  // ---------- ÇEVİRİ ----------
  // root verilirse sadece o düğümün içini çevirir (sonradan eklenen kartlar/modallar için)
  translatePage(root = document) {
    this.collect(root, "[data-translate]").forEach((el) => {
      const text = this.getTranslation(el.getAttribute("data-translate"));
      if (text !== null) el.textContent = text;
    });
    this.translateDynamic(root);
  }

  collect(root, selector) {
    const list = [...root.querySelectorAll(selector)];
    if (root.nodeType === Node.ELEMENT_NODE && root.matches(selector)) list.unshift(root);
    return list;
  }

  async translateDynamic(root = document) {
    const lang = this.lang;
    const elements = this.collect(root, ".dyn");

    await Promise.all(elements.map(async (el) => {
      if (el.dataset.orig === undefined) el.dataset.orig = el.textContent; // Türkçe orijinal
      const original = el.dataset.orig;
      if (lang === "tr") {
        el.textContent = original;
        return;
      }
      const translated = await this.translateBlock(original, lang);
      if (this.lang === lang) el.textContent = translated; // arada dil değiştiyse eskiyi yazma
    }));
  }

  async translateBlock(text, lang) {
    const lines = await Promise.all(text.split("\n").map((line) => this.translateLine(line, lang)));
    return lines.join("\n");
  }

  async translateLine(line, lang) {
    if (!/\p{L}/u.test(line)) return line; // sadece sayı/işaret ise çevirme
    const parts = await Promise.all(this.chunk(line, 450).map((c) => this.translateText(c, lang)));
    return parts.join(" ");
  }

  // MyMemory 500 karakter sınırı: önce cümlelere, çok uzun cümleleri kelimelere böl
  chunk(text, max) {
    if (text.length <= max) return [text];

    const pieces = [];
    for (const sentence of text.split(/(?<=[.!?])\s+/)) {
      if (sentence.length <= max) { pieces.push(sentence); continue; }
      let cur = "";
      for (const word of sentence.split(/\s+/)) {
        if (cur && (cur + " " + word).length > max) { pieces.push(cur); cur = word; }
        else cur = cur ? cur + " " + word : word;
      }
      if (cur) pieces.push(cur);
    }

    const chunks = [];
    let current = "";
    for (const piece of pieces) {
      if (current && (current + " " + piece).length > max) { chunks.push(current); current = piece; }
      else current = current ? current + " " + piece : piece;
    }
    if (current) chunks.push(current);
    return chunks;
  }

  async translateText(text, lang) {
    const key = `${lang}|${text}`;
    if (this.cache.has(key)) return this.cache.get(key);

    const result = (await this.limited(() => this.tryGoogle(text, lang)))
      || (await this.limited(() => this.tryMyMemory(text, lang)));

    if (!result) return text; // başarısızsa Türkçe kalsın (önbelleğe yazma)
    this.cache.set(key, result);
    this.saveCache();
    return result;
  }

  // aynı anda en fazla 4 istek
  async limited(fn) {
    while (this.active >= 4) await new Promise((r) => setTimeout(r, 50));
    this.active++;
    try { return await fn(); } finally { this.active--; }
  }

  // zaman aşımlı fetch → JSON (hata olursa null)
  async fetchJSON(url) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      return res.ok ? await res.json() : null;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  async tryGoogle(text, lang) {
    try {
      const target = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=tr&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
      const wrapped = await this.fetchJSON(`https://api.allorigins.win/get?url=${encodeURIComponent(target)}`);
      if (!wrapped?.contents) return null;
      const data = JSON.parse(wrapped.contents);
      return data[0].map((seg) => seg[0]).join("") || null; // tüm parçaları birleştir
    } catch { return null; }
  }

  async tryMyMemory(text, lang) {
    const data = await this.fetchJSON(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=tr|${lang}`);
    if (!data || Number(data.responseStatus) !== 200) return null;
    const out = data.responseData?.translatedText;
    // günlük kota dolunca uyarı metnini çeviri diye göstermeyelim
    if (!out || /MYMEMORY WARNING/i.test(out)) return null;
    return out;
  }

  // ---------- ÖNBELLEK ----------
  loadCache() {
    try { return new Map(JSON.parse(localStorage.getItem(CACHE_KEY)) || []); } catch { return new Map(); }
  }

  saveCache() {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      // en eski kayıtları at (Map ekleme sırasını korur)
      while (this.cache.size > CACHE_LIMIT) this.cache.delete(this.cache.keys().next().value);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify([...this.cache])); } catch { /* kota dolu */ }
    }, 500);
  }

  // JS ile sonradan eklenen kartlar/modallar için: sadece eklenen düğümleri çevir
  observeContentChanges() {
    const pending = new Set();
    new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const n of m.addedNodes) {
          if (n.nodeType === Node.ELEMENT_NODE &&
              (n.matches("[data-translate], .dyn") || n.querySelector("[data-translate], .dyn"))) {
            pending.add(n);
          }
        }
      }
      if (!pending.size) return;
      clearTimeout(this.observerTimer);
      this.observerTimer = setTimeout(() => {
        const nodes = [...pending];
        pending.clear();
        nodes.forEach((n) => n.isConnected && this.translatePage(n));
      }, 100);
    }).observe(document.body, { childList: true, subtree: true });
  }
}

// defer ile yüklense de yüklenmese de güvenli başlat
function startTranslation() {
  window.translationSystem = new TranslationSystem();
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startTranslation);
} else {
  startTranslation();
}

function changeLanguage(lang) {
  window.translationSystem?.changeLanguage(lang);
}