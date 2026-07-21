/**
 * ==========================================================================
 * 🎨 STUDIO ATHR PRO - UI CONTROLLER & DIALOGS MANAGER
 * Architecture: Navigation Manager, Modal Dialogs Engine, & Drafts Storage
 * ==========================================================================
 */

class AthrUIController {
    constructor() {
        this.currentScreen = 'homeScreen';
        this.activeDrawer = null;
        this.drafts = [];
        this.initLocalDrafts();
    }

    /**
     * 1. التبديل بين الشاشات الرئيسية (Home / Gallery / Editor)
     */
    showScreen(screenId) {
        document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.add('active');
            this.currentScreen = screenId;
        }
    }

    /**
     * 2. فتح وإغلاق المودالات والنوافذ المنبثقة (Modals Handler)
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * 3. فتح الأدراج السفلية للأدوات (Contextual Sub-Drawers)
     */
    openDrawer(type) {
        const overlay = document.getElementById('drawerPanelOverlay');
        const title = document.getElementById('drawerTitleTxt');
        const body = document.getElementById('drawerBodyContent');

        if (!overlay || !title || !body) return;

        overlay.classList.add('active');
        this.activeDrawer = type;

        if (type === 'ai_assistant') {
            title.textContent = "✨ المساعد الإسلامي والذكاء الاصطناعي";
            body.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <button onclick="window.athrIslamic.removeMusicAndIsolateVoice(window.athrEngine.videoSource, (p, m) => { alert(m); })" 
                            style="background:linear-gradient(135deg, var(--green-islamic), var(--green-accent)); color:#fff; border:1px solid var(--gold-primary); padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;">
                        🎵 إزالة الموسيقى والآلات وتصفية صوت القارئ/الداعية
                    </button>
                    <button onclick="window.athrAI.transcribeVideoAudio(window.athrEngine.videoSource, (p,m)=>{}, (cap)=>{ window.athrEngine.addTimedCaption(cap.text, cap.start, cap.end); })"
                            style="background:var(--bg-card); color:var(--gold-primary); border:1px solid var(--border-line); padding:10px; border-radius:8px; font-weight:bold; cursor:pointer;">
                        🎙️ التفريغ التلقائي للآيات والكلام (Auto-Captions AI)
                    </button>
                    <button onclick="window.athrAI.applyAIQualityEnhancement(window.athrEngine.ctx, window.athrEngine.canvas); window.athrEngine.renderFrame();"
                            style="background:var(--bg-card); color:#fff; border:1px solid var(--border-line); padding:10px; border-radius:8px; cursor:pointer;">
                        ☀️ تحسين الجودة والـ HDR بالذكاء الاصطناعي
                    </button>
                </div>
            `;
        } else if (type === 'text_verse') {
            title.textContent = "✍️ إضافة آية قرآنية / نص موقوت";
            body.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <input type="text" id="verseInputTxt" placeholder="اكتب الآية الكريمة هنا..." style="width:100%; padding:8px; background:#000; color:#fff; border:1px solid var(--border-line); border-radius:6px; font-family:'Amiri',serif;" />
                    <div style="display:flex; gap:6px;">
                        <input type="number" id="vStartSec" placeholder="من (ثانية)" style="width:50%; padding:6px; background:#000; color:#fff; border:1px solid var(--border-line); border-radius:4px;" />
                        <input type="number" id="vEndSec" placeholder="إلى (ثانية)" style="width:50%; padding:6px; background:#000; color:#fff; border:1px solid var(--border-line); border-radius:4px;" />
                    </div>
                    <button onclick="window.athrUI.addVerseFromDrawerInput()" style="background:var(--gold-primary); color:#000; border:none; padding:10px; border-radius:6px; font-weight:bold; cursor:pointer;">➕ إضافة الآية للتايم لاين</button>
                </div>
            `;
        } else if (type === 'islamic_library') {
            title.textContent = "🕌 المكتبة الإسلامية والمؤثرات المباحة";
            body.innerHTML = `
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button onclick="window.athrIslamic.addHalalSoundscapeToTimeline('rain')" style="background:var(--bg-card); color:var(--gold-primary); border:1px solid var(--gold-primary); padding:8px 12px; border-radius:6px; cursor:pointer;">🌧️ مطر ناعم</button>
                    <button onclick="window.athrIslamic.addHalalSoundscapeToTimeline('birds')" style="background:var(--bg-card); color:#fff; border:1px solid var(--border-line); padding:8px 12px; border-radius:6px; cursor:pointer;">🍃 عصافير طليقة</button>
                    <button onclick="window.athrIslamic.addHalalSoundscapeToTimeline('waves')" style="background:var(--bg-card); color:#fff; border:1px solid var(--border-line); padding:8px 12px; border-radius:6px; cursor:pointer;">🌊 أمواج البحر</button>
                    <button onclick="window.athrIslamic.injectQuranicVerseTemplate('tpl_quran_1')" style="background:var(--bg-card); color:var(--gold-primary); border:1px solid var(--border-line); padding:8px 12px; border-radius:6px; cursor:pointer;">📖 قالب آية مذهبة</button>
                </div>
            `;
        } else if (type === 'stickers') {
            title.textContent = "🌙 ملصقات وأذكار إسلامية";
            body.innerHTML = `
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button onclick="window.athrEngine.addSticker('﷽')" style="background:var(--bg-card); color:var(--gold-primary); border:1px solid var(--gold-primary); padding:6px 12px; border-radius:6px; font-family:'Amiri',serif; cursor:pointer;">﷽</button>
                    <button onclick="window.athrEngine.addSticker('ﷺ')" style="background:var(--bg-card); color:var(--gold-primary); border:1px solid var(--gold-primary); padding:6px 12px; border-radius:6px; font-family:'Amiri',serif; cursor:pointer;">ﷺ</button>
                    <button onclick="window.athrEngine.addSticker('ﷻ')" style="background:var(--bg-card); color:var(--gold-primary); border:1px solid var(--gold-primary); padding:6px 12px; border-radius:6px; font-family:'Amiri',serif; cursor:pointer;">ﷻ</button>
                    <button onclick="window.athrEngine.addSticker('🕌')" style="background:var(--bg-card); color:#fff; border:1px solid var(--border-line); padding:6px 12px; border-radius:6px; cursor:pointer;">🕌</button>
                </div>
            `;
        } else {
            title.textContent = `أدوات (${type})`;
            body.innerHTML = `<span style="color:var(--gold-primary); font-size:11px;">حدد مقطع فيديو أو نص للبدء بالتعديل عليه المباشر.</span>`;
        }
    }

    closeAllDrawers() {
        const overlay = document.getElementById('drawerPanelOverlay');
        if (overlay) overlay.classList.remove('active');
    }

    addVerseFromDrawerInput() {
        const text = document.getElementById('verseInputTxt').value;
        const start = parseFloat(document.getElementById('vStartSec').value) || 0;
        const end = parseFloat(document.getElementById('vEndSec').value) || (window.athrEngine ? window.athrEngine.duration : 10);
        if (text && window.athrEngine) {
            window.athrEngine.addTimedCaption(text, start, end);
            this.closeAllDrawers();
        }
    }

    /**
     * 4. فتح المعرض واختيار الوسائط
     */
    openGallery(type) {
        this.showScreen('galleryScreen');
    }

    confirmGallerySelection() {
        this.showScreen('editorScreen');
    }

    confirmExitEditor() {
        if (confirm("هل تريد إغلاق المحرر والحفظ في المسودات؟")) {
            this.showScreen('homeScreen');
        }
    }

    quickStartAI() {
        this.showScreen('editorScreen');
        this.openDrawer('ai_assistant');
    }

    initLocalDrafts() {
        this.drafts = JSON.parse(localStorage.getItem('athr_drafts') || '[]');
        const badge = document.getElementById('draftCountBadge');
        if (badge) badge.textContent = this.drafts.length;
    }

    clearCache() {
        localStorage.clear();
        alert("🧹 تم تنظيف الذاكرة المؤقتة وإعادة ضبط الإعدادات بنجاح!");
    }
}

// إنشاء النسخة التنفيذية لمتحكم الواجهة
window.athrUI = new AthrUIController();

