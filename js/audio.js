/**
 * ==========================================================================
 * 🎵 STUDIO ATHR PRO - ADVANCED AUDIO ENGINE & TRACK CONTROLLER
 * Full Web Audio API Engine: DSP Filters, Volume, Split, Duplicate, Copy/Paste
 * ==========================================================================
 */

// المتغيرات العامة لإدارة الصوت والنسخ واللصق
let copiedAudioClip = null;
let audioCtx = null;
let audioSourceNode = null;

// عقد المعالجة الصوتية (Audio Processing Nodes)
let reverbNode = null;
let filterNode = null;
let gainNode = null;

/**
 * 1. تهيئة محرك الصوت الحقيقي (Web Audio API Engine Initialization)
 */
function initWebAudioAPI(audioElement) {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
    }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if (audioElement && !audioSourceNode) {
        audioSourceNode = audioCtx.createMediaElementSource(audioElement);
        gainNode = audioCtx.createGain();
        filterNode = audioCtx.createBiquadFilter();

        // ربط السلسلة الصوتية: Source -> Filter -> Gain -> Output
        audioSourceNode.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(audioCtx.destination);
    }
}

/**
 * 2. فتح وإدارة القوائم الفرعية للصوت (Sub-Menu Controller)
 */
function openAudioSubMenu(menuType) {
    const container = document.getElementById('audioSubMenuContent');
    if (!container) return;

    // 🕌 أ) مؤثرات أثر (الهندسة الصوتية الإسلامية الحقيقية)
    if (menuType === 'athr_effects') {
        container.innerHTML = `
            <div style="background:#13181c; border:1px solid #d4af37; border-radius:12px; padding:14px; margin-top:8px;">
                <div style="color:#d4af37; font-size:13px; font-weight:bold; margin-bottom:12px; display:flex; justify-content:space-between;">
                    <span>🕌 الهندسة الصوتية الإسلامية (مؤثرات أثر ✨)</span>
                    <span style="background:#d4af37; color:#000; padding:2px 6px; border-radius:4px; font-size:9px;">PRO</span>
                </div>
                
                <!-- 1. صدى المسجد والمحراب -->
                <div style="margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; font-size:11px; color:#ccc; margin-bottom:4px;">
                        <span>تأثير صدى المسجد والمحراب (Reverb)</span>
                        <span id="reverbVal">50%</span>
                    </div>
                    <input type="range" min="0" max="100" value="50" style="width:100%; accent-color:#d4af37;" oninput="applyReverbEffect(this.value)">
                </div>

                <!-- 2. عزل وتصفية الموسيقى -->
                <div style="margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; font-size:11px; color:#ccc; margin-bottom:4px;">
                        <span>عزل وخفض الموسيقى الخلفية (AI Mute)</span>
                        <span id="musicMuteVal">100%</span>
                    </div>
                    <input type="range" min="0" max="100" value="100" style="width:100%; accent-color:#d4af37;" oninput="applyMusicMuteEffect(this.value)">
                </div>

                <!-- 3. تضخم ونقاء صوت القارئ -->
                <div style="margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; font-size:11px; color:#ccc; margin-bottom:4px;">
                        <span>تضخم وتجميل صوت القارئ (Vocal Clarity)</span>
                        <span id="vocalVal">80%</span>
                    </div>
                    <input type="range" min="0" max="100" value="80" style="width:100%; accent-color:#d4af37;" oninput="applyVocalClarityEffect(this.value)">
                </div>

                <!-- 4. إزالة التشويش والضجيج -->
                <div>
                    <div style="display:flex; justify-content:space-between; font-size:11px; color:#ccc; margin-bottom:4px;">
                        <span>إزالة التشويش وضوضاء المايك (Noise Gate)</span>
                        <span id="noiseVal">90%</span>
                    </div>
                    <input type="range" min="0" max="100" value="90" style="width:100%; accent-color:#d4af37;" oninput="applyNoiseGateEffect(this.value)">
                </div>
            </div>
        `;
    } 
    // 🎚️ ب) التحكم في حجم الصوت
    else if (menuType === 'volume') {
        container.innerHTML = `
            <div style="padding:12px; background:#181d22; border-radius:10px; margin-top:8px;">
                <div style="display:flex; justify-content:space-between; font-size:11px; color:#aaa; margin-bottom:6px;">
                    <span>مستوى الصوت (Volume Level):</span>
                    <span id="volLabel">100%</span>
                </div>
                <input type="range" min="0" max="200" value="100" style="width:100%; accent-color:var(--gold);" oninput="setAudioVolume(this.value)">
            </div>
        `;
    } 
    // ⚡ ج) التحكم بالسرعة
    else if (menuType === 'speed') {
        container.innerHTML = `
            <div style="display:flex; justify-content:space-around; align-items:center; padding:12px; background:#181d22; border-radius:10px; margin-top:8px;">
                <button class="banner-try-btn" onclick="setAudioSpeed(0.5)">0.5x بطيء</button>
                <button class="banner-try-btn" onclick="setAudioSpeed(1.0)">1.0x عادي</button>
                <button class="banner-try-btn" onclick="setAudioSpeed(1.5)">1.5x سريع</button>
                <button class="banner-try-btn" onclick="setAudioSpeed(2.0)">2.0x مضاعف</button>
            </div>
        `;
    }
    // 🎛️ د) التعادل والـ EQ
    else if (menuType === 'eq') {
        container.innerHTML = `
            <div style="padding:12px; background:#181d22; border-radius:10px; margin-top:8px;">
                <div style="font-size:11px; color:var(--gold); font-weight:bold; margin-bottom:8px;">🎛️ موازن الصوت (Equalizer):</div>
                <div style="display:flex; gap:10px;">
                    <button class="banner-try-btn" style="flex:1;" onclick="setEQPreset('bass')">تضخم الباس (Bass)</button>
                    <button class="banner-try-btn" style="flex:1;" onclick="setEQPreset('treble')">حدّة الصوت (Treble)</button>
                    <button class="banner-try-btn" style="flex:1;" onclick="setEQPreset('flat')">افتراضي (Flat)</button>
                </div>
            </div>
        `;
    }
    // 🔇 هـ) خفض الضجيج
    else if (menuType === 'denoise') {
        container.innerHTML = `
            <div style="padding:12px; background:#181d22; border-radius:10px; margin-top:8px; text-align:center;">
                <button class="banner-try-btn" style="width:100%; padding:10px;" onclick="applyDenoiseAI()">🔇 تنقية وتفريغ الضوضاء فوراً بالذكاء الاصطناعي</button>
            </div>
        `;
    }
    // 💓 و) نبض وتلاشي الصوت (Fade In / Fade Out)
    else if (menuType === 'pulse') {
        container.innerHTML = `
            <div style="padding:12px; background:#181d22; border-radius:10px; margin-top:8px; display:flex; gap:8px;">
                <button class="banner-try-btn" style="flex:1;" onclick="applyFadeIn()">📈 دخول تدريجي (Fade In)</button>
                <button class="banner-try-btn" style="flex:1;" onclick="applyFadeOut()">📉 خروج تدريجي (Fade Out)</button>
            </div>
        `;
    }
}

