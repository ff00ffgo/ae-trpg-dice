let spellCfgSearchText = '';
let spellCfgPreparedFilter = 'all'; // 'all' | 'prepared' | 'unprepared'

function renderSpellConfigPage() {
    const container = document.getElementById('page_spell_cfg');
    if (!container) return;

    const soundOptionsHtml = soundTypesData
        .map(st => `<option value="${st.key}">${st.label}</option>`)
        .join('');

    const levelOptionsHtml = [
        `<option value="0">0 環 (戲法)</option>`,
        ...Array.from({ length: maxSpellLevel }, (_, i) => `<option value="${i + 1}">${i + 1} 環</option>`)
    ].join('');

    const presetButtonsHtml = spellSlotPresetsData
        .map(p => {
            const active = maxSpellLevel === p.maxLevel;
            return `<button onclick="setMaxSpellLevel(${p.maxLevel})" class="tactile-btn px-4 py-2 rounded-xl font-black text-sm ${active ? 'bg-amber-500 text-dark-900' : 'bg-dark-900 text-gray-300 hover:text-white border border-dark-600'}">${p.label}</button>`;
        })
        .join('');

    const previewButtonsHtml = soundTypesData
        .map(st => `<button onclick="playSpellSound('${st.key}')" class="tactile-btn px-3 py-1.5 bg-dark-900 hover:bg-dark-700 border border-dark-600 text-purple-200 rounded-lg font-bold text-xs">${st.label}</button>`)
        .join('');

    container.innerHTML = `
        <!-- 環位上限模組與法術位設定 -->
        <div class="bg-dark-800 border-2 border-dark-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <div class="border-b-2 border-dark-700 pb-3 flex flex-wrap justify-between items-center gap-3">
                <div class="flex flex-wrap items-center gap-3">
                    <h2 class="text-2xl sm:text-3xl font-black text-amber-400">法術位設定</h2>
                    <div class="flex items-center gap-1.5 bg-dark-900/80 p-1.5 rounded-xl border border-dark-700">
                        <span class="text-xs font-bold text-gray-400 px-1.5">環位顯示：</span>
                        ${presetButtonsHtml}
                    </div>
                </div>
                <button onclick="refillAllSpellSlots()" class="tactile-btn step-btn px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-black text-sm">
                    全部補滿法術位
                </button>
            </div>
            <div id="spellSlotCfgGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"></div>
        </div>

        <!-- 新增法術表單 + 音效試聽小按鍵 -->
        <div class="bg-dark-800 border-2 border-indigo-600/70 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b-2 border-dark-700 pb-3">
                <h2 class="text-2xl sm:text-3xl font-black text-indigo-300">登記新法術</h2>
                <div class="flex flex-wrap items-center gap-1.5">
                    <span class="text-xs font-bold text-gray-400 mr-1">音效試聽：</span>
                    ${previewButtonsHtml}
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                <div class="lg:col-span-2 space-y-1">
                    <label class="text-sm font-bold text-gray-300">法術名稱</label>
                    <input type="text" id="newSpellName" placeholder="輸入法術名稱..."
                        class="w-full bg-dark-900 border-2 border-dark-600 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-lg font-bold text-white focus:outline-none">
                </div>
                <div class="space-y-1">
                    <label class="text-sm font-bold text-gray-300">環位 (0=戲法)</label>
                    <select id="newSpellLevel" class="w-full bg-dark-900 border-2 border-dark-600 rounded-xl px-3 py-2.5 text-lg font-bold text-amber-300">
                        ${levelOptionsHtml}
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-sm font-bold text-gray-300">傷害 / 治療骰式</label>
                    <input type="text" id="newSpellDice" value="1D6" placeholder="例如 2D8"
                        class="w-full bg-dark-900 border-2 border-dark-600 rounded-xl px-3 py-2.5 text-lg font-bold text-emerald-300">
                </div>
                <div class="space-y-1">
                    <label class="text-sm font-bold text-gray-300">施法音效</label>
                    <select id="newSpellSound" class="w-full bg-dark-900 border-2 border-dark-600 rounded-xl px-3 py-2.5 text-lg font-bold text-purple-300">
                        ${soundOptionsHtml}
                    </select>
                </div>
                <div class="flex flex-col justify-end gap-2">
                    <label class="flex items-center gap-2 bg-dark-900 border border-dark-600 rounded-xl px-3 py-1.5 cursor-pointer">
                        <input type="checkbox" id="newSpellHasAttack" class="w-4 h-4 accent-indigo-500">
                        <span class="text-xs font-black text-gray-200">需要法術命中</span>
                    </label>
                    <label class="flex items-center gap-2 bg-dark-900 border border-emerald-700/70 rounded-xl px-3 py-1.5 cursor-pointer">
                        <input type="checkbox" id="newSpellPrepared" checked class="w-4 h-4 accent-emerald-500">
                        <span class="text-xs font-black text-emerald-300">顯示於施法頁</span>
                    </label>
                </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <input type="text" id="newSpellNote" placeholder="備註（選填）"
                    class="flex-1 bg-dark-900 border-2 border-dark-600 rounded-xl px-4 py-2.5 text-base font-bold text-gray-200 focus:outline-none">
                <button onclick="addNewSpell()" class="tactile-btn step-btn px-7 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-lg shadow-lg">
                    + 加入法術書
                </button>
            </div>
        </div>

        <!-- 已登記法術查詢與準備清單 -->
        <div class="bg-dark-800 border-2 border-dark-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b-2 border-dark-700 pb-4">
                <div>
                    <h2 class="text-2xl sm:text-3xl font-black text-purple-300">已登記法術書清單</h2>
                    <p class="text-xs sm:text-sm text-gray-400 font-bold mt-1">勾選「顯示於施法頁」的法術才會出現在戰鬥施法面板，其餘僅保留登記。</p>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                    <input type="text" id="spellCfgSearchInput" value="${escapeHtmlAttr(spellCfgSearchText)}"
                        oninput="onSpellCfgSearchChange(this.value)"
                        placeholder="搜尋法術名稱、環位或備註..."
                        class="bg-dark-900 border-2 border-dark-600 focus:border-purple-400 rounded-xl px-4 py-2 text-sm font-bold text-white focus:outline-none">
                    <div class="flex bg-dark-900 p-1 rounded-xl border border-dark-700 gap-1" id="spellCfgFilterBtns"></div>
                </div>
            </div>
            <div id="spellCfgListContainer" class="space-y-3"></div>
        </div>
    `;

    renderSpellSlotCfgGrid();
    renderSpellCfgFilterButtons();
    renderSpellCfgList();
}

