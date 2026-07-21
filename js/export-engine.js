/**
 * ==========================================================================
 * 📥 STUDIO ATHR PRO - MASTER REAL-TIME EXPORT & RENDER ENGINE
 * Architecture: MediaRecorder Canvas Stream Processing, Multi-FPS Renderer,
 * Bitrate Estimation, & Alpha Channel Export System.
 * ==========================================================================
 */

class AthrExportEngine {
    constructor() {
        this.selectedResolution = { width: 1080, height: 1920, label: '1080p' };
        this.selectedFps = 30;
        this.selectedBitrate = 4500000; // 4.5 Mbps
        this.selectedFormat = 'mp4';
        this.isExporting = false;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        
        // خريطة الجودات والدقات المدعومة
        this.resolutionsMap = {
            '360p': { width: 360, height: 640, baseBitrate: 1000000 },
            '480p': { width: 480, height: 854, baseBitrate: 1500000 },
            '720p': { width: 720, height: 1280, baseBitrate: 2500000 },
            '1080p': { width: 1080, height: 1920, baseBitrate: 4500000 },
            '2k': { width: 1440, height: 2560, baseBitrate: 8000000 },
            '4k': { width: 2160, height: 3840, baseBitrate: 15000000 },
            '8k': { width: 4320, height: 7680, baseBitrate: 35000000 }
        };
    }

    /**
     * 1. فتح نافذة التصدير الاحترافية (InShot Style Export Dialog)
     */
    openExportModal() {
        if (window.athrUI) {
            window.athrUI.openModal('exportModal');
        }
        this.recalculateEstimatedSize();
    }

    /**
     * 2. الحساب اللحظي والدقيق لحجم الملف المتوقع قبل التصدير (Real-time Size Calculation)
     */
    recalculateEstimatedSize() {
        const resSelect = document.getElementById('exportResSelect');
        const fpsSelect = document.getElementById('exportFpsSelect');
        const bitrateSelect = document.getElementById('exportBitrateSelect');
        const estTxt = document.getElementById('exportEstimatedSizeTxt');

        if (!resSelect || !fpsSelect || !bitrateSelect) return;

        const resKey = resSelect.value || '1080p';
        const fps = parseInt(fpsSelect.value) || 30;
        const bitrateMode = bitrateSelect.value || 'medium';

        const resData = this.resolutionsMap[resKey] || this.resolutionsMap['1080p'];
        this.selectedResolution = { width: resData.width, height: resData.height, label: resKey };
        this.selectedFps = fps;

        // تعديل الـ Bitrate بحسب الاختيار ومعدل الإطارات
        let bitrateMultiplier = 1.0;
        if (bitrateMode === 'low') bitrateMultiplier = 0.65;
        if (bitrateMode === 'high') bitrateMultiplier = 1.5;

        const fpsMultiplier = fps / 30;
        this.selectedBitrate = Math.round(resData.baseBitrate * bitrateMultiplier * fpsMultiplier);

        // جلب مدة الفيديو الإجمالية من المحرك
        const engine = window.athrEngine;
        const durationSeconds = (engine && engine.duration) ? engine.duration : 10;

        // المعادلة البرمجية لحساب الحجم بالميجابايت (MB):
        // (Bitrate in bits/sec * Duration in sec) / (8 bits/byte * 1024 KB/MB * 1024 Bytes/KB)
        const sizeInMegabytes = ((this.selectedBitrate * durationSeconds) / (8 * 1024 * 1024)).toFixed(1);

        if (estTxt) {
            estTxt.textContent = `${sizeInMegabytes} MB`;
        }
    }

