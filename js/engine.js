/**
 * ==========================================================================
 * 🎬 STUDIO ATHR PRO - CORE RENDERING ENGINE & STATE MANAGEMENT
 * Architecture: Web NLE Canvas Processing Engine with Keyframes & Layers
 * ==========================================================================
 */

class AthrCoreEngine {
    constructor() {
        // عناصر العرض والـ DOM
        this.canvas = null;
        this.ctx = null;
        this.videoSource = null;
        this.audioSource = null;

        // حالة المحرك (Engine State)
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.fps = 30;
        this.aspectRatio = '9:16'; // 9:16, 16:9, 1:1, 4:5

        // معمارية الطبقات والتراكات (Multitrack Layers)
        this.tracks = {
            mainVideo: { id: 'tr_main', type: 'video', clips: [], locked: false, visible: true },
            overlay: { id: 'tr_overlay', type: 'overlay', clips: [], locked: false, visible: true },
            text: { id: 'tr_text', type: 'text', clips: [], locked: false, visible: true },
            audio: { id: 'tr_audio', type: 'audio', clips: [], locked: false, visible: true }
        };

        // إدارة الـ Keyframes وعناصر التحريك
        this.keyframes = {}; // { clipId: [ { time, scale, positionX, positionY, rotation, opacity } ] }
        this.selectedClipId = null;

        // السحب والتحريك المباشر على الكانفاس (Interactive Canvas Transform)
        this.interactionState = {
            isDragging: false,
            dragTarget: null, // clip or sticker
            dragOffsetX: 0,
            dragOffsetY: 0,
            activeHandle: null // 'scale', 'rotate'
        };

        // سجل التراجعات (Undo/Redo History Stack)
        this.historyStack = [];
        this.historyIndex = -1;
        this.maxHistorySteps = 50;

        // خيارات المساعد الإسلامي الافتراضية
        this.islamicSettings = {
            autoMuteMusic: true,
            purityFilterEnabled: true,
            voiceEnhanceDb: 6.0
        };
    }

    /**
     * 1. تهيئة المحرك وربطه بعناصر الـ Canvas والـ DOM
     */
    init(canvasId, videoId) {
        this.canvas = document.getElementById(canvasId);
        this.videoSource = document.getElementById(videoId);

        if (!this.canvas || !this.videoSource) {
            console.error("❌ AthrCoreEngine: Canvas or Video DOM element missing.");
            return;
        }

        this.ctx = this.canvas.getContext('2d', { alpha: false, desynchronized: true });

        // ضبط أحجام الكانفاس الافتراضية (9:16 Vertical Reels)
        this.setCanvasDimensions(720, 1280);

        // ربط مستمعات الأحداث الحركية للسحب والتحريك الحر على الشاشة
        this.attachCanvasInteractionListeners();

        // ربط مستمعات فيديو المصدر
        this.attachVideoListeners();

        // بدء حلقة الرسم اللحظية (Render Loop)
        this.startRenderLoop();

        console.log("🚀 AthrCoreEngine initialized successfully.");
    }

    /**
     * 2. ضبط أبعاد ومقاسات شاشة المعاينة
     */
    setCanvasDimensions(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.renderFrame();
    }

    /**
     * 3. تحميل واستيراد وسائط وسلسلة فيديوهات ودعم الدمج متعدد المقاطع
     */
    loadMediaFile(file) {
        if (!file) return;

        const fileUrl = URL.createObjectURL(file);
        const isVideo = file.type.startsWith('video');
        const isImage = file.type.startsWith('image');

        if (isVideo) {
            this.videoSource.src = fileUrl;
            this.videoSource.onloadeddata = () => {
                this.duration = this.videoSource.duration || 10;
                
                // حساب وقت البداية بناءً على نهاية الكليب الساابق (إن وجد) للدمج
                let calcStartTime = 0;
                const existingClips = this.tracks.mainVideo.clips;
                if (existingClips.length > 0) {
                    calcStartTime = existingClips[existingClips.length - 1].endTime;
                }

                const newClip = {
                    id: 'clip_' + Date.now(),
                    name: file.name,
                    type: 'video',
                    src: fileUrl,
                    element: this.videoSource,
                    startTime: calcStartTime,
                    endTime: calcStartTime + this.duration,
                    mediaStart: 0,
                    x: 0,
                    y: 0,
                    width: this.canvas.width,
                    height: this.canvas.height,
                    scale: 1.0,
                    rotation: 0,
                    opacity: 1.0,
                    filters: { brightness: 1, contrast: 1, saturate: 1 }
                };

                this.tracks.mainVideo.clips.push(newClip);
                this.selectedClipId = newClip.id;

                // تحديث واجهة التايم لاين وتوليد شريط المصغرات
                this.updateTimelineUI();
                this.saveHistoryState();
                this.renderFrame();
            };
        } else if (isImage) {
            const img = new Image();
            img.src = fileUrl;
            img.onload = () => {
                let calcStartTime = 0;
                const existingClips = this.tracks.overlay.clips;
                if (existingClips.length > 0) {
                    calcStartTime = existingClips[existingClips.length - 1].endTime;
                }

                const newClip = {
                    id: 'clip_' + Date.now(),
                    name: file.name,
                    type: 'image',
                    src: fileUrl,
                    element: img,
                    startTime: calcStartTime,
                    endTime: calcStartTime + 5.0, // افتراضي 5 ثواني
                    x: (this.canvas.width - img.width) / 2,
                    y: (this.canvas.height - img.height) / 2,
                    width: img.width,
                    height: img.height,
                    scale: 1.0,
                    rotation: 0,
                    opacity: 1.0
                };

                this.tracks.overlay.clips.push(newClip);
                this.selectedClipId = newClip.id;
                this.updateTimelineUI();
                this.saveHistoryState();
                this.renderFrame();
            };
        }
    }

