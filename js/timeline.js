/**
 * ==========================================================================
 * 🎞️ STUDIO ATHR PRO - MULTITRACK TIMELINE ENGINE
 * Architecture: Professional Drag-and-Drop Timeline with Snap & Layers
 * ==========================================================================
 */

class AthrTimelineEngine {
    constructor() {
        // إعدادات التايم لاين
        this.zoomLevel = 1.0;          // مستوى الزوم (0.5x إلى 4.0x)
        this.pxPerSecond = 50;         // عدد البكسلات لكل ثانية ز زمنية
        this.snapThresholdPx = 12;     // مسافة المغناطيسية للالتقاط (Snap)
        this.isSnapEnabled = true;     // تفعيل الـ Magnetism / Snap الذكي

        // حالات السحب والتحريك (Drag & Scroll State)
        this.isScrubbing = false;
        this.draggedClipId = null;
        this.dragStartX = 0;
        this.clipOriginalStartTime = 0;

        // عناوين التراكات والمسارات
        this.trackContainerEl = null;
        this.rulerEl = null;
        this.playheadEl = null;
    }

    /**
     * 1. تهيئة التايم لاين وربطه بعناصر الـ DOM
     */
    init() {
        this.trackContainerEl = document.getElementById('timelineTracksScrollArea');
        this.rulerEl = document.getElementById('timelineRulerBar');
        this.playheadEl = document.querySelector('.playhead-line-center');

        if (!this.trackContainerEl) {
            console.warn("⚠️ AthrTimelineEngine: Scroll area element missing.");
            return;
        }

        // ربط أحداث التمرير والتكبير باللمس والعجلة (Wheel Zoom & Scroll)
        this.attachScrollAndZoomEvents();

        // رسم مسطرة الثواني المبدئية
        this.renderTimelineRuler(120); // افتراضي 120 ثانية

        console.log("🎞️ AthrTimelineEngine initialized successfully.");
    }

    /**
     * 2. التحكم في زوم التايم لاين (Zoom Level In/Out)
     */
    setZoom(newZoomFactor) {
        this.zoomLevel = Math.max(0.4, Math.min(4.0, parseFloat(newZoomFactor)));
        this.pxPerSecond = Math.round(50 * this.zoomLevel);

        // إعادة رسم المسارات والمساحة الممتدة
        this.refreshTimelineLayout();
    }

    zoomIn() {
        this.setZoom(this.zoomLevel + 0.25);
    }

    zoomOut() {
        this.setZoom(this.zoomLevel - 0.25);
    }

    /**
     * 3. المغناطيسية والـ Snap الذكي للحواف (Smart Magnetism)
     */
    calculateSnapPoint(proposedTime, currentClipId = null) {
        if (!this.isSnapEnabled || !window.athrEngine) return proposedTime;

        const engine = window.athrEngine;
        let snapTime = proposedTime;
        let minDiffSeconds = this.snapThresholdPx / this.pxPerSecond;

        // تجميع كل نقاط البداية والنهاية للمقاطع في كل التراكات
        const allPoints = [0]; // نقطة الصفر دائماً snap

        for (let trackKey in engine.tracks) {
            const track = engine.tracks[trackKey];
            track.clips.forEach(clip => {
                if (clip.id !== currentClipId) {
                    allPoints.push(clip.startTime);
                    allPoints.push(clip.endTime);
                }
            });
        }

        // البحث عن أقرب نقطة زاوية
        for (let point of allPoints) {
            const diff = Math.abs(point - proposedTime);
            if (diff < minDiffSeconds) {
                minDiffSeconds = diff;
                snapTime = point;
            }
        }

        return snapTime;
    }

    /**
     * 4. قفل أو فتح تراك معين (Lock / Unlock Layer)
     */
    toggleTrackLock(trackKey) {
        if (!window.athrEngine) return;
        const track = window.athrEngine.tracks[trackKey];
        if (track) {
            track.locked = !track.locked;
            alert(track.locked ? `🔒 تم قفل مسار (${trackKey}) لمنع التعديل بالخطأ` : `🔓 تم فتح مسار (${trackKey})`);
            this.refreshTimelineLayout();
        }
    }

    /**
     * 5. إخفاء أو إظهار تراك معين (Hide / Show Layer)
     */
    toggleTrackVisibility(trackKey) {
        if (!window.athrEngine) return;
        const track = window.athrEngine.tracks[trackKey];
        if (track) {
            track.visible = !track.visible;
            window.athrEngine.renderFrame();
            this.refreshTimelineLayout();
        }
    }

