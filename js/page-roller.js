function renderRollerPage() {
    const container = document.getElementById('page_roller');
    if (!container) return;

    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- 左側：骰池 + 歷史紀錄 -->
            <div class="lg:col-span-5 space-y-8">
                <div class="bg-dark-800 border-2 border-dark-700 rounded-3xl p-6 shadow-xl space-y-6">
                    <h2 class="text-2xl font-black text-emerald-400 flex items-center gap-3 border-b-2 border-dark-700 pb-3">
                        <span>➕</span> 快速骰子點擊累積池
                    </h2>
                    <div class="grid grid-cols-3 gap-4">
                        <button onclick="addDiceToPool(4)" class="tactile-btn step-btn flex flex-col items-center justify-center p-5 bg-emerald-950/40 hover:bg-emerald-900/60 border-2 border-emerald-600 rounded-2xl text-emerald-200 font-black text-xl shadow-lg group">
                            <svg class="w-12 h-12 mb-1 fill-emerald-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><polygon points="12,2 22,20 2,20"/></svg>
                            <span>+1D4</span>
                        </button>
                        <button onclick="addDiceToPool(6)" class="tactile-btn step-btn flex flex-col items-center justify-center p-5 bg-emerald-950/40 hover:bg-emerald-900/60 border-2 border-emerald-600 rounded-2xl text-emerald-200 font-black text-xl shadow-lg group">
                            <svg class="w-12 h-12 mb-1 fill-emerald-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                            <span>+1D6</span>
                        </button>
                        <button onclick="addDiceToPool(8)" class="tactile-btn step-btn flex flex-col items-center justify-center p-5 bg-emerald-950/40 hover:bg-emerald-900/60 border-2 border-emerald-600 rounded-2xl text-emerald-200 font-black text-xl shadow-lg group">
                            <svg class="w-12 h-12 mb-1 fill-emerald-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><polygon points="12,2 22,12 12,22 2,12"/></svg>
                            <span>+1D8</span>
                        </button>
                        <button onclick="addDiceToPool(10)" class="tactile-btn step-btn flex flex-col items-center justify-center p-5 bg-emerald-950/40 hover:bg-emerald-900/60 border-2 border-emerald-600 rounded-2xl text-emerald-200 font-black text-xl shadow-lg group">
                            <svg class="w-12 h-12 mb-1 fill-emerald-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><polygon points="12,2 22,9 18,22 6,22 2,9"/></svg>
                            <span>+1D10</span>
                        </button>
                        <button onclick="addDiceToPool(12)" class="tactile-btn step-btn flex flex-col items-center justify-center p-5 bg-emerald-950/40 hover:bg-emerald-900/60 border-2 border-emerald-600 rounded-2xl text-emerald-200 font-black text-xl shadow-lg group">
                            <svg class="w-12 h-12 mb-1 fill-emerald-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><polygon points="12,2 20,7 20,17 12,22 4,17 4,7"/></svg>
                            <span>+1D12</span>
                        </button>
                        <button onclick="addDiceToPool(20)" class="tactile-btn step-btn flex flex-col items-center justify-center p-5 bg-emerald-950/40 hover:bg-emerald-900/60 border-2 border-emerald-600 rounded-2xl text-emerald-200 font-black text-xl shadow-lg group">
                            <svg class="w-12 h-12 mb-1 fill-emerald-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><polygon points="7,2 17,2 22,7 22,17 17,22 7,22 2,17 2,7"/></svg>
                            <span>+1D20</span>
                        </button>
                    </div>

                    <div class="bg-dark-900 p-6 rounded-2xl border-2 border-dark-700 space-y-4">
                        <div class="flex justify-between items-center">
                            <span class="text-xl font-bold text-gray-300 flex items-center gap-2"><span>📦</span> 當前累積骰池：</span>
                            <button onclick="clearPool()" class="tactile-btn step-btn px-5 py-2.5 bg-rose-950/70 hover:bg-rose-900 border-2 border-rose-600 text-rose-200 rounded-xl font-bold text-lg flex items-center gap-1">
                                <span>🗑️</span> 清空
                            </button>
                        </div>
                        <div id="poolDisplay" class="text-3xl font-black text-amber-300 min-h-[4rem] flex items-center bg-dark-800 p-5 rounded-2xl border-2 border-dark-600 break-all">
                            （尚未點選任何骰子）
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="w-1/2 flex items-center justify-between bg-dark-800 border-2 border-dark-600 rounded-2xl px-3 py-2">
                                <button onclick="adjustNumeric('poolModifier', -1)" class="tactile-btn step-btn w-11 h-11 bg-dark-700 hover:bg-dark-600 rounded-xl font-black text-2xl text-white flex items-center justify-center">-</button>
                                <div class="text-center">
                                    <div class="text-xs text-gray-400 font-bold">固傷</div>
                                    <div id="val_poolModifier" class="text-2xl font-black text-amber-300">${formatSigned(numericValues.poolModifier || 0)}</div>
                                </div>
                                <button onclick="adjustNumeric('poolModifier', 1)" class="tactile-btn step-btn w-11 h-11 bg-dark-700 hover:bg-dark-600 rounded-xl font-black text-2xl text-white flex items-center justify-center">+</button>
                            </div>
                            <button onclick="rollPool()" class="tactile-btn step-btn w-1/2 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-2xl rounded-2xl shadow-xl flex items-center justify-center gap-2">
                                <span>🚀</span> 擲骰
                            </button>
                        </div>
                    </div>
                </div>

                <div class="bg-dark-800 border-2 border-dark-700 rounded-3xl p-6 shadow-xl space-y-6">
                    <div class="flex justify-between items-center border-b-2 border-dark-700 pb-3">
                        <h2 class="text-2xl font-black text-amber-400 flex items-center gap-3">
                            <span>📋</span> 歷史擲骰紀錄
                        </h2>
                        <button onclick="clearHistory()" class="tactile-btn step-btn px-5 py-2.5 bg-rose-950/70 hover:bg-rose-900 border-2 border-rose-600 text-rose-200 rounded-xl font-bold text-lg flex items-center gap-1">
                            <span>🗑️</span> 清除紀錄
                        </button>
                    </div>
                    <div id="historyList" class="space-y-3 max-h-96 overflow-y-auto pr-2"></div>
                </div>
            </div>

            <!-- 右側：戰鬥核心 + 屬性與豁免 + 技能 -->
            <div class="lg:col-span-7 space-y-8">
                <div class="bg-dark-800 border-2 border-dark-700 rounded-3xl p-6 shadow-xl space-y-4">
                    <h2 class="text-2xl font-black text-rose-400 flex items-center gap-3 border-b-2 border-dark-700 pb-3">
                        <span>⚔️</span> 命中 / 先攻 / 法術命中
                    </h2>
                    <div id="combatRollContainer"></div>
                </div>

                <div class="bg-dark-800 border-2 border-dark-700 rounded-3xl p-6 shadow-xl space-y-4">
                    <h2 class="text-2xl font-black text-amber-400 flex items-center gap-3 border-b-2 border-dark-700 pb-3">
                        <span>⚡</span> 六大屬性與豁免一鍵擲骰
                    </h2>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 py-2" id="attrRollContainer"></div>
                </div>

                <div class="bg-dark-800 border-2 border-dark-700 rounded-3xl p-6 shadow-xl space-y-4">
                    <h2 class="text-2xl font-black text-purple-400 flex items-center gap-3 border-b-2 border-dark-700 pb-3">
                        <span>🎯</span> 技能一鍵檢定
                    </h2>
                    <div id="skillsRollContainer" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 py-2 max-h-[550px] overflow-y-auto p-1"></div>
                </div>
            </div>
        </div>
    `;

    renderCombatButtons();
    renderAttrAndSaveButtons();
    renderSkillButtons();
    renderPool();
    renderHistory();
}

function renderCombatButtons() {
    const combatContainer = document.getElementById('combatRollContainer');
    if (!combatContainer) return;

    // 左側較寬：命中主按鈕 + 武器下拉 + 熟練提示；右側較窄：先攻與法術命中上下堆疊對齊高度
    combatContainer.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch">
            <div class="sm:col-span-7 flex flex-col justify-between gap-2.5 bg-dark-900/70 border border-dark-700 rounded-2xl p-3">
                <button onclick="rollCombatStat('ATK', '命中')" class="tactile-btn attr-square-btn bg-rose-600 hover:bg-rose-500 border-rose-400 text-white flex items-center justify-center w-full flex-1">
                    命中
                </button>
                <select id="rollerWeaponSelect" onchange="onSelectRollerWeapon(parseInt(this.value, 10))"
                    class="w-full bg-dark-900 border-2 border-rose-500/70 focus:border-amber-400 rounded-xl px-3 py-2 text-base font-black text-gray-100 focus:outline-none cursor-pointer">
                </select>
                <div id="rollerWeaponProfHint"></div>
            </div>

            <div class="sm:col-span-5 flex flex-col justify-between gap-3 bg-dark-900/70 border border-dark-700 rounded-2xl p-3">
                <button onclick="rollCombatStat('INIT', '先攻')" class="tactile-btn compact-combat-btn bg-cyan-600 hover:bg-cyan-500 border-cyan-400 text-white flex items-center justify-center w-full flex-1">
                    先攻
                </button>
                <button onclick="rollCombatStat('SPELL_ATK', '法術命中')" class="tactile-btn compact-combat-btn bg-indigo-600 hover:bg-indigo-500 border-indigo-400 text-white flex items-center justify-center w-full flex-1">
                    法術命中
                </button>
            </div>
        </div>
    `;

    const select = document.getElementById('rollerWeaponSelect');
    if (select) {
        select.innerHTML = '';
        weaponSlots.forEach((w, idx) => {
            const opt = document.createElement('option');
            opt.value = idx;
            opt.textContent = `${w.name} (${formatSigned(getWeaponTotal(idx))})`;
            if (idx === selectedWeaponIndex) opt.selected = true;
            select.appendChild(opt);
        });
    }
    updateWeaponProfHint();
}

