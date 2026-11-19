const STORAGE_KEY = 'trpg_dice_sheet_save_v6';
const MAX_WEAPON_SLOTS = 3;
const VALID_SOUNDS = ['fire', 'arcane', 'heal', 'curse', 'lightning', 'boing', 'trombone', 'laser'];

function createDefaultWeaponSlots() {
    return [
        { name: '武器 1', attr: 'STR', prof: true, extra: 0 }
    ];
}

function createDefaultSpellSlots() {
    const slots = {};
    for (let lvl = 1; lvl <= 9; lvl++) {
        slots[lvl] = { max: 0, left: 0 };
    }
    return slots;
}

let characterLabel = '';
let numericValues = {
    globalPB: 0,
    poolModifier: 0,
    STR: 0, DEX: 0, INT: 0, WIS: 0, CHA: 0, CON: 0
};

let extraCombatValues = {
    INIT: 0,
    SPELL_ATK: 0
};

let weaponSlots = createDefaultWeaponSlots();
let selectedWeaponIndex = 0;
let spellAttr = 'INT';

let saveProficiencies = {
    STR: false, DEX: false, INT: false, WIS: false, CHA: false, CON: false
};

let skillProficiencies = {};
let maxSpellLevel = 6;
let spellSystemVisible = true;
let spellsList = [];
let spellSlots = createDefaultSpellSlots();
let soundMuted = false;

// 種子碼追蹤與未備份提醒狀態
let lastExportedSeedHash = '';
let hasUnsavedSeedChanges = false;

function formatSigned(v) {
    return (v >= 0 ? "+" : "") + v;
}

function computeShortHash(str) {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).toUpperCase().padStart(8, '0').slice(0, 6);
}

function getCurrentPayloadHash() {
    return computeShortHash(JSON.stringify(buildSavePayload()));
}

function updateSaveHint(text, isError = false) {
    const el = document.getElementById('saveStatusHint');
    if (!el) return;
    el.textContent = text;
    el.className = isError
        ? "text-sm font-bold text-rose-400"
        : "text-sm font-bold text-emerald-400";
}

function updateSeedTrackingUI() {
    const currentHash = getCurrentPayloadHash();
    const displayName = characterLabel.trim() || '未命名角色';
    const badgeText = `${displayName} (#${currentHash})`;

    const headerBadge = document.getElementById('headerSeedBadge');
    if (headerBadge) {
        headerBadge.textContent = hasUnsavedSeedChanges
            ? `目前存檔：${badgeText}｜有新變動尚未複製種子碼`
            : `目前存檔：${badgeText}`;
        headerBadge.className = hasUnsavedSeedChanges
            ? "text-xs font-black text-amber-300 mt-0.5"
            : "text-xs font-bold text-gray-400 mt-0.5";
    }

    const activeTag = document.getElementById('activeSeedTag');
    if (activeTag) {
        activeTag.textContent = `目前識別碼：#${currentHash}（${displayName}）`;
    }

    const backupBanner = document.getElementById('seedBackupWarning');
    if (backupBanner) {
        if (hasUnsavedSeedChanges) {
            backupBanner.className = "bg-amber-950/70 border-2 border-amber-500 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2";
            backupBanner.innerHTML = `
                <span class="text-sm sm:text-base font-black text-amber-300">提醒：你剛剛修改了角色或法術設定，請記得按「產生並複製存檔碼」更新備份！</span>
                <button onclick="generateAndCopySeed()" class="tactile-btn px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-dark-900 rounded-xl font-black text-sm shrink-0">
                    立即更新存檔碼
                </button>
            `;
        } else {
            backupBanner.className = "bg-emerald-950/40 border border-emerald-700/70 rounded-2xl px-4 py-2.5 flex items-center justify-between";
            backupBanner.innerHTML = `
                <span class="text-sm font-bold text-emerald-300">目前數值已與最新種子碼（#${currentHash}）同步。</span>
            `;
        }
    }
}

