/**
 * 🎬 Studio Athr Pro - Core Engine
 * محرك المعالجة والرسم الرئيسي لاستوديو أثر
 */

class AthrEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.tracks = []; // [{ id, type, clips: [] }]
        this.currentTime = 0;
        this.duration = 0;
        this.isPlaying = false;
        this.fps = 30;
        
        // إعدادات الكي فريم والطبقات
        this.selectedClip = null;
        this.keyframes = {}; // { clipId: { opacity: [], scale: [], position: [] } }
        this.layerSettings = {};
        
        // المساعد الإسلامي
        this.islamicMode = {
            autoFilterMusic: true,
            defaultBgm: 'none',
            watermarkText: ''
        };
    }

    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.startLoop();
    }

    // 🔄 حلقة الرسم والتحديث الحية (Render Loop)
    startLoop() {
        const render = () => {
            this.renderFrame();
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    }

    renderFrame() {
        if (!this.ctx || !this.canvas) return;
        
        // مسح الكانفاس
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // خلفية سوداء سينمائية
        this.ctx.fillStyle = '#050505';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // رسم كافة الطبقات حسب الترتيب (Layers)
        this.tracks.forEach(track => {
            if (!track.visible) return;
            
            track.clips.forEach(clip => {
                if (this.currentTime >= clip.start && this.currentTime <= clip.end) {
                    this.drawClip(clip);
                }
            });
        });
    }

    drawClip(clip) {
        this.ctx.save();
        
        // تطبيق الشفافية والـ Keyframes
        let opacity = clip.opacity !== undefined ? clip.opacity : 1.0;
        this.ctx.globalAlpha = opacity;

        if (clip.type === 'video' || clip.type === 'image') {
            if (clip.element) {
                this.ctx.drawImage(
                    clip.element, 
                    clip.x || 0, 
                    clip.y || 0, 
                    clip.width || this.canvas.width, 
                    clip.height || this.canvas.height
                );
            }
        } else if (clip.type === 'text' || clip.type === 'verse') {
            this.ctx.font = `${clip.bold ? 'bold' : ''} ${clip.fontSize || 40}px ${clip.fontFamily || "'Amiri', serif"}`;
            this.ctx.fillStyle = clip.color || '#ffffff';
            this.ctx.textAlign = clip.align || 'center';
            
            if (clip.shadow) {
                this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                this.ctx.shadowBlur = 12;
            }

            this.ctx.fillText(clip.content, clip.x || (this.canvas.width / 2), clip.y || (this.canvas.height * 0.8));
        }

        this.ctx.restore();
    }

    // ➕ إضافة تراك جديد
    addTrack(type, name) {
        const track = {
            id: 'tr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            type: type, // 'video' | 'audio' | 'text' | 'sticker' | 'pip'
            name: name,
            clips: [],
            visible: true,
            locked: false
        };
        this.tracks.push(track);
        return track;
    }

    // ✂️ تقسيم المقطع (Split)
    splitClip(clipId, splitTime) {
        for (let track of this.tracks) {
            const index = track.clips.findIndex(c => c.id === clipId);
            if (index !== -1) {
                const original = track.clips[index];
                if (splitTime > original.start && splitTime < original.end) {
                    const clip1 = { ...original, id: 'clip_' + Date.now(), end: splitTime };
                    const clip2 = { ...original, id: 'clip_' + (Date.now() + 1), start: splitTime };
                    track.clips.splice(index, 1, clip1, clip2);
                    return true;
                }
            }
        }
        return false;
    }

    // 🗑️ حذف مقطع
    deleteClip(clipId) {
        this.tracks.forEach(track => {
            track.clips = track.clips.filter(c => c.id !== clipId);
        });
    }
}

// تصدير المحرك عالمياً
window.athrEngine = new AthrEngine();