    /**
     * 4. ربط مستمعات تشغيل الفيديو والتزامن
     */
    attachVideoListeners() {
        this.videoSource.addEventListener('timeupdate', () => {
            this.currentTime = this.videoSource.currentTime;
            this.updateTimecodeDisplays();
        });

        this.videoSource.addEventListener('ended', () => {
            this.isPlaying = false;
            this.updatePlayButtonUI();
        });
    }

    /**
     * 5. التحكم بالتشغيل والإيقاف (Play / Pause)
     */
    togglePlay() {
        if (!this.videoSource.src && this.tracks.mainVideo.clips.length === 0) {
            alert("يرجى اختيار ملف فيديو أو صورة أولاً للبدء!");
            return;
        }

        if (this.videoSource.paused) {
            this.videoSource.play();
            this.isPlaying = true;
        } else {
            this.videoSource.pause();
            this.isPlaying = false;
        }

        this.updatePlayButtonUI();
    }

    updatePlayButtonUI() {
        const btn = document.getElementById('mainPlayBtn');
        if (btn) {
            btn.textContent = this.isPlaying ? '⏸' : '▶';
        }
    }

    /**
     * 6. حلقة الرسم المستمرة (Continuous Render Loop)
     */
    startRenderLoop() {
        const render = () => {
            if (this.isPlaying || this.interactionState.isDragging) {
                this.renderFrame();
            }
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    }

    /**
     * 7. دالة الرسم الشاملة لكل الطبقات (Master Frame Renderer)
     */
    renderFrame() {
        if (!this.ctx || !this.canvas) return;

        // أ) تنظيف المسرح
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // خلفية سوداء سينمائية
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // ب) رسم التراك الرئيسي (Main Video/Image Track)
        if (this.tracks.mainVideo.visible) {
            this.tracks.mainVideo.clips.forEach(clip => {
                if (this.currentTime >= clip.startTime && this.currentTime <= clip.endTime) {
                    this.drawMediaClip(clip);
                }
            });
        }

        // ج) رسم طبقات الصور والعناصر العائمة (Overlay & PiP Track)
        if (this.tracks.overlay.visible) {
            this.tracks.overlay.clips.forEach(clip => {
                if (this.currentTime >= clip.startTime && this.currentTime <= clip.endTime) {
                    this.drawMediaClip(clip);
                }
            });
        }

        // د) رسم النصوص والآيات القرآنية الموقوتة (Text & Verse Track)
        if (this.tracks.text.visible) {
            this.tracks.text.clips.forEach(textClip => {
                if (this.currentTime >= textClip.startTime && this.currentTime <= textClip.endTime) {
                    this.drawTextClip(textClip);
                }
            });
        }

        // هـ) رسم مقابض التحديد للطبقة النشطة (Selection Bounds & Bounding Box)
        this.drawSelectionOverlay();
    }

    /**
     * 8. رسم كليب الوسائط (فيديو / صورة) مع تطبيق الفلاتر والتحويلات
     */
    drawMediaClip(clip) {
        this.ctx.save();

        // حساب قيم الـ Keyframes اللحظية
        const interpolated = this.getInterpolatedKeyframeValues(clip.id, this.currentTime);
        const scale = interpolated.scale || clip.scale || 1.0;
        const opacity = interpolated.opacity !== undefined ? interpolated.opacity : (clip.opacity || 1.0);
        const posX = interpolated.x !== undefined ? interpolated.x : (clip.x || 0);
        const posY = interpolated.y !== undefined ? interpolated.y : (clip.y || 0);
        const rotation = interpolated.rotation || clip.rotation || 0;

        this.ctx.globalAlpha = opacity;

        // تطبيق الفلاتر اللونية
        if (clip.filters) {
            this.ctx.filter = `brightness(${clip.filters.brightness || 1}) contrast(${clip.filters.contrast || 1}) saturate(${clip.filters.saturate || 1})`;
        }

        // التحريك والدوران والمركز
        this.ctx.translate(posX + clip.width / 2, posY + clip.height / 2);
        this.ctx.rotate((rotation * Math.PI) / 180);
        this.ctx.scale(scale, scale);

        if (clip.element) {
            this.ctx.drawImage(
                clip.element,
                -clip.width / 2,
                -clip.height / 2,
                clip.width,
                clip.height
            );
        }

        this.ctx.restore();
    }

    /**
     * 9. رسم النصوص والآيات القرآنية الموقوتة مع الظلال
     */
    drawTextClip(textClip) {
        this.ctx.save();

        const fontSize = textClip.fontSize || 42;
        const fontFamily = textClip.fontFamily || "'Amiri', serif";

        this.ctx.font = `bold ${fontSize}px ${fontFamily}`;
        this.ctx.fillStyle = textClip.color || '#ffffff';
        this.ctx.textAlign = textClip.align || 'center';

        // إضافة إشعاع وظل إسلامي ذهبي/أسود
        if (textClip.shadow) {
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            this.ctx.shadowBlur = 12;
            this.ctx.shadowOffsetX = 2;
            this.ctx.shadowOffsetY = 2;
        }

        const x = textClip.x !== undefined ? textClip.x : this.canvas.width / 2;
        const y = textClip.y !== undefined ? textClip.y : this.canvas.height * 0.82;

        this.ctx.fillText(textClip.text, x, y);

        this.ctx.restore();
    }

    /**
     * 10. حساب التدرج الانسيابي للـ Keyframes عند أزمنة محددة
     */
    getInterpolatedKeyframeValues(clipId, time) {
        const kfs = this.keyframes[clipId];
        if (!kfs || kfs.length === 0) return {};

        // ترتيب النقاط بالزمن
        kfs.sort((a, b) => a.time - b.time);

        if (time <= kfs[0].time) return kfs[0];
        if (time >= kfs[kfs.length - 1].time) return kfs[kfs.length - 1];

        // العثور على النقطتين المحيطتين بالزمن الحالي
        for (let i = 0; i < kfs.length - 1; i++) {
            const k1 = kfs[i];
            const k2 = kfs[i + 1];
            if (time >= k1.time && time <= k2.time) {
                const factor = (time - k1.time) / (k2.time - k1.time);
                return {
                    scale: k1.scale + (k2.scale - k1.scale) * factor,
                    opacity: k1.opacity + (k2.opacity - k1.opacity) * factor,
                    x: k1.x + (k2.x - k1.x) * factor,
                    y: k1.y + (k2.y - k1.y) * factor,
                    rotation: k1.rotation + (k2.rotation - k1.rotation) * factor
                };
            }
        }
        return {};
    }

    /**
     * 11. إضافة نقطة حركية (Add Keyframe) عند الزمن الحالي
     */
    addKeyframeAtCurrentTime() {
        if (!this.selectedClipId) {
            alert("اختر مقطعاً أولاً لإضافة نقطة حركة (Keyframe)!");
            return;
        }

        if (!this.keyframes[this.selectedClipId]) {
            this.keyframes[this.selectedClipId] = [];
        }

        const clip = this.findClipById(this.selectedClipId);
        if (!clip) return;

        const newKf = {
            time: this.currentTime,
            scale: clip.scale || 1.0,
            opacity: clip.opacity || 1.0,
            x: clip.x || 0,
            y: clip.y || 0,
            rotation: clip.rotation || 0
        };

        this.keyframes[this.selectedClipId].push(newKf);
        alert(`♦️ تم إضافة Keyframe بنجاح عند الوقت ${this.currentTime.toFixed(1)}s`);
        this.renderFrame();
    }

    /**
     * 12. تقسيم المقطع المحدد (Split Clip)
     */
    splitCurrentClip() {
        if (!this.selectedClipId) {
            alert("حدد مقطع فيديو أو نص أولاً للتقسيم!");
            return;
        }

        for (let trackKey in this.tracks) {
            const track = this.tracks[trackKey];
            const clipIdx = track.clips.findIndex(c => c.id === this.selectedClipId);
            if (clipIdx !== -1) {
                const orig = track.clips[clipIdx];
                if (this.currentTime > orig.startTime && this.currentTime < orig.endTime) {
                    const clip1 = { ...orig, id: 'clip_' + Date.now(), endTime: this.currentTime };
                    const clip2 = { ...orig, id: 'clip_' + (Date.now() + 1), startTime: this.currentTime };

                    track.clips.splice(clipIdx, 1, clip1, clip2);
                    this.updateTimelineUI();
                    this.saveHistoryState();
                    alert(`✂️ تم تقسيم المقطع إلى كليبين متصلين!`);
                    return;
                }
            }
        }
    }

    /**
     * 13. حذف المقطع المحدد (Delete Clip)
     */
    deleteSelectedClip() {
        if (!this.selectedClipId) return;

        for (let trackKey in this.tracks) {
            const track = this.tracks[trackKey];
            track.clips = track.clips.filter(c => c.id !== this.selectedClipId);
        }

        this.selectedClipId = null;
        this.updateTimelineUI();
        this.saveHistoryState();
        this.renderFrame();
    }

    /**
     * 14. إضافة ملصق إسلامي حر (Add Islamic Sticker)
     */
    addSticker(symbol) {
        const textClip = {
            id: 'stk_' + Date.now(),
            text: symbol,
            startTime: 0,
            endTime: this.duration || 10,
            fontSize: 60,
            fontFamily: "'Amiri', serif",
            color: '#d4af37',
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            shadow: true
        };

        this.tracks.text.clips.push(textClip);
        this.selectedClipId = textClip.id;
        this.updateTimelineUI();
        this.renderFrame();
    }

    /**
     * 15. إضافة نص أو آية قرآنية موقوتة
     */
    addTimedCaption(text, start, end) {
        const captionClip = {
            id: 'cap_' + Date.now(),
            text: text,
            startTime: start,
            endTime: end,
            fontSize: 44,
            fontFamily: "'Amiri', serif",
            color: '#ffffff',
            x: this.canvas.width / 2,
            y: this.canvas.height * 0.82,
            shadow: true
        };

        this.tracks.text.clips.push(captionClip);
        this.updateTimelineUI();
        this.renderFrame();
    }

    /**
     * 16. السحب والتحريك الحر باللمس والماوس على شاشة المعاينة
     */
    attachCanvasInteractionListeners() {
        let isDown = false;

        const getPos = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: (clientX - rect.left) * (this.canvas.width / rect.width),
                y: (clientY - rect.top) * (this.canvas.height / rect.height)
            };
        };