function normalizeWeaponList(list) {
    if (!Array.isArray(list) || list.length === 0) {
        return createDefaultWeaponSlots();
    }
    return list.slice(0, MAX_WEAPON_SLOTS).map((w, idx) => ({
        name: typeof w?.name === 'string' && w.name.trim() ? w.name.trim() : `武器 ${idx + 1}`,
        attr: w?.attr === 'DEX' ? 'DEX' : 'STR',
        prof: Boolean(w?.prof),
        extra: typeof w?.extra === 'number' && !Number.isNaN(w.extra) ? w.extra : 0
    }));
}

function normalizeSpellsList(list) {
    if (!Array.isArray(list)) return [];
    return list.map((s, idx) => ({
        id: typeof s?.id === 'string' && s.id ? s.id : `spell_${Date.now()}_${idx}`,
        name: typeof s?.name === 'string' && s.name.trim() ? s.name.trim() : `未命名法術 ${idx + 1}`,
        level: typeof s?.level === 'number' && s.level >= 0 && s.level <= 9 ? s.level : 0,
        hasAttack: Boolean(s?.hasAttack),
        prepared: s?.prepared === undefined ? true : Boolean(s.prepared),
        diceFormula: typeof s?.diceFormula === 'string' && s.diceFormula.trim() ? s.diceFormula.trim().toUpperCase() : '1D6',
        bonus: typeof s?.bonus === 'number' && !Number.isNaN(s.bonus) ? s.bonus : 0,
        sound: VALID_SOUNDS.includes(s?.sound) ? s.sound : 'arcane',
        note: typeof s?.note === 'string' ? s.note : ''
    }));
}

function normalizeSpellSlots(raw) {
    const base = createDefaultSpellSlots();
    if (!raw || typeof raw !== 'object') return base;
    for (let lvl = 1; lvl <= 9; lvl++) {
        const item = raw[lvl];
        if (item && typeof item === 'object') {
            const max = Math.max(0, parseInt(item.max, 10) || 0);
            const left = Math.max(0, Math.min(max, parseInt(item.left, 10) || 0));
            base[lvl] = { max, left };
        }
    }
    return base;
}

function toggleSpellSystemVisible() {
    spellSystemVisible = !spellSystemVisible;
    updateSpellNavVisibilityUI();
    if (!spellSystemVisible && (currentActiveTab === 'spell_cfg' || currentActiveTab === 'spellbook')) {
        switchTab('roller');
    }
    persistToLocalStorage();
}

function updateSpellNavVisibilityUI() {
    const group = document.getElementById('spellNavGroup');
    const btn = document.getElementById('btnToggleSpellNav');
    if (group) group.classList.toggle('hidden', !spellSystemVisible);
    if (btn) btn.textContent = spellSystemVisible ? '隱藏法術書' : '顯示法術書';
}

function setMaxSpellLevel(levelLimit) {
    if (![4, 6, 9].includes(levelLimit)) return;
    maxSpellLevel = levelLimit;
    spellsList.forEach(s => {
        if (s.level > maxSpellLevel) s.level = maxSpellLevel;
    });
    if (typeof selectedSpellLevelFilter !== 'undefined' && selectedSpellLevelFilter !== 'all') {
        const fNum = parseInt(selectedSpellLevelFilter, 10);
        if (!Number.isNaN(fNum) && fNum > maxSpellLevel) {
            selectedSpellLevelFilter = 'all';
        }
    }
    renderSpellConfigPage();
    renderSpellbookPage();
    persistToLocalStorage();
}

function buildSavePayload() {
    return {
        v: 6,
        characterLabel,
        numericValues: { ...numericValues },
        extraCombatValues: { ...extraCombatValues },
        weaponSlots: weaponSlots.map(w => ({ ...w })),
        selectedWeaponIndex,
        spellAttr,
        saveProficiencies: { ...saveProficiencies },
        skillProficiencies: { ...skillProficiencies },
        maxSpellLevel,
        spellSystemVisible,
        spellsList: spellsList.map(s => ({ ...s })),
        spellSlots: JSON.parse(JSON.stringify(spellSlots))
    };
}