    /**
     * 6. ترتيب وإعادة تحديث عناصر التايم لاين البصرية (Full Redraw)
     */
    refreshTimelineLayout() {
        if (!window.athrEngine) return;
        const engine = window.athrEngine;

        // تحديث تراك الفيديو الرئيسي
        this.renderTrackClipsUI('trackMainVideoClips', engine.tracks.mainVideo);
        
        // تحديث تراك النصوص والآيات
        this.renderTrackClipsUI('trackTextClips', engine.tracks.text);

        // تحديث تراك الطبقات العائمة PiP
        this.renderTrackClipsUI('trackOverlayClips', engine.tracks.overlay);

        // تحديث مسطرة الثواني
        this.renderTimelineRuler(engine.duration || 120);
    }

    /**
     * 7. توليد الكليبات بصرية بـ HTML/CSS داخل المسار المحدد
     */
    renderTrackClipsUI(containerId, trackObj) {
        const container = document.getElementById(containerId);
        if (!container || !trackObj) return;

        if (!trackObj.visible) {
            container.style.opacity = '0.3';
            container.style.pointerEvents = 'none';
        } else {
            container.style.opacity = '1';
            container.style.pointerEvents = 'auto';
        }

        if (trackObj.clips.length === 0) {
            container.innerHTML = `<div class="empty-track-placeholder">مسار فارغ</div>`;
            return;
        }

        container.innerHTML = trackObj.clips.map(clip => {
            const widthPx = Math.max(30, (clip.endTime - clip.startTime) * this.pxPerSecond);
            const leftPx = clip.startTime * this.pxPerSecond;
            const isSelected = clip.id === window.athrEngine.selectedClipId;

            return `
                <div class="timeline-clip-node ${isSelected ? 'selected' : ''}" 
                     id="node_${clip.id}"
                     style="position: absolute; left: ${leftPx}px; width: ${widthPx}px; height: 100%; top: 0;"
                     onclick="window.athrTimeline.selectClipNode('${clip.id}')">
                    <span class="clip-title-label">${clip.name || clip.text || 'كليب'}</span>
                </div>
            `;
        }).join('');
    }

    /**
     * 8. تحديد كليب نود بالتايم لاين
     */
    selectClipNode(clipId) {
        if (window.athrEngine) {
            window.athrEngine.selectedClipId = clipId;
            this.refreshTimelineLayout();
            window.athrEngine.renderFrame();
        }
    }

    /**
     * 9. رسم مسطرة الثواني والأرقام (Timeline Ruler Renderer)
     */
    renderTimelineRuler(totalDurationSeconds) {
        if (!this.rulerEl) return;

        const totalWidthPx = totalDurationSeconds * this.pxPerSecond;
        let rulerHTML = `<div style="position: relative; width: ${totalWidthPx}px; height: 100%;">`;

        // رسم علامات الثواني كل 5 ثوانٍ
        for (let sec = 0; sec <= totalDurationSeconds; sec += 5) {
            const leftPx = sec * this.pxPerSecond;
            rulerHTML += `
                <div style="position: absolute; left: ${leftPx}px; top: 0; bottom: 0; border-left: 1px solid #333; padding-left: 4px; font-size: 9px; color: #888;">
                    ${this.formatTimecode(sec)}
                </div>
            `;
        }

        rulerHTML += `</div>`;
        this.rulerEl.innerHTML = rulerHTML;
    }

    /**
     * 10. ربط أحداث التمرير والتكبير والسحب
     */
    attachScrollAndZoomEvents() {
        if (!this.trackContainerEl) return;

        // مزامنة تحريك التايم لاين مع الوقت الحقيقي للفيديو
        this.trackContainerEl.addEventListener('scroll', () => {
            if (!window.athrEngine || !window.athrEngine.videoSource) return;

            const scrollLeft = this.trackContainerEl.scrollLeft;
            // حساب الوقت المناظر لمركز الشاشة
            const calculatedTime = scrollLeft / this.pxPerSecond;
            
            if (this.isScrubbing && window.athrEngine.videoSource.src) {
                window.athrEngine.videoSource.currentTime = calculatedTime;
                window.athrEngine.currentTime = calculatedTime;
                window.athrEngine.renderFrame();
            }
        });

        this.trackContainerEl.addEventListener('touchstart', () => { this.isScrubbing = true; });
        this.trackContainerEl.addEventListener('touchend', () => { this.isScrubbing = false; });
        this.trackContainerEl.addEventListener('mousedown', () => { this.isScrubbing = true; });
        window.addEventListener('mouseup', () => { this.isScrubbing = false; });
    }

    formatTimecode(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
}

// إنشاء النسخة التنفيذية للتايم لاين
window.athrTimeline = new AthrTimelineEngine();
