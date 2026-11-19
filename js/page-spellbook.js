let selectedSpellLevelFilter = 'all';
let spellbookSearchText = '';

function renderSpellbookPage() {
    const container = document.getElementById('page_spellbook');
    if (!container) return;

    container.innerHTML = `
        <!-- 剩餘法術位快速控制列 -->
        <div class="bg-dark-800 border-2 border-dark-700 rounded-3xl p-6 shadow-xl space-y-4">
            <div class="flex flex-wrap justify-between items-center gap-2 border-b-2 border-dark-700 pb-3">
                <h2 class="text-2xl font-black text-amber-400">剩餘法術位（1～${maxSpellLevel} 環）</h2>
                <button onclick="refillAllSpellSlots(); renderSpellbookPage();" class="tactile-btn step-btn px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-black text-sm">
                    全部恢復
                </button>
            </div>
            <div id="spellbookSlotTracker" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"></div>
        </div>

        <!-- 環位篩選與快速搜尋列 -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-dark-800 border-2 border-dark-700 rounded-2xl p-4">
            <div class="flex flex-wrap gap-2" id="spellLevelFilterBar"></div>
            <input type="text" id="spellbookSearchInput" value="${escapeHtmlAttr(spellbookSearchText)}"
                oninput="onSpellbookSearchChange(this.value)"
                placeholder="快速篩選已準備法術..."
                class="bg-dark-900 border-2 border-dark-600 focus:border-amber-400 rounded-xl px-4 py-2 text-sm font-bold text-white focus:outline-none">
        </div>

        <!-- 戰鬥施法按鈕清單（僅顯示勾選「顯示於施法頁」的法術） -->
        <div class="bg-dark-800 border-2 border-dark-700 rounded-3xl p-6 shadow-xl space-y-4">
            <div class="flex flex-wrap justify-between items-center gap-2 border-b-2 border-dark-700 pb-3">
                <h2 class="text-2xl font-black text-indigo-300">戰鬥施法面板</h2>
                <span class="text-xs sm:text-sm font-bold text-gray-400">僅顯示在「法術設定」勾選顯示的法術</span>
            </div>
            <div id="spellbookCastList" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
        </div>
    `;

    renderSpellbookSlotTracker();
    renderSpellLevelFilterBar();
    renderSpellbookCastList();
}

function onSpellbookSearchChange(val) {
    spellbookSearchText = val;
    renderSpellbookCastList();
}

function renderSpellbookSlotTracker() {
    const grid = document.getElementById('spellbookSlotTracker');
    if (!grid) return;
    grid.innerHTML = '';

    for (let lvl = 1; lvl <= maxSpellLevel; lvl++) {
        const slot = spellSlots[lvl] || { max: 0, left: 0 };
        const div = document.createElement('div');
        div.className = "bg-dark-900 border-2 border-dark-700 rounded-2xl p-3 flex flex-col items-center gap-1.5";
        div.innerHTML = `
            <div class="text-xs font-black text-gray-400">${lvl} 環</div>
            <div class="text-2xl font-black ${slot.left > 0 ? 'text-amber-300' : 'text-gray-600'}">${slot.left} / ${slot.max}</div>
            <div class="flex gap-1.5">
                <button onclick="spendOrGainSpellSlot(${lvl}, -1)" class="tactile-btn px-2.5 py-1 bg-rose-900/80 hover:bg-rose-800 text-rose-200 rounded-lg font-black text-sm">-1</button>
                <button onclick="spendOrGainSpellSlot(${lvl}, 1)" class="tactile-btn px-2.5 py-1 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 rounded-lg font-black text-sm">+1</button>
            </div>
        `;
        grid.appendChild(div);
    }
}

function spendOrGainSpellSlot(lvl, delta) {
    const cur = spellSlots[lvl] || { max: 0, left: 0 };
    if (cur.max <= 0) return;
    const nextLeft = Math.max(0, Math.min(cur.max, cur.left + delta));
    spellSlots[lvl] = { max: cur.max, left: nextLeft };
    renderSpellbookSlotTracker();
    persistToLocalStorage();
}