function applySavePayload(data) {
    if (!data || typeof data !== 'object') return false;
    characterLabel = typeof data.characterLabel === 'string' ? data.characterLabel : '';
    if (data.numericValues) {
        Object.keys(numericValues).forEach(k => {
            if (typeof data.numericValues[k] === 'number' && !Number.isNaN(data.numericValues[k])) {
                numericValues[k] = data.numericValues[k];
            }
        });
    }
    if (data.extraCombatValues) {
        Object.keys(extraCombatValues).forEach(k => {
            if (typeof data.extraCombatValues[k] === 'number' && !Number.isNaN(data.extraCombatValues[k])) {
                extraCombatValues[k] = data.extraCombatValues[k];
            }
        });
    }
    weaponSlots = Array.isArray(data.weaponSlots) ? normalizeWeaponList(data.weaponSlots) : createDefaultWeaponSlots();
    selectedWeaponIndex = (typeof data.selectedWeaponIndex === 'number' && data.selectedWeaponIndex >= 0 && data.selectedWeaponIndex < weaponSlots.length)
        ? data.selectedWeaponIndex
        : 0;

    if (data.spellAttr === 'INT' || data.spellAttr === 'WIS' || data.spellAttr === 'CHA') {
        spellAttr = data.spellAttr;
    }
    if (data.saveProficiencies) {
        Object.keys(saveProficiencies).forEach(k => {
            saveProficiencies[k] = Boolean(data.saveProficiencies[k]);
        });
    }
    if (data.skillProficiencies && typeof data.skillProficiencies === 'object') {
        skillProficiencies = { ...data.skillProficiencies };
    }
    maxSpellLevel = [4, 6, 9].includes(data.maxSpellLevel) ? data.maxSpellLevel : 6;
    spellSystemVisible = data.spellSystemVisible === undefined ? true : Boolean(data.spellSystemVisible);
    spellsList = Array.isArray(data.spellsList) ? normalizeSpellsList(data.spellsList) : [];
    spellSlots = data.spellSlots ? normalizeSpellSlots(data.spellSlots) : createDefaultSpellSlots();
    return true;
}

function persistToLocalStorage(markDirty = true) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(buildSavePayload()));
        if (markDirty) {
            const curHash = getCurrentPayloadHash();
            hasUnsavedSeedChanges = lastExportedSeedHash !== '' ? curHash !== lastExportedSeedHash : true;
        }
        updateSaveHint("已自動暫存於瀏覽器本機");
        updateSeedTrackingUI();
    } catch (e) {
        updateSaveHint("本機儲存空間無法寫入", true);
    }
}

function loadFromLocalStorage() {
    try {
        const raw =
            localStorage.getItem(STORAGE_KEY) ||
            localStorage.getItem('trpg_dice_sheet_save_v5') ||
            localStorage.getItem('trpg_dice_sheet_save_v4') ||
            localStorage.getItem('trpg_dice_sheet_save_v3') ||
            localStorage.getItem('trpg_dice_sheet_save_v2') ||
            localStorage.getItem('trpg_dice_sheet_save_v1');
        if (!raw) return;
        applySavePayload(JSON.parse(raw));
        lastExportedSeedHash = getCurrentPayloadHash();
        hasUnsavedSeedChanges = false;
    } catch (e) {
        // 忽略無效資料
    }
}

