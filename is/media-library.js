/**
 * 🕌 Studio Athr Pro - Media & Islamic Asset Library
 * إدارة المكتبة الإسلامية: الأصوات المباحة، الملصقات، الأذكار، الخطوط، والقوالب
 */

class AthrMediaLibrary {
    constructor() {
        // 1. المؤثرات الصوتية الطبيعية المباحة (أوفلاين وبصيغ خفيفة)
        this.halalAudioEffects = [
            { id: 'rain', name: '🌧️ صوت مطر هادئ', category: 'nature' },
            { id: 'birds', name: '🍃 عصافير وزقزقة طبيعة', category: 'nature' },
            { id: 'waves', name: '🌊 أمواج البحر والمحيط', category: 'nature' },
            { id: 'wind', name: '💨 هواء ونسيم المساجد', category: 'nature' },
            { id: 'quran_page', name: '📖 تقليب صفحات المصحف', category: 'islamic' },
            { id: 'footsteps', name: 'الخطوات على السجاد', category: 'islamic' }
        ];

        // 2. مكتبة الرموز والملصقات الإسلامية السريعة
        this.islamicStickers = [
            { text: '﷽', label: 'البسملة', font: "'Amiri', serif" },
            { text: '﴿ ۞ ﴾', label: 'نجمة قرآنية', font: "'Amiri', serif" },
            { text: 'ﷺ', label: 'الصلاة على النبي', font: "'Amiri', serif" },
            { text: 'ﷻ', label: 'لفظ الجلالة', font: "'Amiri', serif" },
            { text: '🕌', label: 'مسجد', font: 'sans-serif' },
            { text: '🌙', label: 'هلال', font: 'sans-serif' },
            { text: '📖', label: 'مصحف', font: 'sans-serif' },
            { text: '✨', label: 'بريق', font: 'sans-serif' }
        ];

        // 3. الخطوط المتاحة بالمشروع
        this.arabicFonts = [
            { id: "'Amiri', serif", name: '📜 خط أميري مصحفي' },
            { id: "'Cairo', sans-serif", name: '📱 خط القاهرة حديث' },
            { id: "'Tajawal', sans-serif", name: '✨ خط تجوال ناعم' },
            { id: "'Aref Ruqaa', serif", name: '✍️ خط رقعة أصيل' },
            { id: "'Reem Kufi', sans-serif", name: '🏛️ خط كوفي عريق' }
        ];

        // 4. القوالب الجاهزة للمونتاج السريع (Presets)
        this.templates = {
            dawah: {
                name: '🕌 قالب دعوي احترافي',
                font: "'Amiri', serif",
                color: '#d4af37',
                filter: 'brightness(1.05) contrast(1.1) sepia(0.2)',
                aspectRatio: '9:16'
            },
            reels: {
                name: '📱 قالب ريلز / شورتس طولي',
                font: "'Cairo', sans-serif",
                color: '#ffffff',
                filter: 'contrast(1.15) saturate(1.1)',
                aspectRatio: '9:16'
            },
            youtube: {
                name: '📺 قالب يوتيوب عريض (16:9)',
                font: "'Tajawal', sans-serif",
                color: '#ffffff',
                filter: 'none',
                aspectRatio: '16:9'
            }
        };
    }

    // 🎨 تطبيق قالب جاهز فورًا على المحرك
    applyTemplate(templateKey) {
        const tpl = this.templates[templateKey];
        if (!tpl) return;

        const engine = window.athrEngine;
        if (engine && engine.canvas) {
            if (tpl.aspectRatio === '16:9') {
                engine.canvas.width = 1280;
                engine.canvas.height = 720;
            } else {
                engine.canvas.width = 720;
                engine.canvas.height = 1280;
            }
            engine.renderFrame();
            alert(`✨ تم تطبيق (${tpl.name}) بنجاح!`);
        }
    }
}

window.athrLibrary = new AthrMediaLibrary();
