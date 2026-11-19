function renderSheetPage() {
    const container = document.getElementById('page_sheet');
    if (!container) return;

    container.innerHTML = `
        <!-- 種子碼與紀錄管理 -->
        <div class="bg-dark-800 border-2 border-amber-600/60 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b-2 border-dark-700 pb-3">
                <div class="flex flex-wrap items-center gap-3">
                    <h2 class="text-2xl sm:text-3xl font-black text-amber-400">角色存檔碼（種子碼）</h2>
                    <span id="activeSeedTag" class="px-3 py-1 rounded-xl bg-dark-900 border border-amber-500/60 text-xs sm:text-sm font-black text-amber-200">
                        目前識別碼：#000000
                    </span>
                </div>
                <span id="saveStatusHint" class="text-sm font-bold text-emerald-400">已啟用本機自動暫存</span>
            </div>

            <!-- 變動未備份提醒列 -->
            <div id="seedBackupWarning"></div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-3">
                <input type="text" id="characterLabelInput" value="${escapeHtmlAttr(characterLabel)}"
                    oninput="updateCharacterLabel(this.value)"
                    placeholder="角色名稱 / 存檔備註（方便辨識是哪張卡）"
                    class="lg:col-span-4 bg-dark-900 border-2 border-dark-600 focus:border-amber-400 rounded-2xl px-4 py-3 text-base font-bold text-white focus:outline-none">
                <input type="text" id="seedCodeInput" placeholder="在此貼上存檔碼，或按右側按鈕產生目前數值的存檔碼..."
                    class="lg:col-span-8 bg-dark-900 border-2 border-dark-600 focus:border-amber-400 rounded-2xl px-4 py-3 text-base font-bold text-amber-200 focus:outline-none">
            </div>

            <div class="flex flex-wrap gap-3">
                <button onclick="generateAndCopySeed()" class="tactile-btn step-btn px-5 py-3 bg-amber-500 hover:bg-amber-400 text-dark-900 font-black text-base sm:text-lg rounded-2xl shadow-lg">
                    產生並複製存檔碼
                </button>
                <button onclick="loadFromSeedInput()" class="tactile-btn step-btn px-5 py-3 bg-teal-600 hover:bg-teal-500 text-white font-black text-base sm:text-lg rounded-2xl shadow-lg">
                    載入存檔碼
                </button>
                <button onclick="resetAllSheetData()" class="tactile-btn step-btn px-5 py-3 bg-rose-950/80 hover:bg-rose-900 border-2 border-rose-600 text-rose-200 font-black text-base sm:text-lg rounded-2xl shadow-lg">
                    全部歸零
                </button>
            </div>
        </div>

        <!-- 六大屬性與豁免 -->
        <div class="bg-dark-800 border-2 border-dark-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-dark-700 pb-4">
                <h2 class="text-3xl font-black text-blue-400">六大屬性調整值與豁免熟練</h2>
                <div class="flex items-center gap-4 bg-dark-900 px-5 py-3 rounded-2xl border-2 border-dark-600">
                    <span class="text-xl font-bold text-gray-200">熟練加值 (PB):</span>
                    <div class="flex items-center gap-2">
                        <button onclick="adjustNumeric('globalPB', -1)" class="tactile-btn step-btn w-10 h-10 bg-dark-700 hover:bg-dark-600 rounded-xl font-black text-2xl text-white flex items-center justify-center border border-dark-500">-</button>
                        <span id="val_globalPB" class="w-12 text-center text-2xl font-black text-amber-300">+0</span>
                        <button onclick="adjustNumeric('globalPB', 1)" class="tactile-btn step-btn w-10 h-10 bg-dark-700 hover:bg-dark-600 rounded-xl font-black text-2xl text-white flex items-center justify-center border border-dark-500">+</button>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="attrConfigContainer"></div>
        </div>

        <!-- 戰鬥核心數值：先攻 & 法術命中 + 自訂新增武器欄位 -->
        <div class="bg-dark-800 border-2 border-dark-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div class="border-b-2 border-dark-700 pb-4">
                <h2 class="text-3xl font-black text-rose-400">先攻 / 武器命中 / 法術命中設定</h2>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-dark-900 border-2 border-cyan-700/70 p-6 rounded-2xl flex flex-col justify-between shadow-lg space-y-4">
                    <div class="flex justify-between items-center border-b border-dark-700 pb-3">
                        <span class="text-2xl font-black text-cyan-400">先攻</span>
                        <span id="total_INIT" class="text-3xl font-black text-amber-300 bg-dark-800 px-4 py-1 rounded-xl border border-dark-600">+0</span>
                    </div>
                    <div class="space-y-3 text-base">
                        <div class="flex justify-between items-center text-gray-300 font-bold">
                            <span>基礎屬性：</span>
                            <span class="text-blue-400">自動帶入敏捷 (DEX)</span>
                        </div>
                        <div class="flex justify-between items-center pt-2 border-t border-dark-800">
                            <span class="text-gray-300 font-bold">額外加值：</span>
                            <div class="flex items-center gap-2">
                                <button onclick="adjustExtraCombat('INIT', -1)" class="tactile-btn step-btn w-9 h-9 bg-dark-800 hover:bg-dark-700 rounded-lg font-black text-xl text-white border border-dark-600">-</button>
                                <span id="extra_INIT" class="w-10 text-center text-xl font-black text-amber-300">+0</span>
                                <button onclick="adjustExtraCombat('INIT', 1)" class="tactile-btn step-btn w-9 h-9 bg-dark-800 hover:bg-dark-700 rounded-lg font-black text-xl text-white border border-dark-600">+</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-dark-900 border-2 border-indigo-700/70 p-6 rounded-2xl flex flex-col justify-between shadow-lg space-y-4">
                    <div class="flex justify-between items-center border-b border-dark-700 pb-3">
                        <span class="text-2xl font-black text-indigo-400">法術命中</span>
                        <span id="total_SPELL_ATK" class="text-3xl font-black text-amber-300 bg-dark-800 px-4 py-1 rounded-xl border border-dark-600">+0</span>
                    </div>
                    <div class="space-y-3 text-base">
                        <div class="flex flex-col gap-1.5">
                            <span class="text-gray-300 font-bold">施法屬性 (自動 + PB)：</span>
                            <div class="grid grid-cols-3 bg-dark-800 p-1 rounded-xl border border-dark-600 gap-1">
                                <button onclick="setSpellAttr('INT')" id="btn_spell_INT" class="tactile-btn py-1.5 rounded-lg font-black text-sm">智慧 🔴</button>
                                <button onclick="setSpellAttr('WIS')" id="btn_spell_WIS" class="tactile-btn py-1.5 rounded-lg font-black text-sm">感知 🟠</button>
                                <button onclick="setSpellAttr('CHA')" id="btn_spell_CHA" class="tactile-btn py-1.5 rounded-lg font-black text-sm">魅力 🟣</button>
                            </div>
                        </div>
                        <div class="flex justify-between items-center pt-2 border-t border-dark-800">
                            <span class="text-gray-300 font-bold">額外加值：</span>
                            <div class="flex items-center gap-2">
                                <button onclick="adjustExtraCombat('SPELL_ATK', -1)" class="tactile-btn step-btn w-9 h-9 bg-dark-800 hover:bg-dark-700 rounded-lg font-black text-xl text-white border border-dark-600">-</button>
                                <span id="extra_SPELL_ATK" class="w-10 text-center text-xl font-black text-amber-300">+0</span>
                                <button onclick="adjustExtraCombat('SPELL_ATK', 1)" class="tactile-btn step-btn w-9 h-9 bg-dark-800 hover:bg-dark-700 rounded-lg font-black text-xl text-white border border-dark-600">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 武器欄位設定區 -->
            <div class="space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <div class="text-xl font-black text-rose-300">武器欄位設定（預設 1 把，可新增至多 3 把）</div>
                    <button onclick="addWeaponSlot()" id="btnAddWeaponSlot"
                        class="tactile-btn step-btn px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-base rounded-xl shadow-lg">
                        + 新增武器
                    </button>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6" id="weaponSlotsConfigContainer"></div>
            </div>
        </div>

        <!-- 技能熟練與專精 -->
        <div class="bg-dark-800 border-2 border-dark-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div class="border-b-2 border-dark-700 pb-4 flex justify-between items-center">
                <h2 class="text-3xl font-black text-purple-400">技能熟練 / 專精設定</h2>
            </div>
            <div id="skillsConfigContainer" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
        </div>
    `;

    buildAttrConfigCards();
    buildWeaponSlotCards();
    buildSkillsConfigCards();
    updateSeedTrackingUI();
}

