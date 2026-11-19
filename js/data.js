const skillsData = [
    { name: "運動", attr: "STR", color: "bg-red-600 hover:bg-red-500 border-red-400 text-white" },
    { name: "特技", attr: "DEX", color: "bg-blue-600 hover:bg-blue-500 border-blue-400 text-white" },
    { name: "巧手", attr: "DEX", color: "bg-blue-600 hover:bg-blue-500 border-blue-400 text-white" },
    { name: "隱匿", attr: "DEX", color: "bg-blue-600 hover:bg-blue-500 border-blue-400 text-white" },
    { name: "歷史", attr: "INT", color: "bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white" },
    { name: "調查", attr: "INT", color: "bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white" },
    { name: "自然", attr: "INT", color: "bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white" },
    { name: "宗教", attr: "INT", color: "bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white" },
    { name: "奧秘", attr: "INT", color: "bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white" },
    { name: "馴獸", attr: "WIS", color: "bg-orange-600 hover:bg-orange-500 border-orange-400 text-white" },
    { name: "洞悉", attr: "WIS", color: "bg-orange-600 hover:bg-orange-500 border-orange-400 text-white" },
    { name: "醫藥", attr: "WIS", color: "bg-orange-600 hover:bg-orange-500 border-orange-400 text-white" },
    { name: "察覺", attr: "WIS", color: "bg-orange-600 hover:bg-orange-500 border-orange-400 text-white" },
    { name: "生存", attr: "WIS", color: "bg-orange-600 hover:bg-orange-500 border-orange-400 text-white" },
    { name: "欺瞞", attr: "CHA", color: "bg-purple-600 hover:bg-purple-500 border-purple-400 text-white" },
    { name: "威嚇", attr: "CHA", color: "bg-purple-600 hover:bg-purple-500 border-purple-400 text-white" },
    { name: "表演", attr: "CHA", color: "bg-purple-600 hover:bg-purple-500 border-purple-400 text-white" },
    { name: "說服", attr: "CHA", color: "bg-purple-600 hover:bg-purple-500 border-purple-400 text-white" }
];

const attributesData = [
    { key: "STR", name: "力量", dot: "🔴", btnColor: "bg-red-600 hover:bg-red-500 border-red-400 text-white", cardBg: "bg-red-950/30 border-red-600/70", textCol: "text-red-400" },
    { key: "DEX", name: "敏捷", dot: "🔵", btnColor: "bg-blue-600 hover:bg-blue-500 border-blue-400 text-white", cardBg: "bg-blue-950/30 border-blue-600/70", textCol: "text-blue-400" },
    { key: "INT", name: "智慧", dot: "🟢", btnColor: "bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white", cardBg: "bg-emerald-950/30 border-emerald-600/70", textCol: "text-emerald-400" },
    { key: "WIS", name: "感知", dot: "🟠", btnColor: "bg-orange-600 hover:bg-orange-500 border-orange-400 text-white", cardBg: "bg-orange-950/30 border-orange-600/70", textCol: "text-orange-400" },
    { key: "CHA", name: "魅力", dot: "🟣", btnColor: "bg-purple-600 hover:bg-purple-500 border-purple-400 text-white", cardBg: "bg-purple-950/30 border-purple-600/70", textCol: "text-purple-400" },
    { key: "CON", name: "體質", dot: "🟡", btnColor: "bg-amber-600 hover:bg-amber-500 border-amber-400 text-white", cardBg: "bg-amber-950/30 border-amber-600/70", textCol: "text-amber-400" }
];

const combatStatsData = [
    { key: "INIT", name: "先攻", icon: "⚡", color: "bg-cyan-600 hover:bg-cyan-500 border-cyan-400 text-white" },
    { key: "ATK", name: "命中", icon: "⚔️", color: "bg-rose-600 hover:bg-rose-500 border-rose-400 text-white" },
    { key: "SPELL_ATK", name: "法術命中", icon: "🔮", color: "bg-indigo-600 hover:bg-indigo-500 border-indigo-400 text-white" }
];

const soundTypesData = [
    { key: "fire", label: "火焰爆裂" },
    { key: "arcane", label: "奧術射線" },
    { key: "heal", label: "神聖治癒" },
    { key: "curse", label: "暗影詛咒" },
    { key: "lightning", label: "閃電震擊" },
    { key: "boing", label: "彈簧搞笑" },
    { key: "trombone", label: "悲催滑音" },
    { key: "laser", label: "逗趣雷射" }
];

const spellSlotPresetsData = [
    { maxLevel: 4, label: "1～4 環" },
    { maxLevel: 6, label: "1～6 環" },
    { maxLevel: 9, label: "1～9 環" }
];

const defaultSpellsData = [];
