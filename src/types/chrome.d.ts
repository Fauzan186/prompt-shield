interface ChromeStorageArea {
  get(
    keys: string[] | string | Record<string, unknown> | null,
    callback: (items: Record<string, unknown>) => void,
  ): void;
  set(items: Record<string, unknown>, callback?: () => void): void;
}

interface ChromeStorageChange {
  oldValue?: unknown;
  newValue?: unknown;
}

interface ChromeStorageChanges {
  [key: string]: ChromeStorageChange;
}

interface ChromeStorageOnChanged {
  addListener(callback: (changes: ChromeStorageChanges, areaName: string) => void): void;
}

interface ChromeStorageNamespace {
  local?: ChromeStorageArea;
  onChanged?: ChromeStorageOnChanged;
}

interface ChromeNamespace {
  storage?: ChromeStorageNamespace;
}

declare const chrome: ChromeNamespace;