function renderSpellCfgFilterButtons() {
    const bar = document.getElementById('spellCfgFilterBtns');
    if (!bar) return;
    const opts = [
        { key: 'all', label: '全部' },
        { key: 'prepared', label: '已顯示' },
        { key: 'unprepared', label: '僅登記' }
    ];
    bar.innerHTML = opts.map(o => {
        const active = spellCfgPreparedFilter === o.key;
        return `<button onclick="setSpellCfgPreparedFilter('${o.key}')" class="tactile-btn px-3 py-1.5 rounded-lg text-xs font-black ${active ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}">${o.label}</button>`;
    }).join('');
}

function setSpellCfgPreparedFilter(mode) {
    spellCfgPreparedFilter = mode;
    renderSpellCfgFilterButtons();
    renderSpellCfgList();
}

function onSpellCfgSearchChange(val) {
    spellCfgSearchText = val;
    renderSpellCfgList();
}

function toggleSpellPrepared(id) {
    const target = spellsList.find(s => s.id === id);
    if (!target) return;
    target.prepared = !target.prepared;
    renderSpellCfgList();
    renderSpellbookPage();
    persistToLocalStorage();
}

function renderSpellSlotCfgGrid() {
    const grid = document.getElementById('spellSlotCfgGrid');
    if (!grid) return;
    grid.innerHTML = '';

    for (let lvl = 1; lvl <= maxSpellLevel; lvl++) {
        const slot = spellSlots[lvl] || { max: 0, left: 0 };
        const div = document.createElement('div');
        div.className = "bg-dark-900 border-2 border-dark-700 rounded-2xl p-3 flex flex-col items-center gap-2";
        div.innerHTML = `
            <div class="text-sm font-black text-amber-300">${lvl} 環</div>
            <div class="flex items-center gap-1.5">
                <button onclick="adjustSpellSlotMax(${lvl}, -1)" class="tactile-btn w-8 h-8 bg-dark-800 hover:bg-dark-700 rounded-lg font-black text-lg border border-dark-600">-</button>
                <span class="text-xl font-black text-white w-7 text-center">${slot.max}</span>
                <button onclick="adjustSpellSlotMax(${lvl}, 1)" class="tactile-btn w-8 h-8 bg-dark-800 hover:bg-dark-700 rounded-lg font-black text-lg border border-dark-600">+</button>
            </div>
            <div class="text-xs text-gray-400 font-bold">剩餘 ${slot.left}</div>
        `;
        grid.appendChild(div);
    }
}

function adjustSpellSlotMax(lvl, delta) {
    const cur = spellSlots[lvl] || { max: 0, left: 0 };
    const nextMax = Math.max(0, Math.min(9, cur.max + delta));
    const nextLeft = Math.min(nextMax, Math.max(0, cur.left + (delta > 0 ? delta : 0)));
    spellSlots[lvl] = { max: nextMax, left: nextLeft };
    renderSpellSlotCfgGrid();
    persistToLocalStorage();
}

function refillAllSpellSlots() {
    for (let lvl = 1; lvl <= 9; lvl++) {
        const cur = spellSlots[lvl] || { max: 0, left: 0 };
        spellSlots[lvl] = { max: cur.max, left: cur.max };
    }
    renderSpellSlotCfgGrid();
    persistToLocalStorage();
}