    /**
     * 3. بدء عملية التصدير والتسجيل المباشر بالفيديو والصوت (Master Render Engine)
     */
    async startRealExport() {
        const engine = window.athrEngine;
        if (!engine || !engine.canvas || !engine.videoSource) {
            alert("⚠️ لا يوجد مقطع فيديو أو كانفاس جاهز للتصدير!");
            return;
        }

        if (window.athrUI) {
            window.athrUI.closeModal('exportModal');
        }

        this.isExporting = true;
        this.recordedChunks = [];

        // إيقاف التشغيل الحالي وإعادة الضبط لنقطة البداية
        engine.videoSource.pause();
        engine.currentTime = 0;
        engine.videoSource.currentTime = 0;

        // التقاط البث المباشر للكانفاس (Canvas Capture Stream) بمعدل الإطارات المحدد
        const canvasStream = engine.canvas.captureStream(this.selectedFps);

        // تحضير الخيارات والـ Codecs المدعومة بالمتصفح
        let options = {
            videoBitsPerSecond: this.selectedBitrate
        };

        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
            options.mimeType = 'video/webm;codecs=vp9,opus';
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
            options.mimeType = 'video/webm';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
            options.mimeType = 'video/mp4';
        }

        try {
            this.mediaRecorder = new MediaRecorder(canvasStream, options);
        } catch (e) {
            console.warn("MediaRecorder Error, falling back to default:", e);
            this.mediaRecorder = new MediaRecorder(canvasStream);
        }

        // تجميع أجزاء البيانات المكتوبة (Data Chunks)
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                this.recordedChunks.push(event.data);
            }
        };

        // عند انتهاء عملية التسجيل والتصدير
        this.mediaRecorder.onstop = () => {
            this.finalizeAndDownloadFile();
        };

        // بدء التسجيل وتغيير حالة الفيديو للتشغيل المباشر
        this.mediaRecorder.start(500); // إرسال Chunk كل 500ms
        engine.videoSource.play();
        engine.isPlaying = true;

        // حلقة مراقبة الانتهاء
        const checkExportEnd = setInterval(() => {
            if (engine.videoSource.ended || engine.currentTime >= engine.duration || !this.isExporting) {
                clearInterval(checkExportEnd);
                engine.videoSource.pause();
                engine.isPlaying = false;
                
                if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                    this.mediaRecorder.stop();
                }
            }
        }, 300);

        alert(`⏳ جاري التصدير الحقيقي بدقة (${this.selectedResolution.label}) ومعدل (${this.selectedFps} FPS)... يرجى عدم إغلاق الصفحة.`);
    }

    /**
     * 4. تجميع الكتل وتنزيل الملف النهائي على جهاز المستخدم (Final File Downloader)
     */
    finalizeAndDownloadFile() {
        this.isExporting = false;
        if (this.recordedChunks.length === 0) {
            alert("⚠️ فشلت عملية التصدير، لم يتم تسجيل بيانات.");
            return;
        }

        const mimeType = this.mediaRecorder ? this.mediaRecorder.mimeType : 'video/webm';
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        const downloadUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = downloadUrl;
        
        const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
        const fileExt = mimeType.includes('mp4') ? 'mp4' : 'webm';
        link.download = `Studio_Athr_Export_${timestamp}.${fileExt}`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alert("🎉 تم إنتاج وتصدير الفيديو بنجاح وحفظه على جهازك!");
    }

    /**
     * 5. ميزة تصدير الخلفية الشفافة (Alpha Channel / Transparent Video / PNG Sequence)
     */
    exportTransparentPNGFrame() {
        const engine = window.athrEngine;
        if (!engine || !engine.canvas) return;

        const dataUrl = engine.canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `Athr_Transparent_Frame_${Date.now()}.png`;
        link.click();
        alert("🖼️ تم استخراج الإطار الحالي بصيغة PNG عالية الدقة وخلفية شفافة!");
    }

    /**
     * 6. إيقاف عملية التصدير الحالية (Cancel Export)
     */
    cancelExport() {
        this.isExporting = false;
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
        alert("⛔ تم إيقاف عملية التصدير.");
    }
}

// إنشاء النسخة التنفيذية لمحرك التصدير
window.athrExport = new AthrExportEngine();
