let currentPool = [];
let history = [];
let advantageMode = 'normal';

function setAdvantageMode(mode) {
    advantageMode = mode;
    ['normal', 'advantage', 'disadvantage'].forEach(m => {
        const btn = document.getElementById(`btn_adv_${m}`);
        if (!btn) return;
        btn.className = m === mode
            ? "tactile-btn adv-active flex-1 py-3 font-black text-lg rounded-xl"
            : "tactile-btn adv-idle flex-1 py-3 font-black text-lg rounded-xl";
    });
}

function addDiceToPool(faces) {
    currentPool.push(faces);
    renderPool();
}

function clearPool() {
    currentPool = [];
    renderPool();
}

function renderPool() {
    const display = document.getElementById('poolDisplay');
    if (!display) return;
    if (currentPool.length === 0) {
        display.innerHTML = '<span class="text-gray-500 font-medium">（尚未點選任何骰子）</span>';
        return;
    }

    const counts = {};
    currentPool.forEach(faces => {
        counts[faces] = (counts[faces] || 0) + 1;
    });

    const textArr = [];
    [4, 6, 8, 10, 12, 20].forEach(f => {
        if (counts[f]) {
            const prefix = counts[f] > 1 ? counts[f] : '';
            textArr.push(`${prefix}D${f}`);
        }
    });

    display.innerHTML = `🎲 <span class="text-amber-300">${textArr.join(' + ')}</span>`;
}

function parseSimpleDiceFormula(formula) {
    const cleaned = String(formula || '').replace(/\s+/g, '').toUpperCase();
    const match = cleaned.match(/^(\d*)D(\d+)([+-]\d+)?$/);
    if (!match) return null;
    const count = Math.max(1, Math.min(50, parseInt(match[1] || '1', 10)));
    const faces = Math.max(2, Math.min(1000, parseInt(match[2], 10)));
    const flat = match[3] ? parseInt(match[3], 10) : 0;
    return { count, faces, flat };
}

function rollPool() {
    if (currentPool.length === 0) {
        alert("請先點擊上方按鈕加入至少一顆骰子！");
        return;
    }

    const rollsDetail = [];
    let sum = 0;
    let hasCrit20 = false;
    let hasFail1 = false;
    const isSingleD20 = currentPool.length === 1 && currentPool[0] === 20;

    currentPool.forEach(faces => {
        const r = Math.floor(Math.random() * faces) + 1;
        rollsDetail.push(`D${faces}:(${r})`);
        sum += r;
        if (faces === 20 && r === 20) hasCrit20 = true;
        if (r === 1) hasFail1 = true;
    });

    const modifier = numericValues.poolModifier || 0;
    const finalTotal = sum + modifier;

    const title = `自由骰池組合 (${currentPool.length}顆)`;
    let breakdownText = `明細: [ ${rollsDetail.join(', ')} ]`;
    if (modifier !== 0) breakdownText += ` | 固傷: ${formatSigned(modifier)}`;

    const activeCrit = isSingleD20 && hasCrit20;
    const activeFail = isSingleD20 && hasFail1 && !hasCrit20;

    if (activeCrit) breakdownText += " 🔥 【Critical！】";
    if (activeFail) breakdownText += " 💥 【BOOM！】";

    pushResult(title, finalTotal, breakdownText, activeCrit, activeFail, { playRollAudio: true });
}

function rollCombatStat(statKey, statName) {
    if (statKey === 'ATK') {
        const w = weaponSlots[selectedWeaponIndex] || weaponSlots[0];
        const wName = w.name || `武器 ${selectedWeaponIndex + 1}`;
        const profLabel = w.prof ? '已熟練' : '未熟練';
        processD20Roll(`命中｜${wName} (${profLabel})`, getWeaponTotal(selectedWeaponIndex));
        return;
    }
    processD20Roll(statName, getCombatTotal(statKey));
}

function rollAttribute(attrKey, attrName) {
    processD20Roll(attrName, numericValues[attrKey] || 0);
}

function rollSavingThrow(attrKey, attrName) {
    const attrMod = numericValues[attrKey] || 0;
    const pb = saveProficiencies[attrKey] ? (numericValues.globalPB || 0) : 0;
    processD20Roll(`${attrName}豁免`, attrMod + pb);
}

function rollSkill(index) {
    const skill = skillsData[index];
    const pb = numericValues.globalPB || 0;
    const level = skillProficiencies[index] || 0;
    const attrMod = numericValues[skill.attr] || 0;

    let totalBonus = attrMod;
    if (level === 1) totalBonus += pb;
    if (level === 2) totalBonus += pb * 2;

    processD20Roll(skill.name, totalBonus);
}

function rollSpellAttack(spell) {
    playSpellSound(spell.sound);
    processD20Roll(`法術命中｜${spell.name}`, getCombatTotal('SPELL_ATK'), { skipCritFailSound: true });
}

function rollSpellEffect(spell) {
    playSpellSound(spell.sound);
    const parsed = parseSimpleDiceFormula(spell.diceFormula);
    if (!parsed) {
        pushResult(`法術施放｜${spell.name}`, 0, `骰式格式無法辨識 (${spell.diceFormula})`, false, false, { playRollAudio: false });
        return;
    }

    const rolls = [];
    let sum = 0;
    for (let i = 0; i < parsed.count; i++) {
        const r = Math.floor(Math.random() * parsed.faces) + 1;
        rolls.push(r);
        sum += r;
    }

    const totalBonus = parsed.flat + (spell.bonus || 0);
    const total = sum + totalBonus;
    const lvlLabel = spell.level === 0 ? '戲法' : `${spell.level}環`;
    let breakdown = `${spell.diceFormula} [${rolls.join(', ')}]`;
    if (totalBonus !== 0) breakdown += ` ${formatSigned(totalBonus)}`;
    if (spell.note) breakdown += `｜${spell.note}`;

    pushResult(`施放｜${spell.name} (${lvlLabel})`, total, breakdown, false, false, { playRollAudio: false });
}