function renderSpellLevelFilterBar() {
    const bar = document.getElementById('spellLevelFilterBar');
    if (!bar) return;
    const filters = [
        { key: 'all', label: '全部' },
        { key: '0', label: '戲法' },
        ...Array.from({ length: maxSpellLevel }, (_, i) => ({ key: String(i + 1), label: `${i + 1} 環` }))
    ];

    bar.innerHTML = '';
    filters.forEach(f => {
        const active = selectedSpellLevelFilter === f.key;
        const btn = document.createElement('button');
        btn.className = `tactile-btn px-4 py-2 rounded-xl font-black text-sm ${active ? 'bg-amber-500 text-dark-900' : 'bg-dark-900 text-gray-300 hover:text-white border border-dark-700'}`;
        btn.onclick = () => {
            selectedSpellLevelFilter = f.key;
            renderSpellLevelFilterBar();
            renderSpellbookCastList();
        };
        btn.textContent = f.label;
        bar.appendChild(btn);
    });
}

function castSpellAction(spellId, mode) {
    const spell = spellsList.find(s => s.id === spellId);
    if (!spell) return;

    if (spell.level >= 1) {
        const slot = spellSlots[spell.level] || { max: 0, left: 0 };
        if (slot.left > 0) {
            spellSlots[spell.level] = { max: slot.max, left: slot.left - 1 };
            renderSpellbookSlotTracker();
            persistToLocalStorage();
        }
    }

    if (mode === 'attack') {
        rollSpellAttack(spell);
    } else {
        rollSpellEffect(spell);
    }
}

function renderSpellbookCastList() {
    const list = document.getElementById('spellbookCastList');
    if (!list) return;

    const kw = spellbookSearchText.trim().toLowerCase();
    const filtered = spellsList.filter(s => {
        if (!s.prepared) return false;
        if (s.level > maxSpellLevel) return false;
        if (selectedSpellLevelFilter !== 'all' && String(s.level) !== selectedSpellLevelFilter) return false;
        if (!kw) return true;
        return `${s.name} ${s.diceFormula} ${s.note}`.toLowerCase().includes(kw);
    });

    if (filtered.length === 0) {
        list.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8 font-bold text-lg">目前沒有可施放的法術（請至「法術設定」新增或開啟法術的「顯示於施法頁」）。</div>';
        return;
    }

    list.innerHTML = '';
    filtered.forEach(spell => {
        const lvlLabel = spell.level === 0 ? '戲法' : `${spell.level} 環`;
        const card = document.createElement('div');
        card.className = "bg-dark-900 border-2 border-dark-700 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-lg";
        card.innerHTML = `
            <div class="space-y-1">
                <div class="flex items-center justify-between gap-2">
                    <span class="text-2xl font-black text-amber-300">${spell.name}</span>
                    <span class="px-3 py-1 rounded-xl bg-dark-800 border border-dark-600 text-sm font-black text-indigo-300">${lvlLabel}</span>
                </div>
                <div class="text-sm text-gray-300 font-bold">
                    效果骰：${spell.diceFormula}${spell.note ? `｜${spell.note}` : ''}
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
                ${spell.hasAttack
                    ? `<button onclick="castSpellAction('${spell.id}', 'attack')" class="tactile-btn step-btn py-3.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-lg">法術命中 (${formatSigned(getCombatTotal('SPELL_ATK'))})</button>`
                    : `<div class="py-3.5 px-3 bg-dark-800/60 border border-dark-700 text-gray-500 rounded-xl font-bold text-base flex items-center justify-center">免命中</div>`
                }
                <button onclick="castSpellAction('${spell.id}', 'effect')" class="tactile-btn step-btn py-3.5 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-lg">施放 ${spell.diceFormula}</button>
            </div>
        `;
        list.appendChild(card);
    });
}