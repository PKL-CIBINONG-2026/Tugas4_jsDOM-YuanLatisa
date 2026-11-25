// ==========================================
// 1. INITIAL DATA & PHASE 1 PURE FUNCTIONS
// ==========================================
const initialCharacter = {
  name: "Aether",
  level: 12,
  baseStats: { hp: 200, atk: 35, def: 20, spd: 15 },
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
    { id: "wpn-02", name: "Flamebrand Katana", slot: "weapon", rarity: "rare", qty: 1, statBonus: { atk: 28, spd: 5 } },
    { id: "acc-01", name: "Ring of Vitality", slot: "accessory", rarity: "uncommon", qty: 2, statBonus: { hp: 50, def: 3 } },
    { id: "arm-02", name: "Mithril Chainmail", slot: "armor", rarity: "epic", qty: 1, statBonus: { hp: 80, def: 25, spd: -1 } },
    { id: "pot-01", name: "Elixir of Strength", slot: "consumable", rarity: "rare", qty: 3, statBonus: { atk: 5 } },
  ],
};

function getTotalStats(char) {
  const equippedItem = Object.values(char.equipped).filter((item) => item !== null);
  return equippedItem.reduce((total, item) => {
    return Object.entries(item.statBonus).reduce((subTotal, [statKey, statValue]) => {
      subTotal[statKey] = (subTotal[statKey] || 0) + statValue;
      return subTotal;
    }, total);
  }, { ...char.baseStats });
}

function equipItem(char, itemId) {
  const inven = char.inventory.find((item) => item.id === itemId);
  if (!inven || inven.slot === "consumable") {
    return char;
  }

  const { qty, ...equippedItem } = inven;
  const oldItem = char.equipped[inven.slot];
  const updateQty = char.inventory.map((item) =>
    item.id === inven.id ? { ...item, qty: item.qty - 1 } : item
  );
  const nextInven = updateQty.filter((item) => item.qty > 0);
  let finalInven = nextInven;

  if (oldItem) {
    const findItem = nextInven.find((item) => item.id === oldItem.id);
    if (findItem) {
      finalInven = nextInven.map((item) =>
        item.id === oldItem.id ? { ...item, qty: item.qty + 1 } : item
      );
    } else {
      finalInven = [...nextInven, { ...oldItem, qty: 1 }];
    }
  }

  return {
    ...char,
    equipped: { ...char.equipped, [inven.slot]: equippedItem },
    inventory: finalInven,
  };
}

function unequipItem(char, slotName) {
  const unEquip = char.equipped[slotName];
  if (!unEquip) return char;

  const isExist = char.inventory.find((item) => item.id === unEquip.id);
  let newInven;

  if (isExist) {
    newInven = char.inventory.map((item) =>
      item.id === unEquip.id ? { ...item, qty: item.qty + 1 } : item
    );
  } else {
    newInven = [...char.inventory, { ...unEquip, qty: 1 }];
  }

  return {
    ...char,
    equipped: { ...char.equipped, [slotName]: null },
    inventory: newInven,
  };
}

function useConsumable(char, itemId) {
  const findId = char.inventory.find((item) => item.id === itemId);
  if (!findId || findId.slot !== "consumable") {
    return char;
  }

  const updInven = char.inventory
    .map((item) => (item.id === itemId ? { ...item, qty: item.qty - 1 } : item))
    .filter((item) => item.qty > 0);

  const newBaseStats = Object.entries(findId.statBonus).reduce((subTotal, [statKey, statValue]) => {
    return { ...subTotal, [statKey]: (subTotal[statKey] || 0) + statValue };
  }, { ...char.baseStats });

  return { ...char, baseStats: newBaseStats, inventory: updInven };
}

function getInventorySummary(char) {
  const summary = char.inventory.reduce((catatan, item) => {
    const rarity = item.rarity;
    const current = catatan[rarity] || { totalQty: 0, items: [] };

    return {
      ...catatan,
      [rarity]: {
        totalQty: current.totalQty + item.qty,
        items: [...current.items, item.name],
      },
    };
  }, {});

  return summary;
}

function findBestUpgrade(char) {
  const candidates = char.inventory.filter(function (item) {
    return item.slot !== "consumable";
  });

  return candidates.reduce(function (best, item) {
    const itemScore = Object.values(item.statBonus).reduce(function (total, num) {
      return total + num;
    }, 0);

    if (!best) return item;

    const bestScore = Object.values(best.statBonus).reduce(function (total, num) {
      return total + num;
    }, 0);

    return itemScore > bestScore ? item : best;
  }, null);
}

// ==========================================
// 2. APPLICATION STATE & DOM RENDER ENGINE
// ==========================================