function processD20Roll(title, totalBonus, opts = {}) {
    const r1 = Math.floor(Math.random() * 20) + 1;
    let d20 = r1;
    let breakdownText = "";
    let isCrit = false;
    let isFail = false;
    let displayTitle = title;

    if (advantageMode === 'advantage') {
        const r2 = Math.floor(Math.random() * 20) + 1;
        d20 = Math.max(r1, r2);
        breakdownText = `優勢檢定 [${r1}, ${r2}] 取高 (${d20}) + 加成 (${formatSigned(totalBonus)})`;
        if (d20 === 20) isCrit = true;
        if (d20 === 1) isFail = true;
        displayTitle += " 【優勢】";
    } else if (advantageMode === 'disadvantage') {
        const r2 = Math.floor(Math.random() * 20) + 1;
        d20 = Math.min(r1, r2);
        breakdownText = `劣勢檢定 [${r1}, ${r2}] 取低 (${d20}) + 加成 (${formatSigned(totalBonus)})`;
        if (d20 === 20) isCrit = true;
        if (d20 === 1) isFail = true;
        displayTitle += " 【劣勢】";
    } else {
        breakdownText = `D20 (${d20}) + 加成 (${formatSigned(totalBonus)})`;
        if (d20 === 20) isCrit = true;
        if (d20 === 1) isFail = true;
    }

    const finalTotal = d20 + totalBonus;
    if (isCrit) breakdownText += " 🔥 【Critical！】";
    if (isFail) breakdownText += " 💥 【BOOM！】";

    pushResult(displayTitle, finalTotal, breakdownText, isCrit, isFail, {
        playRollAudio: !opts.skipCritFailSound,
        skipCritFailSound: Boolean(opts.skipCritFailSound)
    });
}

function pushResult(title, total, breakdown, isCrit, isFail, soundOpts = {}) {
    const stickyBox = document.getElementById('stickyResultBox');
    const titleElem = document.getElementById('stickyTitle');
    const totalElem = document.getElementById('stickyTotal');
    const iconElem = document.getElementById('stickyIcon');
    const breakdownElem = document.getElementById('stickyBreakdown');

    stickyBox.classList.remove('crit-effect', 'fail-effect');
    titleElem.classList.remove('crit-text', 'fail-text');
    totalElem.classList.remove('crit-text', 'fail-text');

    let iconText = "✨";
    if (isCrit) {
        stickyBox.classList.add('crit-effect');
        titleElem.classList.add('crit-text');
        totalElem.classList.add('crit-text');
        iconText = "🔥";
        if (!soundOpts.skipCritFailSound) playCritSound();
    } else if (isFail) {
        stickyBox.classList.add('fail-effect');
        titleElem.classList.add('fail-text');
        totalElem.classList.add('fail-text');
        iconText = "💥";
        if (!soundOpts.skipCritFailSound) playFailSound();
    } else if (soundOpts.playRollAudio) {
        playDiceRollSound();
    }

    iconElem.textContent = iconText;
    titleElem.textContent = title;
    totalElem.textContent = total;
    breakdownElem.textContent = breakdown;

    history.unshift({
        time: new Date().toLocaleTimeString(),
        title,
        total,
        breakdown,
        isCrit,
        isFail
    });
    if (history.length > 20) history.pop();

    renderHistory();
}

function renderHistory() {
    const list = document.getElementById('historyList');
    if (!list) return;
    if (history.length === 0) {
        list.innerHTML = '<div class="text-center text-gray-500 py-6 text-xl font-bold">尚無歷史紀錄</div>';
        return;
    }

    list.innerHTML = '';
    history.forEach(item => {
        const div = document.createElement('div');
        let extraClass = "bg-dark-900 border-2 border-dark-700";
        if (item.isCrit) extraClass = "border-amber-500 bg-amber-950/40";
        if (item.isFail) extraClass = "border-rose-500 bg-rose-950/40";

        div.className = `rounded-2xl p-5 flex justify-between items-center gap-4 transition-all ${extraClass}`;
        div.innerHTML = `
            <div class="space-y-1">
                <div class="text-base font-bold text-gray-300">${item.time} - <span class="text-amber-300 font-black text-lg">${item.title}</span></div>
                <div class="text-base text-gray-200 font-bold">${item.breakdown}</div>
            </div>
            <div class="text-4xl font-black text-emerald-400 bg-dark-800 px-6 py-3 rounded-xl border-2 border-dark-600 shadow-inner">
                ${item.total}
            </div>
        `;
        list.appendChild(div);
    });
}

function clearHistory() {
    history = [];
    renderHistory();
    const stickyBox = document.getElementById('stickyResultBox');
    stickyBox.classList.remove('crit-effect', 'fail-effect');
    document.getElementById('stickyTitle').classList.remove('crit-text', 'fail-text');
    document.getElementById('stickyTotal').classList.remove('crit-text', 'fail-text');
    document.getElementById('stickyIcon').textContent = "✨";
    document.getElementById('stickyTitle').textContent = "尚未進行擲骰";
    document.getElementById('stickyTotal').textContent = "-";
    document.getElementById('stickyBreakdown').textContent = "請至「檢定主頁」點擊按鈕進行擲骰";
}