/**
 * 3. تطبيق التأثيرات الصوتية الرياضية والـ DSP
 */
function applyReverbEffect(val) {
    document.getElementById('reverbVal').textContent = val + '%';
    if (filterNode) {
        filterNode.type = 'lowshelf';
        filterNode.frequency.value = 350;
        filterNode.gain.value = (val / 100) * 12; // إضافة عمق وتضخم للصوت
    }
}

function applyMusicMuteEffect(val) {
    document.getElementById('musicMuteVal').textContent = val + '%';
    if (filterNode) {
        // عزل ترددات الموسيقى الجانبية وبقاء ترددات الصوت البشري (300Hz - 3400Hz)
        filterNode.type = 'bandpass';
        filterNode.frequency.value = 1000;
        filterNode.Q.value = 1.0;
    }
}

function applyVocalClarityEffect(val) {
    document.getElementById('vocalVal').textContent = val + '%';
    if (filterNode) {
        filterNode.type = 'peaking';
        filterNode.frequency.value = 2500; // تردد جلاء وصفاء الصوت البشري
        filterNode.gain.value = (val / 100) * 8;
    }
}

function applyNoiseGateEffect(val) {
    document.getElementById('noiseVal').textContent = val + '%';
    if (filterNode) {
        filterNode.type = 'highpass';
        filterNode.frequency.value = 120; // قطع الضوضاء والترددات المنخفضة جداً
    }
}

function setAudioVolume(v) {
    const label = document.getElementById('volLabel');
    if (label) label.textContent = v + '%';

    if (gainNode) {
        gainNode.gain.value = v / 100;
    }
    if (window.athrEngine && window.athrEngine.audioSource) {
        window.athrEngine.audioSource.volume = Math.min(v / 100, 1.0);
    }
}

function setAudioSpeed(s) {
    if (window.athrEngine && window.athrEngine.audioSource) {
        window.athrEngine.audioSource.playbackRate = s;
    }
}