function updateCharacterLabel(val) {
    characterLabel = val;
    persistToLocalStorage();
}

function buildWeaponSlotCards() {
    const container = document.getElementById('weaponSlotsConfigContainer');
    const addBtn = document.getElementById('btnAddWeaponSlot');
    if (!container) return;
    container.innerHTML = '';

    if (addBtn) {
        const isFull = weaponSlots.length >= MAX_WEAPON_SLOTS;
        addBtn.disabled = isFull;
        addBtn.textContent = isFull
            ? `已達上限（${weaponSlots.length}/${MAX_WEAPON_SLOTS} 把）`
            : `+ 新增武器（${weaponSlots.length}/${MAX_WEAPON_SLOTS}）`;
        addBtn.className = isFull
            ? "px-4 py-2 bg-dark-700 text-gray-500 font-black text-base rounded-xl border border-dark-600 cursor-not-allowed"
            : "tactile-btn step-btn px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-base rounded-xl shadow-lg";
    }

    weaponSlots.forEach((w, idx) => {
        const total = getWeaponTotal(idx);
        const canRemove = weaponSlots.length > 1;
        const div = document.createElement('div');
        div.className = "bg-dark-900 border-2 border-rose-700/70 p-5 rounded-2xl flex flex-col justify-between shadow-lg space-y-4";
        div.innerHTML = `
            <div class="flex justify-between items-center gap-2 border-b border-dark-700 pb-3">
                <input type="text" id="weapon_name_${idx}" value="${escapeHtmlAttr(w.name)}"
                    oninput="updateWeaponName(${idx}, this.value)"
                    placeholder="輸入武器名稱"
                    class="w-full bg-dark-800 border border-dark-600 focus:border-rose-400 rounded-xl px-3 py-1.5 text-lg font-black text-rose-200 focus:outline-none">
                <span id="weapon_total_${idx}" class="text-2xl font-black text-amber-300 bg-dark-800 px-3 py-1 rounded-xl border border-dark-600 shrink-0">${formatSigned(total)}</span>
                ${canRemove ? `<button onclick="removeWeaponSlot(${idx})" title="移除此武器" class="tactile-btn px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-600 text-rose-200 rounded-xl font-black text-sm shrink-0">✕</button>` : ''}
            </div>
            <div class="space-y-3 text-base">
                <div class="flex items-center justify-between gap-2">
                    <span class="text-gray-300 font-bold">攻擊屬性：</span>
                    <div class="flex bg-dark-800 p-1 rounded-xl border border-dark-600 gap-1">
                        <button onclick="setWeaponAttr(${idx}, 'STR')" id="btn_w_${idx}_STR" class="tactile-btn px-3 py-1.5 rounded-lg font-black text-sm ${w.attr === 'STR' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'}">力量 🔴</button>
                        <button onclick="setWeaponAttr(${idx}, 'DEX')" id="btn_w_${idx}_DEX" class="tactile-btn px-3 py-1.5 rounded-lg font-black text-sm ${w.attr === 'DEX' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}">敏捷 🔵</button>
                    </div>
                </div>
                <label class="flex items-center justify-between cursor-pointer bg-dark-800/80 px-3 py-2 rounded-xl border border-dark-700">
                    <span class="text-gray-200 font-bold">武器熟練 (加 PB)</span>
                    <input type="checkbox" id="chk_w_prof_${idx}" onchange="toggleWeaponProf(${idx}, this.checked)" ${w.prof ? 'checked' : ''} class="w-5 h-5 accent-rose-500 rounded cursor-pointer">
                </label>
                <div class="flex justify-between items-center pt-1">
                    <span class="text-gray-300 font-bold">額外加值：</span>
                    <div class="flex items-center gap-2">
                        <button onclick="adjustWeaponExtra(${idx}, -1)" class="tactile-btn step-btn w-9 h-9 bg-dark-800 hover:bg-dark-700 rounded-lg font-black text-xl text-white border border-dark-600">-</button>
                        <span id="extra_w_${idx}" class="w-10 text-center text-xl font-black text-amber-300">${formatSigned(w.extra)}</span>
                        <button onclick="adjustWeaponExtra(${idx}, 1)" class="tactile-btn step-btn w-9 h-9 bg-dark-800 hover:bg-dark-700 rounded-lg font-black text-xl text-white border border-dark-600">+</button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function escapeHtmlAttr(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function updateWeaponName(idx, value) {
    weaponSlots[idx].name = value.trim() || `武器 ${idx + 1}`;
    persistToLocalStorage();
}

function setWeaponAttr(idx, attr) {
    weaponSlots[idx].attr = attr;
    const strBtn = document.getElementById(`btn_w_${idx}_STR`);
    const dexBtn = document.getElementById(`btn_w_${idx}_DEX`);
    if (strBtn) strBtn.className = attr === 'STR' ? "tactile-btn px-3 py-1.5 rounded-lg font-black text-sm bg-red-600 text-white shadow" : "tactile-btn px-3 py-1.5 rounded-lg font-black text-sm text-gray-400 hover:text-white";
    if (dexBtn) dexBtn.className = attr === 'DEX' ? "tactile-btn px-3 py-1.5 rounded-lg font-black text-sm bg-blue-600 text-white shadow" : "tactile-btn px-3 py-1.5 rounded-lg font-black text-sm text-gray-400 hover:text-white";
    recalcCombatStats();
    persistToLocalStorage();
}

function toggleWeaponProf(idx, checked) {
    weaponSlots[idx].prof = Boolean(checked);
    recalcCombatStats();
    persistToLocalStorage();
}

function adjustWeaponExtra(idx, delta) {
    weaponSlots[idx].extra = (weaponSlots[idx].extra || 0) + delta;
    const el = document.getElementById(`extra_w_${idx}`);
    if (el) el.textContent = formatSigned(weaponSlots[idx].extra);
    recalcCombatStats();
    persistToLocalStorage();
}

function buildAttrConfigCards() {
    const attrContainer = document.getElementById('attrConfigContainer');
    if (!attrContainer) return;
    attrContainer.innerHTML = '';

    attributesData.forEach(attr => {
        const v = numericValues[attr.key] || 0;
        const div = document.createElement('div');
        div.className = `${attr.cardBg} border-2 p-5 rounded-2xl flex flex-col items-center justify-between shadow-lg space-y-4`;
        div.innerHTML = `
            <span class="text-2xl font-black ${attr.textCol}">${attr.name} ${attr.dot}</span>
            <div class="flex items-center gap-3">
                <button onclick="adjustNumeric('${attr.key}', -1)" class="tactile-btn step-btn w-12 h-12 bg-dark-800 hover:bg-dark-700 rounded-xl font-black text-2xl text-white flex items-center justify-center border-2 border-dark-600">-</button>
                <span id="val_${attr.key}" class="w-16 text-center text-3xl font-black text-amber-300">${formatSigned(v)}</span>
                <button onclick="adjustNumeric('${attr.key}', 1)" class="tactile-btn step-btn w-12 h-12 bg-dark-800 hover:bg-dark-700 rounded-xl font-black text-2xl text-white flex items-center justify-center border-2 border-dark-600">+</button>
            </div>
            <label class="flex items-center gap-3 cursor-pointer bg-dark-900/80 px-4 py-2.5 rounded-xl border border-dark-600 hover:border-amber-400 transition-all w-full justify-center">
                <input type="checkbox" id="save_chk_${attr.key}" onchange="toggleSaveProf('${attr.key}')" ${saveProficiencies[attr.key] ? 'checked' : ''} class="w-6 h-6 accent-amber-500 rounded cursor-pointer">
                <span class="text-lg font-black text-gray-200">豁免熟練</span>
            </label>
        `;
        attrContainer.appendChild(div);
    });
}

function buildSkillsConfigCards() {
    const container = document.getElementById('skillsConfigContainer');
    if (!container) return;
    container.innerHTML = '';

    skillsData.forEach((skill, index) => {
        if (skillProficiencies[index] === undefined) skillProficiencies[index] = 0;
        const level = skillProficiencies[index];

        const div = document.createElement('div');
        div.className = "bg-dark-900 border-2 border-dark-700 rounded-2xl p-5 flex justify-between items-center";
        div.innerHTML = `
            <div>
                <div class="text-2xl font-black text-gray-100">${skill.name}</div>
                <div class="text-base text-gray-400 font-bold">屬性: <span class="text-amber-300">${skill.attr}</span></div>
            </div>
            <div class="flex bg-dark-800 rounded-xl p-1.5 border-2 border-dark-600 gap-2">
                <button onclick="setProficiency(${index}, 0)" id="cfg_prof_${index}_0" class="tactile-btn px-5 py-2.5 rounded-lg text-lg font-bold ${level === 0 ? 'bg-purple-600 text-white' : 'text-gray-400'}">無</button>
                <button onclick="setProficiency(${index}, 1)" id="cfg_prof_${index}_1" class="tactile-btn px-5 py-2.5 rounded-lg text-lg font-bold ${level === 1 ? 'bg-purple-600 text-white' : 'text-gray-400'}">熟練</button>
                <button onclick="setProficiency(${index}, 2)" id="cfg_prof_${index}_2" class="tactile-btn px-5 py-2.5 rounded-lg text-lg font-bold ${level === 2 ? 'bg-purple-600 text-white' : 'text-gray-400'}">專精</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function refreshAllSheetUI() {
    const labelInput = document.getElementById('characterLabelInput');
    if (labelInput) labelInput.value = characterLabel;

    Object.keys(numericValues).forEach(k => {
        const el = document.getElementById(`val_${k}`);
        if (el) el.textContent = formatSigned(numericValues[k]);
    });
    Object.keys(extraCombatValues).forEach(k => {
        const el = document.getElementById(`extra_${k}`);
        if (el) el.textContent = formatSigned(extraCombatValues[k]);
    });
    setSpellAttr(spellAttr, false);
    buildAttrConfigCards();
    buildWeaponSlotCards();
    buildSkillsConfigCards();
    recalcCombatStats();
    updateSeedTrackingUI();
}

function adjustNumeric(key, delta) {
    numericValues[key] = (numericValues[key] || 0) + delta;
    const elem = document.getElementById(`val_${key}`);
    if (elem) elem.textContent = formatSigned(numericValues[key]);
    recalcCombatStats();
    persistToLocalStorage();
}

function adjustExtraCombat(key, delta) {
    extraCombatValues[key] = (extraCombatValues[key] || 0) + delta;
    const elem = document.getElementById(`extra_${key}`);
    if (elem) elem.textContent = formatSigned(extraCombatValues[key]);
    recalcCombatStats();
    persistToLocalStorage();
}

function setSpellAttr(attr, shouldSave = true) {
    spellAttr = attr;
    const colors = { INT: 'bg-emerald-600', WIS: 'bg-orange-600', CHA: 'bg-purple-600' };
    ['INT', 'WIS', 'CHA'].forEach(k => {
        const btn = document.getElementById(`btn_spell_${k}`);
        if (!btn) return;
        btn.className = k === attr
            ? `tactile-btn py-1.5 rounded-lg font-black text-sm ${colors[k]} text-white shadow`
            : "tactile-btn py-1.5 rounded-lg font-black text-sm text-gray-400 hover:text-white";
    });
    recalcCombatStats();
    if (shouldSave) persistToLocalStorage();
}

function recalcCombatStats() {
    ['INIT', 'SPELL_ATK'].forEach(k => {
        const val = getCombatTotal(k);
        const el = document.getElementById(`total_${k}`);
        if (el) el.textContent = formatSigned(val);
    });
    weaponSlots.forEach((_, idx) => {
        const el = document.getElementById(`weapon_total_${idx}`);
        if (el) el.textContent = formatSigned(getWeaponTotal(idx));
    });
}

function toggleSaveProf(attrKey) {
    const checkbox = document.getElementById(`save_chk_${attrKey}`);
    saveProficiencies[attrKey] = Boolean(checkbox?.checked);
    persistToLocalStorage();
}

function setProficiency(index, level) {
    skillProficiencies[index] = level;
    for (let i = 0; i <= 2; i++) {
        const btn = document.getElementById(`cfg_prof_${index}_${i}`);
        if (!btn) continue;
        btn.className = i === level
            ? "tactile-btn px-5 py-2.5 rounded-lg text-lg font-bold bg-purple-600 text-white shadow-md"
            : "tactile-btn px-5 py-2.5 rounded-lg text-lg font-bold text-gray-400 hover:text-gray-200";
    }
    persistToLocalStorage();
}