        this.canvas.addEventListener('mousedown', (e) => {
            isDown = true;
            const pos = getPos(e);
            this.handleDragStart(pos);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            const pos = getPos(e);
            this.handleDragMove(pos);
        });

        window.addEventListener('mouseup', () => {
            isDown = false;
            this.interactionState.isDragging = false;
        });
    }

    handleDragStart(pos) {
        // العثور على أحدث نص أو كليب عند موقع الضغط
        for (let i = this.tracks.text.clips.length - 1; i >= 0; i--) {
            const clip = this.tracks.text.clips[i];
            const dist = Math.hypot(clip.x - pos.x, clip.y - pos.y);
            if (dist < 80) {
                this.selectedClipId = clip.id;
                this.interactionState.isDragging = true;
                this.interactionState.dragTarget = clip;
                this.interactionState.dragOffsetX = pos.x - clip.x;
                this.interactionState.dragOffsetY = pos.y - clip.y;
                return;
            }
        }
    }

    handleDragMove(pos) {
        if (this.interactionState.isDragging && this.interactionState.dragTarget) {
            const target = this.interactionState.dragTarget;
            target.x = pos.x - this.interactionState.dragOffsetX;
            target.y = pos.y - this.interactionState.dragOffsetY;
            this.renderFrame();
        }
    }

    drawSelectionOverlay() {
        if (!this.selectedClipId) return;

        const clip = this.findClipById(this.selectedClipId);
        if (!clip || clip.x === undefined) return;

        this.ctx.save();
        this.ctx.strokeStyle = '#d4af37';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([6, 4]);

        this.ctx.strokeRect(clip.x - 50, clip.y - 30, 100, 60);
        this.ctx.restore();
    }

    findClipById(id) {
        for (let key in this.tracks) {
            const clip = this.tracks[key].clips.find(c => c.id === id);
            if (clip) return clip;
        }
        return null;
    }

    /**
     * 17. توليد شريط المصغرات السينمائية للتايم لاين (InShot Filmstrip Generator)
     */
    generateVideoFilmstrip(clip, containerEl) {
        if (!containerEl || !clip || !clip.element) return;

        const duration = clip.endTime - clip.startTime;
        const numberOfThumbnails = Math.min(Math.max(Math.floor(duration * 1.5), 3), 15);

        const stripHolder = document.createElement('div');
        stripHolder.className = 'filmstrip-holder';
        stripHolder.style.cssText = "display: flex; height: 100%; width: 100%; overflow: hidden; position: relative;";

        // اسم الكليب العائم
        const headerTitle = document.createElement('div');
        headerTitle.className = 'track-clip-title-bar';
        headerTitle.style.cssText = "font-size: 10px; font-weight: bold; color: #ffffff; background: rgba(0,0,0,0.6); padding: 2px 6px; position: absolute; top: 2px; left: 4px; z-index: 10; border-radius: 4px;";
        headerTitle.innerHTML = `🎬 ${clip.name} • ${duration.toFixed(1)}s`;
        stripHolder.appendChild(headerTitle);

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = 60;
        tempCanvas.height = 40;

        for (let i = 0; i < numberOfThumbnails; i++) {
            const thumbImg = document.createElement('img');
            thumbImg.className = 'filmstrip-frame';
            thumbImg.style.cssText = "height: 100%; width: 50px; object-fit: cover; border-right: 1px solid rgba(0,0,0,0.3); opacity: 0.85;";

            // رسم الفريم من الفيديو
            tempCtx.drawImage(clip.element, 0, 0, tempCanvas.width, tempCanvas.height);
            thumbImg.src = tempCanvas.toDataURL('image/jpeg', 0.5);
            stripHolder.appendChild(thumbImg);
        }

        containerEl.appendChild(stripHolder);
    }

    /**
     * 18. تحديث زمن وشكل التايم لاين والمصغرات
     */
    updateTimelineUI() {
        const trackMainContainer = document.getElementById('trackMainVideoClips');
        if (!trackMainContainer) return;

        const mainClips = this.tracks.mainVideo.clips;
        if (mainClips.length > 0) {
            trackMainContainer.innerHTML = '';
            mainClips.forEach(clip => {
                const clipBlock = document.createElement('div');
                clipBlock.className = 'clip-item-block';
                clipBlock.style.cssText = "height: 52px; background: #181d22; border: 1px solid #2a9d8f; border-radius: 8px; position: relative; overflow: hidden; display: inline-flex; min-width: 150px; margin-right: 6px;";

                this.generateVideoFilmstrip(clip, clipBlock);
                trackMainContainer.appendChild(clipBlock);
            });
        }
    }

    updateTimecodeDisplays() {
        const curEl = document.getElementById('rulerCurrentTime');
        const durEl = document.getElementById('rulerTotalDuration');
        const tcEl = document.getElementById('timecodeDisplay');

        const curTxt = this.formatTime(this.currentTime);
        const durTxt = this.formatTime(this.duration);

        if (curEl) curEl.textContent = curTxt;
        if (durEl) durEl.textContent = durTxt;
        if (tcEl) tcEl.textContent = `${curTxt} / ${durTxt}`;
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return "00:00.0";
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(1);
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    saveHistoryState() {
        const snapshot = JSON.stringify({
            tracks: this.tracks,
            keyframes: this.keyframes
        });

        if (this.historyIndex < this.historyStack.length - 1) {
            this.historyStack = this.historyStack.slice(0, this.historyIndex + 1);
        }

        this.historyStack.push(snapshot);
        if (this.historyStack.length > this.maxHistorySteps) {
            this.historyStack.shift();
        }
        this.historyIndex = this.historyStack.length - 1;
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreHistorySnapshot(this.historyStack[this.historyIndex]);
        }
    }

    redo() {
        if (this.historyIndex < this.historyStack.length - 1) {
            this.historyIndex++;
            this.restoreHistorySnapshot(this.historyStack[this.historyIndex]);
        }
    }

    restoreHistorySnapshot(snapshotJson) {
        if (!snapshotJson) return;
        const data = JSON.parse(snapshotJson);
        this.tracks = data.tracks || this.tracks;
        this.keyframes = data.keyframes || this.keyframes;
        this.updateTimelineUI();
        this.renderFrame();
    }
}

// إنشاء النسخة التنفيذية عالمياً
window.athrEngine = new AthrCoreEngine();
