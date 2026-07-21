/**
 * 🎞️ Studio Athr Pro - Advanced Multitrack Timeline Engine
 * إدارة التايم لاين: الزوم، الـ Snap الذكي، ترتيب وقفل الطبقات، ومؤشر التشغيل
 */

class AthrTimeline {
    constructor() {
        this.zoomLevel = 1.0;
        this.snapEnabled = true;
        this.activeTrackId = null;
        this.isDraggingPlayhead = false;
    }

    // 🔍 التحكم بزوم التايم لاين (Zoom)
    setZoom(val) {
        this.zoomLevel = Math.max(0.5, Math.min(3.0, parseFloat(val)));
        const container = document.getElementById('tracksContainer');
        if (container) {
            container.style.transform = `scaleX(${this.zoomLevel})`;
            container.style.transformOrigin = 'right center';
        }
    }

    // 🧲 التغناطيس والـ Snap الذكي للحواف
    calculateSnapTime(targetTime, threshold = 0.2) {
        if (!this.snapEnabled || !window.athrEngine) return targetTime;

        const engine = window.athrEngine;
        let closestTime = targetTime;
        let minDiff = Infinity;

        // مطابقة مع بداية ونهاية كل الكليبات
        engine.clips.forEach(clip => {
            [clip.start, clip.end].forEach(point => {
                const diff = Math.abs(point - targetTime);
                if (diff < threshold && diff < minDiff) {
                    minDiff = diff;
                    closestTime = point;
                }
            });
        });

        return closestTime;
    }

    // 🔒 قفل أو فتح تراك معين (Lock Layer)
    toggleTrackLock(trackId) {
        const engine = window.athrEngine;
        if (!engine) return;

        const track = engine.tracks ? engine.tracks.find(t => t.id === trackId) : null;
        if (track) {
            track.locked = !track.locked;
            alert(track.locked ? "🔒 تم قفل المسار لمنع التعديل بالخطأ" : "🔓 تم فتح المسار للسحب والتعديل");
        }
    }

    // 👁️ إظهار أو إخفاء تراك (Hide Layer)
    toggleTrackVisibility(trackId) {
        const engine = window.athrEngine;
        if (!engine) return;

        const track = engine.tracks ? engine.tracks.find(t => t.id === trackId) : null;
        if (track) {
            track.visible = !track.visible;
            engine.renderFrame();
        }
    }
}

window.athrTimeline = new AthrTimeline();