function onSelectRollerWeapon(index) {
    if (Number.isNaN(index) || index < 0 || index >= weaponSlots.length) return;
    selectedWeaponIndex = index;
    persistToLocalStorage();
    updateWeaponProfHint();
}

function updateWeaponProfHint() {
    const hintBox = document.getElementById('rollerWeaponProfHint');
    if (!hintBox) return;
    const w = weaponSlots[selectedWeaponIndex] || weaponSlots[0];
    const attrLabel = w.attr === 'DEX' ? '敏捷' : '力量';
    const extraText = w.extra !== 0 ? `｜額外${formatSigned(w.extra)}` : '';

    if (w.prof) {
        hintBox.className = "bg-emerald-950/70 border border-emerald-500/70 rounded-xl px-3 py-2 text-center text-sm font-black text-emerald-300";
        hintBox.textContent = `✓ 已熟練（${attrLabel} + PB${extraText}）`;
    } else {
        hintBox.className = "bg-rose-950/70 border border-rose-500/70 rounded-xl px-3 py-2 text-center text-sm font-black text-rose-300";
        hintBox.textContent = `✕ 未熟練（僅${attrLabel}，無 PB${extraText}）`;
    }
}

function renderAttrAndSaveButtons() {
    const attrContainer = document.getElementById('attrRollContainer');
    if (!attrContainer) return;
    attrContainer.innerHTML = '';

    attributesData.forEach(attr => {
        const wrapper = document.createElement('div');
        wrapper.className = "flex flex-col gap-2";

        const mainBtn = document.createElement('button');
        mainBtn.className = `tactile-btn attr-square-btn ${attr.btnColor} flex items-center justify-center`;
        mainBtn.onclick = () => rollAttribute(attr.key, attr.name);
        mainBtn.textContent = attr.name;

        const saveBtn = document.createElement('button');
        const isProf = saveProficiencies[attr.key];
        saveBtn.className = `tactile-btn step-btn bg-dark-900 hover:bg-dark-700 border-2 ${isProf ? 'border-amber-400 text-amber-300' : 'border-dark-600 text-gray-300'} rounded-xl py-2.5 px-3 font-black text-lg shadow`;
        saveBtn.onclick = () => rollSavingThrow(attr.key, attr.name);
        saveBtn.textContent = `${attr.name}豁免${isProf ? ' ★' : ''}`;

        wrapper.appendChild(mainBtn);
        wrapper.appendChild(saveBtn);
        attrContainer.appendChild(wrapper);
    });
}

function renderSkillButtons() {
    const skillContainer = document.getElementById('skillsRollContainer');
    if (!skillContainer) return;
    skillContainer.innerHTML = '';

    skillsData.forEach((skill, index) => {
        const btn = document.createElement('button');
        btn.className = `tactile-btn skill-circle-btn ${skill.color}`;
        btn.onclick = () => rollSkill(index);
        btn.textContent = skill.name;
        skillContainer.appendChild(btn);
    });
}