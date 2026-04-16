/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

export interface ShopItem {
  baseToolId: string;
  price: number;
  minLevel: number;
}

/** Arcade shop inventory (GDD §4.5) */
export const SHOP_ITEMS: ShopItem[] = [
  { baseToolId: "nmap", price: 50, minLevel: 1 },
  { baseToolId: "wireshark", price: 40, minLevel: 1 },
  { baseToolId: "metasploit", price: 150, minLevel: 1 },
  { baseToolId: "firewall-rule", price: 80, minLevel: 1 },
  { baseToolId: "burp-suite", price: 200, minLevel: 3 },
  { baseToolId: "yara-rules", price: 180, minLevel: 3 },
  { baseToolId: "hashcat", price: 300, minLevel: 5 },
  { baseToolId: "ghidra", price: 400, minLevel: 7 },
];
