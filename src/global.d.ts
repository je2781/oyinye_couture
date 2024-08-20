interface Window {
  checkout: (callback: (response: any) => Promise<void>) => void;
}