function addNewSpell() {
    const nameInput = document.getElementById('newSpellName');
    const levelSelect = document.getElementById('newSpellLevel');
    const diceInput = document.getElementById('newSpellDice');
    const soundSelect = document.getElementById('newSpellSound');
    const atkCheckbox = document.getElementById('newSpellHasAttack');
    const prepCheckbox = document.getElementById('newSpellPrepared');
    const noteInput = document.getElementById('newSpellNote');

    const name = nameInput?.value.trim() || '';
    if (!name) {
        alert("請先輸入法術名稱！");
        return;
    }

    const rawLvl = parseInt(levelSelect?.value || '0', 10) || 0;
    const clampedLvl = Math.min(maxSpellLevel, Math.max(0, rawLvl));

    spellsList.push({
        id: 'spell_' + Date.now(),
        name,
        level: clampedLvl,
        hasAttack: Boolean(atkCheckbox?.checked),
        prepared: prepCheckbox ? Boolean(prepCheckbox.checked) : true,
        diceFormula: (diceInput?.value.trim() || '1D6').toUpperCase(),
        bonus: 0,
        sound: soundSelect?.value || 'arcane',
        note: noteInput?.value.trim() || ''
    });

    nameInput.value = '';
    noteInput.value = '';
    renderSpellCfgList();
    renderSpellbookPage();
    persistToLocalStorage();
}

function deleteSpellById(id) {
    spellsList = spellsList.filter(s => s.id !== id);
    renderSpellCfgList();
    renderSpellbookPage();
    persistToLocalStorage();
}

function renderSpellCfgList() {
    const list = document.getElementById('spellCfgListContainer');
    if (!list) return;

    const kw = spellCfgSearchText.trim().toLowerCase();
    const filtered = spellsList.filter(spell => {
        if (spellCfgPreparedFilter === 'prepared' && !spell.prepared) return false;
        if (spellCfgPreparedFilter === 'unprepared' && spell.prepared) return false;
        if (!kw) return true;
        const lvlText = spell.level === 0 ? '戲法 0環' : `${spell.level}環`;
        const hay = `${spell.name} ${lvlText} ${spell.diceFormula} ${spell.note}`.toLowerCase();
        return hay.includes(kw);
    });

    if (spellsList.length === 0) {
        list.innerHTML = '<div class="text-center text-gray-500 py-6 font-bold">目前尚無任何登記法術，請在上方新增。</div>';
        return;
    }

    if (filtered.length === 0) {
        list.innerHTML = '<div class="text-center text-gray-500 py-6 font-bold">找不到符合查詢條件的法術。</div>';
        return;
    }

    list.innerHTML = '';
    filtered.forEach(spell => {
        const lvlLabel = spell.level === 0 ? '戲法' : `${spell.level} 環`;
        const soundLabel = soundTypesData.find(st => st.key === spell.sound)?.label || spell.sound;
        const div = document.createElement('div');
        div.className = `rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-2 transition-all ${
            spell.prepared
                ? 'bg-dark-900 border-emerald-600/70'
                : 'bg-dark-900/50 border-dark-700 opacity-80'
        }`;
        div.innerHTML = `
            <div class="space-y-1">
                <div class="flex flex-wrap items-center gap-2">
                    <span class="text-xl font-black ${spell.prepared ? 'text-amber-300' : 'text-gray-300'}">${spell.name}</span>
                    <span class="text-xs px-2.5 py-0.5 rounded-lg bg-dark-800 text-indigo-300 font-black">${lvlLabel}</span>
                    <span class="text-xs px-2.5 py-0.5 rounded-lg font-black ${spell.prepared ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/60' : 'bg-dark-800 text-gray-400 border border-dark-600'}">
                        ${spell.prepared ? '已顯示於施法頁' : '僅登記（隱藏）'}
                    </span>
                </div>
                <div class="text-sm text-gray-300 font-bold">
                    骰式：${spell.diceFormula}｜${spell.hasAttack ? '含法術命中' : '無命中骰'}｜音效：${soundLabel}${spell.note ? `｜${spell.note}` : ''}
                </div>
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <button onclick="toggleSpellPrepared('${spell.id}')" class="tactile-btn px-3.5 py-1.5 rounded-lg font-black text-xs border ${
                    spell.prepared
                        ? 'bg-emerald-700 hover:bg-emerald-600 border-emerald-400 text-white'
                        : 'bg-dark-800 hover:bg-dark-700 border-dark-500 text-gray-300'
                }">
                    ${spell.prepared ? '顯示中（點擊隱藏）' : '未顯示（點擊顯示）'}
                </button>
                <button onclick="playSpellSound('${spell.sound}')" class="tactile-btn px-3 py-1.5 bg-dark-800 hover:bg-dark-700 border border-dark-600 text-purple-300 rounded-lg font-black text-xs">
                    試聽
                </button>
                <button onclick="deleteSpellById('${spell.id}')" class="tactile-btn px-3 py-1.5 bg-rose-950/70 hover:bg-rose-900 border border-rose-600 text-rose-200 rounded-lg font-black text-xs">
                    刪除
                </button>
            </div>
        `;
        list.appendChild(div);
    });
}