function generateAndCopySeed() {
    const jsonStr = JSON.stringify(buildSavePayload());
    const bytes = new TextEncoder().encode(jsonStr);
    let binStr = '';
    for (let i = 0; i < bytes.length; i++) {
        binStr += String.fromCharCode(bytes[i]);
    }
    const seed = 'TRPG6-' + btoa(binStr);
    const input = document.getElementById('seedCodeInput');
    if (input) input.value = seed;

    lastExportedSeedHash = getCurrentPayloadHash();
    hasUnsavedSeedChanges = false;
    persistToLocalStorage(false);

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(seed).then(() => {
            updateSaveHint(`已產生並複製存檔碼（#${lastExportedSeedHash}）至剪貼簿`);
        }).catch(() => {
            updateSaveHint(`已產生存檔碼（#${lastExportedSeedHash}），可手動全選複製`);
        });
    } else {
        updateSaveHint(`已產生存檔碼（#${lastExportedSeedHash}），可手動全選複製`);
    }
}

function loadFromSeedInput() {
    const rawInput = document.getElementById('seedCodeInput')?.value.trim() || '';
    if (!rawInput) {
        updateSaveHint("請先貼上存檔碼", true);
        return;
    }
    try {
        const b64 = rawInput.replace(/^TRPG[1-6]-/, '');
        const binStr = atob(b64);
        const bytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) {
            bytes[i] = binStr.charCodeAt(i);
        }
        const decoded = JSON.parse(new TextDecoder().decode(bytes));
        if (!applySavePayload(decoded)) {
            throw new Error("Invalid payload");
        }
        lastExportedSeedHash = getCurrentPayloadHash();
        hasUnsavedSeedChanges = false;
        refreshAllSheetUI();
        updateSpellNavVisibilityUI();
        renderSpellConfigPage();
        renderSpellbookPage();
        persistToLocalStorage(false);
        updateSaveHint(`已成功載入存檔碼（#${lastExportedSeedHash}）`);
    } catch (e) {
        updateSaveHint("存檔碼格式無效，請確認是否完整", true);
    }
}

function resetAllSheetData() {
    characterLabel = '';
    numericValues = { globalPB: 0, poolModifier: 0, STR: 0, DEX: 0, INT: 0, WIS: 0, CHA: 0, CON: 0 };
    extraCombatValues = { INIT: 0, SPELL_ATK: 0 };
    weaponSlots = createDefaultWeaponSlots();
    selectedWeaponIndex = 0;
    spellAttr = 'INT';
    saveProficiencies = { STR: false, DEX: false, INT: false, WIS: false, CHA: false, CON: false };
    skillProficiencies = {};
    spellSlots = createDefaultSpellSlots();
    const input = document.getElementById('seedCodeInput');
    if (input) input.value = '';
    refreshAllSheetUI();
    renderSpellbookPage();
    persistToLocalStorage(true);
    updateSaveHint("已將角色數值與法術位歸零");
}

function addWeaponSlot() {
    if (weaponSlots.length >= MAX_WEAPON_SLOTS) return;
    weaponSlots.push({
        name: `武器 ${weaponSlots.length + 1}`,
        attr: 'STR',
        prof: true,
        extra: 0
    });
    buildWeaponSlotCards();
    recalcCombatStats();
    persistToLocalStorage();
}

function removeWeaponSlot(index) {
    if (weaponSlots.length <= 1) return;
    weaponSlots.splice(index, 1);
    if (selectedWeaponIndex >= weaponSlots.length) {
        selectedWeaponIndex = weaponSlots.length - 1;
    }
    buildWeaponSlotCards();
    recalcCombatStats();
    persistToLocalStorage();
}

function getWeaponTotal(index) {
    const w = weaponSlots[index] || weaponSlots[0];
    const pb = numericValues.globalPB || 0;
    const attrVal = numericValues[w.attr] || 0;
    return attrVal + (w.prof ? pb : 0) + (w.extra || 0);
}

function getCombatTotal(key) {
    const pb = numericValues.globalPB || 0;
    if (key === 'INIT') {
        return (numericValues.DEX || 0) + (extraCombatValues.INIT || 0);
    }
    if (key === 'ATK') {
        return getWeaponTotal(selectedWeaponIndex);
    }
    if (key === 'SPELL_ATK') {
        return (numericValues[spellAttr] || 0) + pb + (extraCombatValues.SPELL_ATK || 0);
    }
    return 0;
}