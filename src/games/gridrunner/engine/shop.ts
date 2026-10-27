import { BaseToolIdValue, type BaseToolId } from "./loot";

export interface ShopItem {
  baseToolId: BaseToolId;
  price: number;
  minLevel: number;
}

export const SHOP_ITEMS: ShopItem[] = [
  { baseToolId: BaseToolIdValue.Nmap, price: 50, minLevel: 1 },
  { baseToolId: BaseToolIdValue.Wireshark, price: 40, minLevel: 1 },
  { baseToolId: BaseToolIdValue.Metasploit, price: 150, minLevel: 1 },
  { baseToolId: BaseToolIdValue.FirewallRule, price: 80, minLevel: 1 },
  { baseToolId: BaseToolIdValue.BurpSuite, price: 200, minLevel: 3 },
  { baseToolId: BaseToolIdValue.YaraRules, price: 180, minLevel: 3 },
  { baseToolId: BaseToolIdValue.Hashcat, price: 300, minLevel: 5 },
  { baseToolId: BaseToolIdValue.Ghidra, price: 400, minLevel: 7 },
];