let appState = {
  character: structuredClone(initialCharacter),
  activeRarity: "all",
  logs: ["Karakter siap bertualang."],
};

const tambahLog = (msg) => [msg, ...appState.logs].slice(0, 5);

function render() {
  document.getElementById("char-header").textContent = `${appState.character.name} - Lv ${appState.character.level}`;

  const stats = getTotalStats(appState.character);
  document.getElementById("stats-container").innerHTML = Object.entries(stats)
    .map(
      ([statName, value]) =>
        `<div class="stats-box">
          <div class="stat-label">${statName}</div>
          <div class="stat-value">${value}</div>
        </div>`
    )
    .join("");

  document.getElementById("equipped-container").innerHTML = Object.entries(appState.character.equipped)
    .map(([slot, item]) => {
      if (!item) {
        return `
          <div class="slot-item">
            <div>
              <div class="slot-title">${slot}</div>
              <div class="empty-text">Empty Slot</div>
            </div>
          </div>
        `;
      }

      const bonusText = Object.entries(item.statBonus)
        .map(([stat, val]) => `${val >= 0 ? `+${val}` : val} ${stat.toUpperCase()}`)
        .join(", ");

      return `
        <div class="slot-item">
          <div>
            <div class="slot-title">${slot}</div>
            <strong>${item.name}</strong>
            <span class="badge badge-rarity">${item.rarity}</span>
            <div class="bonus-text">${bonusText}</div>
          </div>
          <button class="action-btn btn-unequip" data-action="unequip" data-slot="${slot}">Unequip</button>
        </div>
      `;
    })
    .join("");

  const filter =
    appState.activeRarity === "all"
      ? appState.character.inventory
      : appState.character.inventory.filter((item) => item.rarity === appState.activeRarity);

  const best = findBestUpgrade(appState.character);

  document.getElementById("inventory-container").innerHTML = filter
    .map((item) => {
      const bonusText = Object.entries(item.statBonus)
        .map(([stat, val]) => `${val >= 0 ? `+${val}` : val} ${stat.toUpperCase()}`)
        .join(", ");
      const badge = best && best.id === item.id ? `<span class="badge badge-upgrade">▲ Best Upgrade</span>` : "";
      const btn =
        item.slot === "consumable"
          ? `<button class="action-btn btn-use" data-action="consume" data-id="${item.id}">Use</button>`
          : `<button class="action-btn btn-equip" data-action="equip" data-id="${item.id}">Equip</button>`;

      return `
        <div class="inv-item">
          <div>
            <strong>${item.name}</strong> (x${item.qty})
            <span class="badge badge-rarity">${item.rarity}</span>
            ${badge}
            <div class="bonus-text">${bonusText}</div>
          </div>
          ${btn}
        </div>
      `;
    })
    .join("");

  const summary = getInventorySummary(appState.character);
  const totalAll = Object.values(summary).reduce((total, data) => total + data.totalQty, 0);
  const daftarRarity = ["all", "common", "uncommon", "rare", "epic"];

  document.getElementById("filter-container").innerHTML = daftarRarity
    .map((rarity) => {
      const qty = rarity === "all" ? totalAll : (summary[rarity]?.totalQty || 0);
      const active = appState.activeRarity === rarity ? "active" : "";
      const label = rarity[0].toUpperCase() + rarity.slice(1);
      return `<button class="tab-btn ${active}" data-action="filter" data-rarity="${rarity}">${label} (${qty})</button>`;
    })
    .join("");

  document.getElementById("log-container").innerHTML = appState.logs.map((l) => `<li>${l}</li>`).join("");
}

document.getElementById("app").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const { action, id, slot, rarity } = btn.dataset;

  if (action === "equip") {
    const item = appState.character.inventory.find((i) => i.id === id);
    if (item) {
      appState = {
        ...appState,
        character: equipItem(appState.character, id),
        logs: tambahLog(`Equip ${item.name}`),
      };
    }
  }
  if (action === "unequip") {
    const item = appState.character.equipped[slot];
    if (item) {
      appState = {
        ...appState,
        character: unequipItem(appState.character, slot),
        logs: tambahLog(`Unequip ${item.name}`),
      };
    }
  }
  if (action === "consume") {
    const item = appState.character.inventory.find((i) => i.id === id);
    if (item) {
      appState = {
        ...appState,
        character: useConsumable(appState.character, id),
        logs: tambahLog(`Use ${item.name}`),
      };
    }
  }
  if (action === "filter") {
    appState = { ...appState, activeRarity: rarity };
  }
  if (action === "reset") {
    appState = {
      character: structuredClone(initialCharacter),
      activeRarity: "all",
      logs: ["Data di-reset."],
    };
  }
  render();
});

render();