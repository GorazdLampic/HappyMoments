/**
 * HappyMoments — Internationalization (i18n)
 * Supports 10 languages with locale-aware formatting.
 */

const I18N = (() => {
    const SUPPORTED_LOCALES = ['en', 'es', 'de', 'pt', 'it', 'fr', 'hr', 'sl', 'nl', 'pl'];
    const LOCALE_NAMES = {
        en: 'English', es: 'Español', de: 'Deutsch', pt: 'Português',
        it: 'Italiano', fr: 'Français', hr: 'Hrvatski', sl: 'Slovenščina',
        nl: 'Nederlands', pl: 'Polski'
    };

    let currentLocale = 'en';
    let strings = {};

    // UI string translations
    const TRANSLATIONS = {
        en: {
            // Tabs
            tab_personal: 'Personal',
            tab_team: 'Team',
            tab_data: 'Data',
            tab_settings: 'Settings',
            // Header
            tagline: 'The poetry of numbers in your life, revealed.',
            // Onboarding
            welcome: 'Welcome',
            onboarding_text: 'Enter a date that matters to you. Your birthday, an anniversary, the day you met someone, when you started a new chapter. Any moment worth remembering.',
            what_is_this: 'What is this moment?',
            when_happened: 'When did it happen?',
            discover: 'Discover My Milestones',
            onboarding_hint: 'You can add more people and dates afterward.',
            // Milestones
            upcoming_milestones: 'Upcoming Milestones',
            highlights: 'Highlights',
            refresh: 'Refresh',
            no_milestones: 'No milestones found.',
            beyond_horizon: 'beyond the horizon...',
            closer_view: 'closer view',
            // Share
            share: 'Share',
            share_tap: 'Tap a milestone above, then share or save to calendar.',
            copy: 'Copy',
            save_to_calendar: 'Save to calendar:',
            // Card
            create_card: 'Create a Card',
            card_desc: 'Generate a shareable image card for this milestone.',
            download_png: 'Download PNG',
            share_image: 'Share Image',
            // Gift
            celebrate_gift: 'Celebrate with a Gift',
            gift_desc: 'Turn this milestone into something tangible. Select a milestone above to see personalized gift ideas.',
            select_milestone_gift: 'Select a milestone to see gift options.',
            order_now: 'Order Now',
            cancel: 'Cancel',
            // Combined/Team
            combined_milestones: 'Team Milestones',
            combined_desc: 'Combined milestones for everyone in the group — when your ages, time together, or ratios reach special numbers.',
            share_this_moment: 'Share This Moment',
            share_combined_desc: 'Share a combined milestone with those involved!',
            // Data tab
            dates_events: 'Dates & Events',
            data_desc: 'Add birthdays, anniversaries, and any meaningful date to track.',
            add_date: 'Add a Date',
            groups: 'Groups',
            groups_desc: 'Organize dates into separate groups. Each group has its own milestones.',
            backup: 'Backup',
            export_data: 'Export Data',
            import_data: 'Import Data',
            // Settings
            number_patterns: 'Number Patterns',
            round_numbers: 'Round Numbers (1000, 5000...)',
            repdigits: 'Repdigits (111, 2222...)',
            alternating: 'Alternating (1212, 737373...)',
            palindromes: 'Palindromes (12321...)',
            sequential: 'Sequential (123, 4321...)',
            scientific: 'Scientific (Pi, e, Phi)',
            lucky_patterns: 'My Lucky Digit Patterns',
            lucky_digits: 'Lucky Digits',
            custom_numbers: 'Custom Numbers',
            quick_add: 'Quick add:',
            appearance: 'Appearance',
            dark_mode: 'Dark Mode',
            save_settings: 'Save Settings',
            reset_all: 'Reset All Data',
            // Types
            type_birthday: 'Birthday',
            type_event: 'Date / Event',
            type_milestone: 'Milestone',
            // Time units
            unit_sec: 'sec',
            unit_min: 'min',
            unit_hrs: 'hrs',
            unit_d: 'd',
            unit_w: 'w',
            unit_mo: 'mo',
            unit_y: 'y',
            // Misc
            edit_event: 'Edit Event',
            save: 'Save',
            delete: 'Delete',
            name: 'Name',
            type: 'Type',
            date: 'Date',
            notes: 'Notes',
            turns: 'Turns',
            terms_privacy: 'Terms & Privacy',
            // Footer
            copyright: 'HappyMoments © 2026 Quantum Wave Ltd',
            // Consent
            consent_text: 'HappyMoments stores your dates and preferences locally on your device. No data is sent to any server.',
            consent_ok: 'OK, got it',
            consent_read: 'Read full policy',
        },

        es: {
            tab_personal: 'Personal', tab_team: 'Equipo', tab_data: 'Datos', tab_settings: 'Ajustes',
            tagline: 'La poesía de los números en tu vida, revelada.',
            welcome: 'Bienvenido',
            onboarding_text: 'Ingresa una fecha que sea importante para ti. Tu cumpleaños, un aniversario, el día que conociste a alguien, cuando empezaste un nuevo capítulo.',
            what_is_this: '¿Qué momento es este?', when_happened: '¿Cuándo ocurrió?',
            discover: 'Descubrir mis Hitos', onboarding_hint: 'Puedes agregar más personas y fechas después.',
            upcoming_milestones: 'Próximos Hitos', highlights: 'Destacados', refresh: 'Actualizar',
            no_milestones: 'No se encontraron hitos.', beyond_horizon: 'más allá del horizonte...', closer_view: 'vista cercana',
            share: 'Compartir', share_tap: 'Toca un hito arriba para compartir o guardar en el calendario.',
            copy: 'Copiar', save_to_calendar: 'Guardar en calendario:',
            create_card: 'Crear Tarjeta', card_desc: 'Genera una tarjeta de imagen para compartir este hito.',
            download_png: 'Descargar PNG', share_image: 'Compartir Imagen',
            celebrate_gift: 'Celebra con un Regalo', gift_desc: 'Convierte este hito en algo tangible.',
            select_milestone_gift: 'Selecciona un hito para ver opciones de regalo.',
            order_now: 'Pedir Ahora', cancel: 'Cancelar',
            combined_milestones: 'Hitos de Equipo', combined_desc: 'Hitos combinados para todos en el grupo.',
            share_this_moment: 'Comparte Este Momento', share_combined_desc: '¡Comparte un hito combinado!',
            dates_events: 'Fechas y Eventos', data_desc: 'Agrega cumpleaños, aniversarios y cualquier fecha significativa.',
            add_date: 'Agregar Fecha', groups: 'Grupos', groups_desc: 'Organiza fechas en grupos separados.',
            backup: 'Respaldo', export_data: 'Exportar Datos', import_data: 'Importar Datos',
            number_patterns: 'Patrones Numéricos', round_numbers: 'Números Redondos (1000, 5000...)',
            repdigits: 'Repdigitos (111, 2222...)', alternating: 'Alternantes (1212, 737373...)',
            palindromes: 'Palíndromos (12321...)', sequential: 'Secuenciales (123, 4321...)',
            scientific: 'Científicos (Pi, e, Phi)', lucky_patterns: 'Mis Patrones de Dígitos de la Suerte',
            lucky_digits: 'Dígitos de la Suerte', custom_numbers: 'Números Personalizados', quick_add: 'Agregar rápido:',
            appearance: 'Apariencia', dark_mode: 'Modo Oscuro', save_settings: 'Guardar Ajustes', reset_all: 'Restablecer Todo',
            type_birthday: 'Cumpleaños', type_event: 'Fecha / Evento', type_milestone: 'Hito',
            unit_sec: 'seg', unit_min: 'min', unit_hrs: 'hrs', unit_d: 'd', unit_w: 'sem', unit_mo: 'mes', unit_y: 'año',
            edit_event: 'Editar Evento', save: 'Guardar', delete: 'Eliminar',
            name: 'Nombre', type: 'Tipo', date: 'Fecha', notes: 'Notas', turns: 'Cumple',
            terms_privacy: 'Términos y Privacidad', copyright: 'HappyMoments © 2026 Quantum Wave Ltd',
            consent_text: 'HappyMoments almacena tus datos localmente en tu dispositivo. No se envían datos a ningún servidor.',
            consent_ok: 'Entendido', consent_read: 'Leer política completa',
        },

        de: {
            tab_personal: 'Persönlich', tab_team: 'Team', tab_data: 'Daten', tab_settings: 'Einstellungen',
            tagline: 'Die Poesie der Zahlen in deinem Leben, enthüllt.',
            welcome: 'Willkommen',
            onboarding_text: 'Gib ein Datum ein, das dir wichtig ist. Dein Geburtstag, ein Jahrestag, der Tag, an dem du jemanden kennengelernt hast.',
            what_is_this: 'Was ist dieser Moment?', when_happened: 'Wann war es?',
            discover: 'Meine Meilensteine entdecken', onboarding_hint: 'Du kannst danach weitere Personen und Daten hinzufügen.',
            upcoming_milestones: 'Kommende Meilensteine', highlights: 'Highlights', refresh: 'Aktualisieren',
            no_milestones: 'Keine Meilensteine gefunden.', beyond_horizon: 'hinter dem Horizont...', closer_view: 'näher betrachten',
            share: 'Teilen', share_tap: 'Tippe oben auf einen Meilenstein zum Teilen oder Speichern.',
            copy: 'Kopieren', save_to_calendar: 'Im Kalender speichern:',
            create_card: 'Karte erstellen', card_desc: 'Erstelle eine teilbare Bildkarte für diesen Meilenstein.',
            download_png: 'PNG herunterladen', share_image: 'Bild teilen',
            celebrate_gift: 'Mit einem Geschenk feiern', gift_desc: 'Mach diesen Meilenstein greifbar.',
            select_milestone_gift: 'Wähle einen Meilenstein für Geschenkideen.',
            order_now: 'Jetzt bestellen', cancel: 'Abbrechen',
            combined_milestones: 'Team-Meilensteine', combined_desc: 'Gemeinsame Meilensteine für alle in der Gruppe.',
            share_this_moment: 'Diesen Moment teilen', share_combined_desc: 'Teile einen gemeinsamen Meilenstein!',
            dates_events: 'Daten & Ereignisse', data_desc: 'Füge Geburtstage, Jahrestage und andere wichtige Daten hinzu.',
            add_date: 'Datum hinzufügen', groups: 'Gruppen', groups_desc: 'Organisiere Daten in separate Gruppen.',
            backup: 'Sicherung', export_data: 'Daten exportieren', import_data: 'Daten importieren',
            number_patterns: 'Zahlenmuster', round_numbers: 'Runde Zahlen (1000, 5000...)',
            repdigits: 'Schnapszahlen (111, 2222...)', alternating: 'Alternierend (1212, 737373...)',
            palindromes: 'Palindrome (12321...)', sequential: 'Sequenziell (123, 4321...)',
            scientific: 'Wissenschaftlich (Pi, e, Phi)', lucky_patterns: 'Meine Glücksziffernmuster',
            lucky_digits: 'Glücksziffern', custom_numbers: 'Eigene Zahlen', quick_add: 'Schnell hinzufügen:',
            appearance: 'Darstellung', dark_mode: 'Dunkelmodus', save_settings: 'Einstellungen speichern', reset_all: 'Alles zurücksetzen',
            type_birthday: 'Geburtstag', type_event: 'Datum / Ereignis', type_milestone: 'Meilenstein',
            unit_sec: 'Sek', unit_min: 'Min', unit_hrs: 'Std', unit_d: 'T', unit_w: 'W', unit_mo: 'Mo', unit_y: 'J',
            edit_event: 'Ereignis bearbeiten', save: 'Speichern', delete: 'Löschen',
            name: 'Name', type: 'Typ', date: 'Datum', notes: 'Notizen', turns: 'Wird',
            terms_privacy: 'AGB & Datenschutz', copyright: 'HappyMoments © 2026 Quantum Wave Ltd',
            consent_text: 'HappyMoments speichert deine Daten lokal auf deinem Gerät. Es werden keine Daten an Server gesendet.',
            consent_ok: 'Verstanden', consent_read: 'Vollständige Richtlinie lesen',
        },

        pt: {
            tab_personal: 'Pessoal', tab_team: 'Equipa', tab_data: 'Dados', tab_settings: 'Definições',
            tagline: 'A poesia dos números na sua vida, revelada.',
            welcome: 'Bem-vindo',
            onboarding_text: 'Insira uma data importante para si. O seu aniversário, uma data especial, o dia em que conheceu alguém.',
            what_is_this: 'Que momento é este?', when_happened: 'Quando aconteceu?',
            discover: 'Descobrir os Meus Marcos', onboarding_hint: 'Pode adicionar mais pessoas e datas depois.',
            upcoming_milestones: 'Próximos Marcos', highlights: 'Destaques', refresh: 'Atualizar',
            no_milestones: 'Nenhum marco encontrado.', beyond_horizon: 'além do horizonte...', closer_view: 'vista próxima',
            share: 'Partilhar', share_tap: 'Toque num marco acima para partilhar ou guardar no calendário.',
            copy: 'Copiar', save_to_calendar: 'Guardar no calendário:',
            create_card: 'Criar Cartão', card_desc: 'Gere um cartão de imagem partilhável para este marco.',
            download_png: 'Descarregar PNG', share_image: 'Partilhar Imagem',
            celebrate_gift: 'Celebre com uma Prenda', gift_desc: 'Transforme este marco em algo tangível.',
            select_milestone_gift: 'Selecione um marco para ver opções de prenda.',
            order_now: 'Encomendar Agora', cancel: 'Cancelar',
            combined_milestones: 'Marcos de Equipa', combined_desc: 'Marcos combinados para todos no grupo.',
            share_this_moment: 'Partilhar Este Momento', share_combined_desc: 'Partilhe um marco combinado!',
            dates_events: 'Datas e Eventos', data_desc: 'Adicione aniversários e qualquer data significativa.',
            add_date: 'Adicionar Data', groups: 'Grupos', groups_desc: 'Organize datas em grupos separados.',
            backup: 'Cópia de Segurança', export_data: 'Exportar Dados', import_data: 'Importar Dados',
            number_patterns: 'Padrões Numéricos', round_numbers: 'Números Redondos',
            repdigits: 'Repdigitos', alternating: 'Alternados', palindromes: 'Palíndromos',
            sequential: 'Sequenciais', scientific: 'Científicos', lucky_patterns: 'Meus Padrões da Sorte',
            lucky_digits: 'Dígitos da Sorte', custom_numbers: 'Números Personalizados', quick_add: 'Adicionar rápido:',
            appearance: 'Aparência', dark_mode: 'Modo Escuro', save_settings: 'Guardar Definições', reset_all: 'Repor Tudo',
            type_birthday: 'Aniversário', type_event: 'Data / Evento', type_milestone: 'Marco',
            unit_sec: 'seg', unit_min: 'min', unit_hrs: 'hrs', unit_d: 'd', unit_w: 'sem', unit_mo: 'mês', unit_y: 'ano',
            edit_event: 'Editar Evento', save: 'Guardar', delete: 'Eliminar',
            name: 'Nome', type: 'Tipo', date: 'Data', notes: 'Notas', turns: 'Faz',
            terms_privacy: 'Termos e Privacidade', copyright: 'HappyMoments © 2026 Quantum Wave Ltd',
            consent_text: 'HappyMoments armazena os seus dados localmente. Nenhum dado é enviado para servidores.',
            consent_ok: 'Entendido', consent_read: 'Ler política completa',
        },

        it: {
            tab_personal: 'Personale', tab_team: 'Squadra', tab_data: 'Dati', tab_settings: 'Impostazioni',
            tagline: 'La poesia dei numeri nella tua vita, svelata.',
            welcome: 'Benvenuto',
            onboarding_text: 'Inserisci una data che conta per te. Il tuo compleanno, un anniversario, il giorno in cui hai conosciuto qualcuno.',
            what_is_this: 'Che momento è questo?', when_happened: 'Quando è successo?',
            discover: 'Scopri i Miei Traguardi', onboarding_hint: 'Puoi aggiungere altre persone e date dopo.',
            upcoming_milestones: 'Prossimi Traguardi', highlights: 'In Evidenza', refresh: 'Aggiorna',
            no_milestones: 'Nessun traguardo trovato.', beyond_horizon: 'oltre l\'orizzonte...', closer_view: 'vista ravvicinata',
            share: 'Condividi', share_tap: 'Tocca un traguardo sopra per condividere o salvare nel calendario.',
            copy: 'Copia', save_to_calendar: 'Salva nel calendario:',
            create_card: 'Crea Cartolina', card_desc: 'Genera un\'immagine condivisibile per questo traguardo.',
            download_png: 'Scarica PNG', share_image: 'Condividi Immagine',
            celebrate_gift: 'Festeggia con un Regalo', gift_desc: 'Trasforma questo traguardo in qualcosa di tangibile.',
            select_milestone_gift: 'Seleziona un traguardo per idee regalo.',
            order_now: 'Ordina Ora', cancel: 'Annulla',
            combined_milestones: 'Traguardi di Squadra', combined_desc: 'Traguardi combinati per tutti nel gruppo.',
            share_this_moment: 'Condividi Questo Momento', share_combined_desc: 'Condividi un traguardo combinato!',
            dates_events: 'Date ed Eventi', data_desc: 'Aggiungi compleanni, anniversari e qualsiasi data significativa.',
            add_date: 'Aggiungi Data', groups: 'Gruppi', groups_desc: 'Organizza le date in gruppi separati.',
            backup: 'Backup', export_data: 'Esporta Dati', import_data: 'Importa Dati',
            number_patterns: 'Schemi Numerici', round_numbers: 'Numeri Tondi', repdigits: 'Repdigit',
            alternating: 'Alternati', palindromes: 'Palindromi', sequential: 'Sequenziali',
            scientific: 'Scientifici', lucky_patterns: 'I Miei Schemi Fortunati',
            lucky_digits: 'Cifre Fortunate', custom_numbers: 'Numeri Personalizzati', quick_add: 'Aggiungi rapido:',
            appearance: 'Aspetto', dark_mode: 'Modalità Scura', save_settings: 'Salva Impostazioni', reset_all: 'Reimposta Tutto',
            type_birthday: 'Compleanno', type_event: 'Data / Evento', type_milestone: 'Traguardo',
            unit_sec: 'sec', unit_min: 'min', unit_hrs: 'ore', unit_d: 'g', unit_w: 'sett', unit_mo: 'mese', unit_y: 'anno',
            edit_event: 'Modifica Evento', save: 'Salva', delete: 'Elimina',
            name: 'Nome', type: 'Tipo', date: 'Data', notes: 'Note', turns: 'Compie',
            terms_privacy: 'Termini e Privacy', copyright: 'HappyMoments © 2026 Quantum Wave Ltd',
            consent_text: 'HappyMoments salva i tuoi dati localmente sul dispositivo. Nessun dato viene inviato a server.',
            consent_ok: 'Ho capito', consent_read: 'Leggi informativa completa',
        },

        fr: {
            tab_personal: 'Personnel', tab_team: 'Équipe', tab_data: 'Données', tab_settings: 'Paramètres',
            tagline: 'La poésie des nombres dans votre vie, révélée.',
            welcome: 'Bienvenue',
            onboarding_text: 'Entrez une date qui compte pour vous. Votre anniversaire, une date spéciale, le jour où vous avez rencontré quelqu\'un.',
            what_is_this: 'Quel est ce moment ?', when_happened: 'Quand est-ce arrivé ?',
            discover: 'Découvrir Mes Jalons', onboarding_hint: 'Vous pouvez ajouter d\'autres personnes et dates ensuite.',
            upcoming_milestones: 'Prochains Jalons', highlights: 'À la une', refresh: 'Actualiser',
            no_milestones: 'Aucun jalon trouvé.', beyond_horizon: 'au-delà de l\'horizon...', closer_view: 'vue rapprochée',
            share: 'Partager', share_tap: 'Touchez un jalon ci-dessus pour partager ou sauvegarder.',
            copy: 'Copier', save_to_calendar: 'Sauvegarder au calendrier :',
            create_card: 'Créer une Carte', card_desc: 'Générez une image partageable pour ce jalon.',
            download_png: 'Télécharger PNG', share_image: 'Partager l\'Image',
            celebrate_gift: 'Célébrez avec un Cadeau', gift_desc: 'Transformez ce jalon en quelque chose de tangible.',
            select_milestone_gift: 'Sélectionnez un jalon pour voir les idées cadeaux.',
            order_now: 'Commander', cancel: 'Annuler',
            combined_milestones: 'Jalons d\'Équipe', combined_desc: 'Jalons combinés pour tout le groupe.',
            share_this_moment: 'Partager Ce Moment', share_combined_desc: 'Partagez un jalon combiné !',
            dates_events: 'Dates et Événements', data_desc: 'Ajoutez anniversaires et dates significatives.',
            add_date: 'Ajouter une Date', groups: 'Groupes', groups_desc: 'Organisez les dates en groupes.',
            backup: 'Sauvegarde', export_data: 'Exporter', import_data: 'Importer',
            number_patterns: 'Motifs Numériques', round_numbers: 'Nombres Ronds', repdigits: 'Repdigits',
            alternating: 'Alternés', palindromes: 'Palindromes', sequential: 'Séquentiels',
            scientific: 'Scientifiques', lucky_patterns: 'Mes Motifs Porte-Bonheur',
            lucky_digits: 'Chiffres Porte-Bonheur', custom_numbers: 'Nombres Personnalisés', quick_add: 'Ajout rapide :',
            appearance: 'Apparence', dark_mode: 'Mode Sombre', save_settings: 'Sauvegarder', reset_all: 'Tout Réinitialiser',
            type_birthday: 'Anniversaire', type_event: 'Date / Événement', type_milestone: 'Jalon',
            unit_sec: 'sec', unit_min: 'min', unit_hrs: 'h', unit_d: 'j', unit_w: 'sem', unit_mo: 'mois', unit_y: 'an',
            edit_event: 'Modifier', save: 'Sauvegarder', delete: 'Supprimer',
            name: 'Nom', type: 'Type', date: 'Date', notes: 'Notes', turns: 'Aura',
            terms_privacy: 'Conditions et Confidentialité', copyright: 'HappyMoments © 2026 Quantum Wave Ltd',
            consent_text: 'HappyMoments stocke vos données localement sur votre appareil. Aucune donnée n\'est envoyée.',
            consent_ok: 'Compris', consent_read: 'Lire la politique complète',
        },

        hr: {
            tab_personal: 'Osobno', tab_team: 'Tim', tab_data: 'Podaci', tab_settings: 'Postavke',
            tagline: 'Poezija brojeva u vašem životu, otkrivena.',
            welcome: 'Dobrodošli',
            onboarding_text: 'Unesite datum koji vam je važan. Vaš rođendan, godišnjica, dan kad ste nekoga upoznali.',
            what_is_this: 'Koji je to trenutak?', when_happened: 'Kada se dogodilo?',
            discover: 'Otkrij moje prekretnice', onboarding_hint: 'Možete dodati još osoba i datuma nakon toga.',
            upcoming_milestones: 'Nadolazeće prekretnice', highlights: 'Izdvojeno', refresh: 'Osvježi',
            no_milestones: 'Nema pronađenih prekretnica.', beyond_horizon: 'iza horizonta...', closer_view: 'bliži pogled',
            share: 'Podijeli', share_tap: 'Dodirnite pretekretnicu iznad za dijeljenje ili spremanje.',
            copy: 'Kopiraj', save_to_calendar: 'Spremi u kalendar:',
            create_card: 'Stvori karticu', card_desc: 'Generirajte sliku za dijeljenje ovog trenutka.',
            download_png: 'Preuzmi PNG', share_image: 'Podijeli sliku',
            celebrate_gift: 'Proslavite poklonom', gift_desc: 'Pretvorite ovu prekretnicu u nešto opipljivo.',
            select_milestone_gift: 'Odaberite prekretnicu za ideje za poklon.',
            order_now: 'Naruči', cancel: 'Odustani',
            combined_milestones: 'Timske prekretnice', combined_desc: 'Kombinirane prekretnice za sve u grupi.',
            share_this_moment: 'Podijeli ovaj trenutak', share_combined_desc: 'Podijelite kombiniranu prekretnicu!',
            dates_events: 'Datumi i događaji', data_desc: 'Dodajte rođendane, godišnjice i važne datume.',
            add_date: 'Dodaj datum', groups: 'Grupe', groups_desc: 'Organizirajte datume u grupe.',
            backup: 'Sigurnosna kopija', export_data: 'Izvezi podatke', import_data: 'Uvezi podatke',
            number_patterns: 'Uzorci brojeva', round_numbers: 'Okrugli brojevi', repdigits: 'Repdigiti',
            alternating: 'Izmjenični', palindromes: 'Palindromi', sequential: 'Sekvencijalni',
            scientific: 'Znanstveni', lucky_patterns: 'Moji sretni uzorci',
            lucky_digits: 'Sretne znamenke', custom_numbers: 'Prilagođeni brojevi', quick_add: 'Brzo dodaj:',
            appearance: 'Izgled', dark_mode: 'Tamni način', save_settings: 'Spremi postavke', reset_all: 'Resetiraj sve',
            type_birthday: 'Rođendan', type_event: 'Datum / Događaj', type_milestone: 'Prekretnica',
            unit_sec: 'sek', unit_min: 'min', unit_hrs: 'sati', unit_d: 'd', unit_w: 'tj', unit_mo: 'mj', unit_y: 'god',
            edit_event: 'Uredi događaj', save: 'Spremi', delete: 'Obriši',
            name: 'Ime', type: 'Vrsta', date: 'Datum', notes: 'Bilješke', turns: 'Puni',
            terms_privacy: 'Uvjeti i Privatnost', copyright: 'HappyMoments © 2026 Quantum Wave Ltd',
            consent_text: 'HappyMoments sprema vaše podatke lokalno na uređaju. Nikakvi podaci se ne šalju na poslužitelj.',
            consent_ok: 'U redu', consent_read: 'Pročitaj cijelu politiku',
        },

        sl: {
            tab_personal: 'Osebno', tab_team: 'Ekipa', tab_data: 'Podatki', tab_settings: 'Nastavitve',
            tagline: 'Poezija števil v vašem življenju, razkrita.',
            welcome: 'Dobrodošli',
            onboarding_text: 'Vnesite datum, ki vam je pomemben. Vaš rojstni dan, obletnica, dan, ko ste nekoga spoznali.',
            what_is_this: 'Kateri trenutek je to?', when_happened: 'Kdaj se je zgodilo?',
            discover: 'Odkrij moje mejnike', onboarding_hint: 'Kasneje lahko dodate več oseb in datumov.',
            upcoming_milestones: 'Prihajajoči mejniki', highlights: 'Poudarki', refresh: 'Osveži',
            no_milestones: 'Ni najdenih mejnikov.', beyond_horizon: 'onkraj obzorja...', closer_view: 'bližji pogled',
            share: 'Deli', share_tap: 'Tapnite mejnik zgoraj za deljenje ali shranjevanje.',
            copy: 'Kopiraj', save_to_calendar: 'Shrani v koledar:',
            create_card: 'Ustvari kartico', card_desc: 'Ustvarite sliko za deljenje tega mejnika.',
            download_png: 'Prenesi PNG', share_image: 'Deli sliko',
            celebrate_gift: 'Praznujte z darilom', gift_desc: 'Spremenite ta mejnik v nekaj oprijemljivega.',
            select_milestone_gift: 'Izberite mejnik za ideje za darila.',
            order_now: 'Naroči', cancel: 'Prekliči',
            combined_milestones: 'Ekipni mejniki', combined_desc: 'Kombinirani mejniki za vse v skupini.',
            share_this_moment: 'Deli ta trenutek', share_combined_desc: 'Delite kombiniran mejnik!',
            dates_events: 'Datumi in dogodki', data_desc: 'Dodajte rojstne dneve, obletnice in pomembne datume.',
            add_date: 'Dodaj datum', groups: 'Skupine', groups_desc: 'Organizirajte datume v ločene skupine.',
            backup: 'Varnostna kopija', export_data: 'Izvozi podatke', import_data: 'Uvozi podatke',
            number_patterns: 'Vzorci števil', round_numbers: 'Okrogla števila', repdigits: 'Repdigiti',
            alternating: 'Izmenični', palindromes: 'Palindromi', sequential: 'Zaporedni',
            scientific: 'Znanstveni', lucky_patterns: 'Moji srečni vzorci',
            lucky_digits: 'Srečne številke', custom_numbers: 'Lastna števila', quick_add: 'Hitro dodaj:',
            appearance: 'Videz', dark_mode: 'Temni način', save_settings: 'Shrani nastavitve', reset_all: 'Ponastavi vse',
            type_birthday: 'Rojstni dan', type_event: 'Datum / Dogodek', type_milestone: 'Mejnik',
            unit_sec: 'sek', unit_min: 'min', unit_hrs: 'ur', unit_d: 'd', unit_w: 'ted', unit_mo: 'mes', unit_y: 'let',
            edit_event: 'Uredi dogodek', save: 'Shrani', delete: 'Izbriši',
            name: 'Ime', type: 'Vrsta', date: 'Datum', notes: 'Opombe', turns: 'Dopolni',
            terms_privacy: 'Pogoji in Zasebnost', copyright: 'HappyMoments © 2026 Quantum Wave Ltd',
            consent_text: 'HappyMoments shranjuje vaše podatke lokalno na napravi. Nobeni podatki se ne pošiljajo na strežnik.',
            consent_ok: 'V redu', consent_read: 'Preberi celotno politiko',
        },

        nl: {
            tab_personal: 'Persoonlijk', tab_team: 'Team', tab_data: 'Gegevens', tab_settings: 'Instellingen',
            tagline: 'De poëzie van getallen in je leven, onthuld.',
            welcome: 'Welkom',
            onboarding_text: 'Voer een datum in die belangrijk voor je is. Je verjaardag, een jubileum, de dag dat je iemand ontmoette.',
            what_is_this: 'Wat voor moment is dit?', when_happened: 'Wanneer was het?',
            discover: 'Ontdek Mijn Mijlpalen', onboarding_hint: 'Je kunt later meer personen en data toevoegen.',
            upcoming_milestones: 'Komende Mijlpalen', highlights: 'Hoogtepunten', refresh: 'Vernieuwen',
            no_milestones: 'Geen mijlpalen gevonden.', beyond_horizon: 'voorbij de horizon...', closer_view: 'dichterbij',
            share: 'Delen', share_tap: 'Tik op een mijlpaal hierboven om te delen of op te slaan.',
            copy: 'Kopiëren', save_to_calendar: 'Opslaan in agenda:',
            create_card: 'Kaart Maken', card_desc: 'Maak een deelbare afbeelding voor deze mijlpaal.',
            download_png: 'PNG Downloaden', share_image: 'Afbeelding Delen',
            celebrate_gift: 'Vier het met een Cadeau', gift_desc: 'Maak van deze mijlpaal iets tastbaars.',
            select_milestone_gift: 'Selecteer een mijlpaal voor cadeau-ideeën.',
            order_now: 'Nu Bestellen', cancel: 'Annuleren',
            combined_milestones: 'Team Mijlpalen', combined_desc: 'Gecombineerde mijlpalen voor iedereen in de groep.',
            share_this_moment: 'Deel Dit Moment', share_combined_desc: 'Deel een gecombineerde mijlpaal!',
            dates_events: 'Data & Gebeurtenissen', data_desc: 'Voeg verjaardagen, jubilea en belangrijke data toe.',
            add_date: 'Datum Toevoegen', groups: 'Groepen', groups_desc: 'Organiseer data in aparte groepen.',
            backup: 'Back-up', export_data: 'Exporteren', import_data: 'Importeren',
            number_patterns: 'Getalpatronen', round_numbers: 'Ronde Getallen', repdigits: 'Repdigits',
            alternating: 'Afwisselend', palindromes: 'Palindromen', sequential: 'Opeenvolgend',
            scientific: 'Wetenschappelijk', lucky_patterns: 'Mijn Gelukspatronen',
            lucky_digits: 'Gelukscijfers', custom_numbers: 'Eigen Getallen', quick_add: 'Snel toevoegen:',
            appearance: 'Uiterlijk', dark_mode: 'Donkere Modus', save_settings: 'Opslaan', reset_all: 'Alles Resetten',
            type_birthday: 'Verjaardag', type_event: 'Datum / Gebeurtenis', type_milestone: 'Mijlpaal',
            unit_sec: 'sec', unit_min: 'min', unit_hrs: 'uur', unit_d: 'd', unit_w: 'w', unit_mo: 'mnd', unit_y: 'jr',
            edit_event: 'Bewerken', save: 'Opslaan', delete: 'Verwijderen',
            name: 'Naam', type: 'Type', date: 'Datum', notes: 'Notities', turns: 'Wordt',
            terms_privacy: 'Voorwaarden & Privacy', copyright: 'HappyMoments © 2026 Quantum Wave Ltd',
            consent_text: 'HappyMoments slaat je gegevens lokaal op je apparaat op. Er worden geen gegevens naar servers verstuurd.',
            consent_ok: 'Begrepen', consent_read: 'Lees volledig beleid',
        },

        pl: {
            tab_personal: 'Osobiste', tab_team: 'Zespół', tab_data: 'Dane', tab_settings: 'Ustawienia',
            tagline: 'Poezja liczb w Twoim życiu, odkryta.',
            welcome: 'Witaj',
            onboarding_text: 'Wpisz datę, która jest dla Ciebie ważna. Twoje urodziny, rocznica, dzień poznania kogoś.',
            what_is_this: 'Jaki to moment?', when_happened: 'Kiedy to było?',
            discover: 'Odkryj moje kamienie milowe', onboarding_hint: 'Później możesz dodać więcej osób i dat.',
            upcoming_milestones: 'Nadchodzące kamienie milowe', highlights: 'Najważniejsze', refresh: 'Odśwież',
            no_milestones: 'Nie znaleziono kamieni milowych.', beyond_horizon: 'za horyzontem...', closer_view: 'bliższy widok',
            share: 'Udostępnij', share_tap: 'Dotknij kamienia milowego powyżej, aby udostępnić lub zapisać.',
            copy: 'Kopiuj', save_to_calendar: 'Zapisz w kalendarzu:',
            create_card: 'Utwórz Kartkę', card_desc: 'Wygeneruj obraz do udostępnienia tego kamienia milowego.',
            download_png: 'Pobierz PNG', share_image: 'Udostępnij Obraz',
            celebrate_gift: 'Świętuj Prezentem', gift_desc: 'Zamień ten kamień milowy w coś namacalnego.',
            select_milestone_gift: 'Wybierz kamień milowy, aby zobaczyć pomysły na prezent.',
            order_now: 'Zamów Teraz', cancel: 'Anuluj',
            combined_milestones: 'Kamienie milowe zespołu', combined_desc: 'Połączone kamienie milowe dla wszystkich w grupie.',
            share_this_moment: 'Udostępnij Ten Moment', share_combined_desc: 'Udostępnij połączony kamień milowy!',
            dates_events: 'Daty i Wydarzenia', data_desc: 'Dodaj urodziny, rocznice i ważne daty.',
            add_date: 'Dodaj Datę', groups: 'Grupy', groups_desc: 'Organizuj daty w osobne grupy.',
            backup: 'Kopia zapasowa', export_data: 'Eksportuj', import_data: 'Importuj',
            number_patterns: 'Wzorce Liczbowe', round_numbers: 'Okrągłe Liczby', repdigits: 'Repdigity',
            alternating: 'Naprzemienne', palindromes: 'Palindromy', sequential: 'Sekwencyjne',
            scientific: 'Naukowe', lucky_patterns: 'Moje Szczęśliwe Wzorce',
            lucky_digits: 'Szczęśliwe Cyfry', custom_numbers: 'Własne Liczby', quick_add: 'Szybkie dodawanie:',
            appearance: 'Wygląd', dark_mode: 'Tryb Ciemny', save_settings: 'Zapisz Ustawienia', reset_all: 'Resetuj Wszystko',
            type_birthday: 'Urodziny', type_event: 'Data / Wydarzenie', type_milestone: 'Kamień milowy',
            unit_sec: 'sek', unit_min: 'min', unit_hrs: 'godz', unit_d: 'dn', unit_w: 'tyg', unit_mo: 'mies', unit_y: 'lat',
            edit_event: 'Edytuj Wydarzenie', save: 'Zapisz', delete: 'Usuń',
            name: 'Imię', type: 'Typ', date: 'Data', notes: 'Notatki', turns: 'Skończy',
            terms_privacy: 'Regulamin i Prywatność', copyright: 'HappyMoments © 2026 Quantum Wave Ltd',
            consent_text: 'HappyMoments przechowuje dane lokalnie na Twoim urządzeniu. Żadne dane nie są wysyłane na serwery.',
            consent_ok: 'Rozumiem', consent_read: 'Przeczytaj pełną politykę',
        },
    };

    function setLocale(locale) {
        if (!TRANSLATIONS[locale]) locale = 'en';
        currentLocale = locale;
        strings = TRANSLATIONS[locale];
        localStorage.setItem('happymoments_locale', locale);
        applyTranslations();
    }

    function getLocale() { return currentLocale; }

    function t(key) {
        return strings[key] || TRANSLATIONS.en[key] || key;
    }

    function detectLocale() {
        // 1. Check saved preference
        const saved = localStorage.getItem('happymoments_locale');
        if (saved && TRANSLATIONS[saved]) return saved;

        // 2. Check browser language
        const browserLang = (navigator.language || 'en').split('-')[0].toLowerCase();
        if (TRANSLATIONS[browserLang]) return browserLang;

        // 3. Check Serbo-Croatian variants
        if (['sr', 'bs'].includes(browserLang)) return 'hr';

        return 'en';
    }

    function applyTranslations() {
        // Apply to all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const val = t(key);
            if (el.tagName === 'INPUT' && el.type !== 'checkbox') {
                el.placeholder = val;
            } else if (el.tagName === 'OPTION') {
                el.textContent = val;
            } else {
                el.textContent = val;
            }
        });

        // Apply to data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
        });
    }

    function init() {
        const locale = detectLocale();
        setLocale(locale);
    }

    return {
        setLocale,
        getLocale,
        t,
        detectLocale,
        init,
        SUPPORTED_LOCALES,
        LOCALE_NAMES,
        applyTranslations
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { I18N };
}
