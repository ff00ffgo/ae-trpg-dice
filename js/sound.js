let audioCtx = null;

function getAudioContext() {
    if (soundMuted) return null;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) {
        audioCtx = new Ctx();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
    }
    return audioCtx;
}

function toggleSoundMute() {
    soundMuted = !soundMuted;
    updateSoundToggleButton();
    if (!soundMuted) {
        playSpellSound('arcane');
    }
}

function updateSoundToggleButton() {
    const btn = document.getElementById('btnSoundToggle');
    if (!btn) return;
    btn.textContent = soundMuted ? "音效：靜音" : "音效：開啟";
    btn.className = soundMuted
        ? "tactile-btn step-btn px-5 py-3 bg-dark-700 hover:bg-dark-600 border-2 border-dark-500 text-gray-400 rounded-2xl font-black text-base"
        : "tactile-btn step-btn px-5 py-3 bg-indigo-900/70 hover:bg-indigo-800 border-2 border-indigo-500 text-indigo-200 rounded-2xl font-black text-base";
}

// 一般擲骰音效（輕快短促的滴答/骰落聲）
function playDiceRollSound() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [0, 0.055].forEach((offset, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + offset;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(i === 0 ? 340 : 460, start);
        osc.frequency.exponentialRampToValueAtTime(180, start + 0.05);
        gain.gain.setValueAtTime(0.11, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.055);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.06);
    });
}

// N20 大成功音效（明亮上揚琶音）
function playCritSound() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [587.33, 783.99, 987.77, 1174.66];
    notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.065;
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.11, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.24);
    });
}

// N1 大失敗音效（低沉下滑音）
function playFailSound() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.linearRampToValueAtTime(72, now + 0.55);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);
}

// 法術與搞笑試聽音效
function playSpellSound(type) {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'fire') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(190, now);
        osc.frequency.exponentialRampToValueAtTime(42, now + 0.45);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
    } else if (type === 'heal') {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = now + idx * 0.07;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.14, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
            osc.connect(gain).connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.26);
        });
    } else if (type === 'curse') {
        [110, 116.54].forEach(freq => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.linearRampToValueAtTime(freq * 0.72, now + 0.55);
            gain.gain.setValueAtTime(0.16, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
            osc.connect(gain).connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.6);
        });
    } else if (type === 'lightning') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1320, now);
        osc.frequency.exponentialRampToValueAtTime(95, now + 0.18);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.21);
    } else if (type === 'boing') {
        // 彈簧上下震盪搞笑聲
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.12);
        osc.frequency.exponentialRampToValueAtTime(240, now + 0.24);
        osc.frequency.exponentialRampToValueAtTime(560, now + 0.35);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.42);
    } else if (type === 'trombone') {
        // 搞笑下滑音（wah-wah-waaaah）
        const steps = [
            { f1: 311.13, f2: 293.66, t: 0, d: 0.16 },
            { f1: 293.66, f2: 277.18, t: 0.18, d: 0.16 },
            { f1: 277.18, f2: 146.83, t: 0.36, d: 0.45 }
        ];
        steps.forEach(s => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = now + s.t;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(s.f1, start);
            osc.frequency.linearRampToValueAtTime(s.f2, start + s.d);
            gain.gain.setValueAtTime(0.12, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + s.d + 0.03);
            osc.connect(gain).connect(ctx.destination);
            osc.start(start);
            osc.stop(start + s.d + 0.04);
        });
    } else if (type === 'laser') {
        // 逗趣雷射 biu~
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.16);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.19);
    } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.22);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
    }
}