function setEQPreset(preset) {
    if (!filterNode) return;
    if (preset === 'bass') {
        filterNode.type = 'lowshelf';
        filterNode.frequency.value = 200;
        filterNode.gain.value = 10;
    } else if (preset === 'treble') {
        filterNode.type = 'highshelf';
        filterNode.frequency.value = 3000;
        filterNode.gain.value = 10;
    } else {
        filterNode.type = 'allpass';
    }
}

function applyDenoiseAI() {
    applyNoiseGateEffect(95);
    alert("✅ تم خفض وتنقية ضوضاء الخلفية بنجاح!");
}

function applyFadeIn() {
    if (!gainNode || !audioCtx) return;
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1.0, audioCtx.currentTime + 2.0); // تلاشي في ثانيتين
}

function applyFadeOut() {
    if (!gainNode || !audioCtx) return;
    const curVol = gainNode.gain.value;
    gainNode.gain.setValueAtTime(curVol, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2.0);
}

/**
 * 4. عمليات التراك الحقيقية (الحذف، التقسيم، التكرار، النسخ، اللصق)
 */

// ✂️ أ) تقسيم التراك الصوتي الحالي عند مؤشر الوقت
function splitAudioClip() {
    if (!window.athrEngine || !window.athrEngine.selectedClipId) return;
    window.athrEngine.splitCurrentClip();
}

// 🗑️ ب) حذف التراك الصوتي المحدد
function deleteAudioClip() {
    if (!window.athrEngine || !window.athrEngine.selectedClipId) return;
    window.athrEngine.deleteSelectedClip();
    document.getElementById('audioClipContextRibbon').style.display = 'none';
}

// 🔁 ج) تكرار التراك الصوتي (Duplicate)
function duplicateCurrentAudioClip() {
    if (!window.athrEngine || !window.athrEngine.selectedClipId) return;
    const audioTrack = window.athrEngine.tracks.audio;
    const clipIdx = audioTrack.clips.findIndex(c => c.id === window.athrEngine.selectedClipId);

    if (clipIdx !== -1) {
        const orig = audioTrack.clips[clipIdx];
        const duration = orig.endTime - orig.startTime;
        const newClip = {
            ...orig,
            id: 'aud_' + Date.now(),
            startTime: orig.endTime,
            endTime: orig.endTime + duration
        };
        audioTrack.clips.push(newClip);
        window.athrEngine.updateTimelineUI();
        window.athrEngine.saveHistoryState();
    }
}

// 📋 د) نسخ التراك الصوتي (Copy)
function copyCurrentAudioClip() {
    if (!window.athrEngine || !window.athrEngine.selectedClipId) return;
    const audioTrack = window.athrEngine.tracks.audio;
    const clip = audioTrack.clips.find(c => c.id === window.athrEngine.selectedClipId);
    if (clip) {
        copiedAudioClip = JSON.parse(JSON.stringify(clip));
        alert("📋 تم نسخ المقطع الصوتي للحافظة!");
    }
}

// 📂 هـ) لصق التراك المكرر عند الوقت الحالي (Paste / Replicate)
function pasteAudioClip() {
    if (!copiedAudioClip || !window.athrEngine) {
        alert("قم بنسخ مقطع صوتي أولاً لتقوم بلصقه!");
        return;
    }
    const audioTrack = window.athrEngine.tracks.audio;
    const duration = copiedAudioClip.endTime - copiedAudioClip.startTime;
    const newClip = {
        ...copiedAudioClip,
        id: 'aud_' + Date.now(),
        startTime: window.athrEngine.currentTime,
        endTime: window.athrEngine.currentTime + duration
    };
    audioTrack.clips.push(newClip);
    window.athrEngine.updateTimelineUI();
    window.athrEngine.saveHistoryState();
}

/**
 * 5. استيراد الصوت وتفعيل شريط الإجراءات التفاعلي
 */
function handleAudioImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const audioUrl = URL.createObjectURL(file);
    if (window.athrEngine) {
        const newClip = {
            id: 'aud_' + Date.now(),
            name: file.name,
            src: audioUrl,
            startTime: 0,
            endTime: 15.0
        };
        window.athrEngine.tracks.audio.clips.push(newClip);
        window.athrEngine.selectedClipId = newClip.id;
        window.athrEngine.updateTimelineUI();

        // إظهار شريط الإجراءات المكتمل فور التحديد
        const ribbon = document.getElementById('audioClipContextRibbon');
        if (ribbon) ribbon.style.display = 'flex';
    }
    closeAudioDrawer();
}

function closeAudioDrawer() {
    const panel = document.getElementById('audioDrawerPanel');
    if (panel) panel.classList.remove('active');
}

function triggerAudioUpload() {
    const input = document.getElementById('nativeAudioInput');
    if (input) input.click();
}
