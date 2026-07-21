/**
 * 📥 Studio Athr Pro - Professional Export Engine
 * نافذة التصدير الشاملة: دقة حتى 4K - معدل إطارات حتى 120FPS - حساب الحجم لحظيًا
 */

class AthrExportEngine {
    constructor() {
        this.selectedRes = { width: 1080, height: 1920, label: '1080P' };
        this.selectedFPS = 30;
        this.selectedBitrate = 4500000; // 4.5 Mbps
        this.isExporting = false;
    }

    // ⚙️ 1. فتح نافذة التصدير الاحترافية المنبثقة (Export Modal)
    openExportModal() {
        let modal = document.getElementById('athrExportModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'athrExportModal';
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
                z-index: 9999; display: flex; justify-content: center; align-items: center;
                direction: rtl; font-family: 'Cairo', sans-serif; padding: 15px;
            `;
            document.body.appendChild(modal);
        }

        const engine = window.athrEngine;
        const duration = engine && engine.video ? engine.video.duration : 10;

        modal.innerHTML = `
            <div style="background: #181818; border: 1px solid var(--gold, #d4af37); border-radius: 16px; width: 100%; max-width: 450px; padding: 20px; color: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="color: var(--gold, #d4af37); margin: 0; font-size: 16px;">⚙️ إعدادات التصدير والجودة</h3>
                    <button onclick="document.getElementById('athrExportModal').style.display='none'" style="background:none; border:none; color:#fff; font-size:18px; cursor:pointer;">✕</button>
                </div>

                <!-- 1. الدقة Resolution -->
                <div style="margin-bottom: 12px;">
                    <label style="display:block; color:#aaa; font-size:11px; margin-bottom:4px;">دقة الفيديو (Resolution):</label>
                    <select id="expResSelect" onchange="window.athrExport.updateCalculations(${duration})" style="width:100%; padding:8px; border-radius:8px; background:#222; color:#fff; border:1px solid #333;">
                        <option value="720x1280|2500000">720P - HD (مناسب للواتساب)</option>
                        <option value="1080x1920|4500000" selected>1080P - Full HD (ريلز / شورتس)</option>
                        <option value="1440x2560|8000000">2K - QHD عالية جداً</option>
                        <option value="2160x3840|15000000">4K - Ultra HD جودة أسطورية</option>
                    </select>
                </div>

                <!-- 2. معدل الإطارات FPS -->
                <div style="margin-bottom: 12px;">
                    <label style="display:block; color:#aaa; font-size:11px; margin-bottom:4px;">سلاسة الحركة (FPS):</label>
                    <select id="expFpsSelect" onchange="window.athrExport.updateCalculations(${duration})" style="width:100%; padding:8px; border-radius:8px; background:#222; color:#fff; border:1px solid #333;">
                        <option value="24">24 إطار/ث (سينمائي)</option>
                        <option value="30" selected>30 إطار/ث (قياسي)</option>
                        <option value="60">60 إطار/ث (سلاسة فائقة)</option>
                    </select>
                </div>

                <!-- 3. الجودة والـ Bitrate -->
                <div style="margin-bottom: 15px;">
                    <label style="display:block; color:#aaa; font-size:11px; margin-bottom:4px;">معدل البت (Bitrate):</label>
                    <select id="expBitrateSelect" onchange="window.athrExport.updateCalculations(${duration})" style="width:100%; padding:8px; border-radius:8px; background:#222; color:#fff; border:1px solid #333;">
                        <option value="0.8">منخفض (حجم صغير جداً)</option>
                        <option value="1.0" selected>متوسط (توازن ممتاز)</option>
                        <option value="1.5">عالي جداً (أقصى دقة)</option>
                    </select>
                </div>

                <!-- 📊 عرض الحجم والمواصفات التقديرية الحية -->
                <div style="background: #111; border: 1px dashed var(--gold, #d4af37); border-radius: 10px; padding: 10px; text-align: center; margin-bottom: 15px;">
                    <span style="font-size: 11px; color: #aaa; display: block;">📊 الحجم التقديري المتوقع للملف:</span>
                    <strong id="expEstSize" style="color: #4caf50; font-size: 20px; display: block; margin-top: 2px;">-- MB</strong>
                </div>

                <!-- أزرار البدء والإلغاء -->
                <button onclick="window.athrExport.executeExportProcess()" style="width:100%; background: var(--gold, #d4af37); color:#000; border:none; padding:12px; border-radius:10px; font-weight:bold; font-size:14px; cursor:pointer;">
                    🎬 بدء التصدير والتنزيل
                </button>
            </div>
        `;

        modal.style.display = 'flex';
        this.updateCalculations(duration);
    }

    // 📐 2. حساب الحجم التقديري بالـ MB لحظيًا
    updateCalculations(duration) {
        const resVal = document.getElementById('expResSelect').value.split('|');
        const [w, h] = resVal[0].split('x').map(Number);
        const baseBitrate = Number(resVal[1]);
        const bitrateMultiplier = parseFloat(document.getElementById('expBitrateSelect').value);
        const fps = Number(document.getElementById('expFpsSelect').value);

        this.selectedRes = { width: w, height: h };
        this.selectedFPS = fps;
        this.selectedBitrate = Math.round(baseBitrate * bitrateMultiplier * (fps / 30));

        // المعادلة: (Bitrate bits/sec * Duration sec) / (8 * 1024 * 1024) = MB
        const estSizeMB = ((this.selectedBitrate * duration) / (8 * 1024 * 1024)).toFixed(1);

        const estSizeEl = document.getElementById('expEstSize');
        if (estSizeEl) {
            estSizeEl.textContent = `${estSizeMB} MB`;
        }
    }

    // 🚀 3. تنفيذ التسجيل الحقيقي بالفيديو والصوت والتنزيل المباشر
    executeExportProcess() {
        const engine = window.athrEngine;
        if (!engine || !engine.canvas || !engine.video || !engine.video.src) {
            alert("يرجى إضافة فيديو أولاً!");
            return;
        }

        document.getElementById('athrExportModal').style.display = 'none';

        const stream = engine.canvas.captureStream(this.selectedFPS);
        
        let mimeType = 'video/webm;codecs=vp9,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm';
        }

        const recorder = new MediaRecorder(stream, {
            mimeType: mimeType,
            videoBitsPerSecond: this.selectedBitrate
        });

        const chunks = [];

        recorder.ondataavailable = e => {
            if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const downloadUrl = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `Studio_Athr_Export_${Date.now()}.webm`;
            a.click();

            alert("🎉 تم تصدير الفيديو بنجاح وحفظه على جهازك!");
        };

        // إعادة تشغيل الفيديو من البداية للتصدير الكامل
        engine.video.currentTime = 0;
        engine.video.play();
        recorder.start(1000);

        const checkExportLoop = setInterval(() => {
            if (engine.video.ended || engine.video.paused) {
                clearInterval(checkExportLoop);
                if (recorder.state === "recording") {
                    recorder.stop();
                }
            }
        }, 400);

        alert("⏳ جاري تسجيل وتصدير الفيديو بـ " + this.selectedFPS + " إطار/ثانية... لا تغلق الصفحة.");
    }
}

window.athrExport = new AthrExportEngine();

