const character = {
  name: "Aether",
  level: 12,
  baseStats: {
    hp: 200,
    atk: 35,
    def: 20,
    spd: 15,
  },
  
  equipped: {
    weapon: {
      id: "wpn-01",
      name: "Iron Broadsword",
      slot: "weapon",
      rarity: "common",
      statBonus: { atk: 12, spd: -2 },
    },
    armor: {
      id: "arm-01",
      name: "Leather Tunic",
      slot: "armor",
      rarity: "common",
      statBonus: { hp: 30, def: 8, spd: 2 },
    },
    accessory: null,
  },

  inventory: [
    {
      id: "wpn-02",
      name: "Flamebrand Katana",
      slot: "weapon",
      rarity: "rare",
      qty: 1,
      statBonus: { atk: 28, spd: 5 },
    },
    {
      id: "acc-01",
      name: "Ring of Vitality",
      slot: "accessory",
      rarity: "uncommon",
      qty: 2,
      statBonus: { hp: 50, def: 3 },
    },
    {
      id: "arm-02",
      name: "Mithril Chainmail",
      slot: "armor",
      rarity: "epic",
      qty: 1,
      statBonus: { hp: 80, def: 25, spd: -1 },
    //   [["hp", '80'], ['def', '25'], ['spd', '-1']]
    },
    {
      id: "pot-01",
      name: "Elixir of Strength",
      slot: "consumable",
      rarity: "rare",
      qty: 3,
      statBonus: { atk: 5 },
    },
  ],
};

// ==========================================
// TULIS JAWABAN FUNGSI KAMU DI BAWAH INI
// ==========================================

function getTotalStats(char) {
  // TODO: Implementasi Misi 1
  const equippedItem = Object.values(char.equipped).filter(item => item !== null);
  return equippedItem.reduce((total, item) => {

    return Object.entries(item.statBonus).reduce((subTotal, [statKey, statValue]) => {
        subTotal[statKey] = (subTotal[statKey] || 0) + statValue;
        return subTotal;
    }, total);
  }, {...char.baseStats});
}

function equipItem(char, itemId) {
  // TODO: Implementasi Misi 2
  const inven = char.inventory.find(item => item.id === itemId);
  if(!inven || inven.slot === "consumable") {
    return char;
  }

  const {qty, ...equippedItem} = inven;
  const oldItem = char.equipped[inven.slot];
  const updateQty = char.inventory.map((item) => item.id === inven.id ? {...item, qty: item.qty -1} : item );
  const nextInven = updateQty.filter((item) => item.qty > 0);
  let finalInven = nextInven;
  if(oldItem) {
    const findItem = nextInven.find((item) => item.id === oldItem.id);
    if(findItem) {
      finalInven = nextInven.map((item) => item.id === oldItem.id ? {...item, qty: item.qty + 1} : item);
    } else {
      finalInven = [...nextInven, {...oldItem, qty: 1}];
    }
  }

  return {...char, equipped: {...char.equipped, [inven.slot]: equippedItem}, inventory: finalInven, };
}

function unequipItem(char, slotName) {
  // TODO: Implementasi Misi 3
  const unEquip = char.equipped[slotName];
  if(!unEquip) return char;
  
  const isExist = char.inventory.find((item) => item.id === unEquip.id);
  let newInven;
  if(isExist) {
    newInven = char.inventory.map((item) => item.id === unEquip.id ? { ...item, qty: item.qty + 1} : item)
  }else {
    newInven = [...char.inventory, { ...unEquip, qty: 1}];
  }

  return {...char, equipped: {...char.equipped, [slotName]: null,}, inventory: newInven};
}

function useConsumable(char, itemId) {
  // TODO: Implementasi Misi 4
  const findId = char.inventory.find((item) => item.id === itemId);
  if(!findId || findId.slot !== "consumable") {
    return char;
  }

  const updInven = char.inventory.map((item) => item.id === itemId ? {...item, qty: item.qty - 1}: item).filter((item) => item.qty > 0);
  const newBaseStats = Object.entries(findId.statBonus).reduce((subTotal, [statKey, statValue]) => {
        return {...subTotal, [statKey]: (subTotal[statKey] || 0) + statValue,
    };
  }, {...char.baseStats});

  return {...char, baseStats: newBaseStats, inventory: updInven};
}

function getInventorySummary(char) {
  // TODO: Implementasi Misi 5
  const summary = char.inventory.reduce((catatan, item) => {
    const rarity = item.rarity;
    const current = catatan[rarity] || {totalQty: 0, items: []};
    
    return {...catatan, [rarity]: {totalQty: current.totalQty + item.qty, items: [...current.items, item.name]},};
  }, {});
  return summary;
}

function findBestUpgrade(char, slotName) {
  // TODO: Implementasi Misi 6
  const equippedItem = char.equipped[slotName];
  const currentScore = equippedItem ? Object.values(equippedItem.statBonus).reduce((total, angka) => total + angka, 0): 0;

  const pilihan = char.inventory.filter((item) => item.slot === slotName);

  return pilihan.reduce((best, item) => {
    const itemScore = Object.values(item.statBonus).reduce((total, angka) => total + angka, 0);
    const scoreGain = itemScore - currentScore;

    if (scoreGain > 0 && (!best || scoreGain > best.scoreGain)) {
      return { itemName: item.name, scoreGain };
    }

    return best;
  }, null);
}

// ==========================================
// SCRIPT PENGUJIAN (TEST CASES)
// ==========================================

console.log("1. Initial Stats:", getTotalStats(character));
// Ekspektasi: { hp: 230, atk: 47, def: 28, spd: 15 }

const stateAfterWeapon = equipItem(character, "wpn-02");
const stateAfterAcc = equipItem(stateAfterWeapon, "acc-01");
console.log("2. Stats After Equip:", getTotalStats(stateAfterAcc));
// Ekspektasi: { hp: 280, atk: 63, def: 31, spd: 22 }
console.log("   Inventory Weapon Swap:", stateAfterAcc.inventory.find((i) => i.id === "wpn-01"));
// Ekspektasi: { id: "wpn-01", name: "Iron Broadsword", slot: "weapon", rarity: "common", statBonus: { atk: 12, spd: -2 }, qty: 1 }

const stateAfterUnequip = unequipItem(stateAfterAcc, "accessory");
console.log("3. Ring Qty After Unequip:", stateAfterUnequip.inventory.find((i) => i.id === "acc-01")?.qty);
// Ekspektasi: 2

const stateAfterPotion = useConsumable(stateAfterUnequip, "pot-01");
console.log("4. Base ATK After Elixir:", stateAfterPotion.baseStats.atk);
// Ekspektasi: 40

console.log("5. Inventory Summary:", getInventorySummary(character));
// Ekspektasi:
// {
//   rare: { totalQty: 4, items: ["Flamebrand Katana", "Elixir of Strength"] },
//   uncommon: { totalQty: 2, items: ["Ring of Vitality"] },
//   epic: { totalQty: 1, items: ["Mithril Chainmail"] }
// }

console.log("6. Best Armor Upgrade:", findBestUpgrade(character, "armor"));
// Ekspektasi: { itemName: "Mithril Chainmail", scoreGain: 64 }

console.log("7. Immutability Check - Weapon:", character.equipped.weapon.name === "Iron Broadsword");
console.log("   Immutability Check - Inventory:", character.inventory.length === 4);