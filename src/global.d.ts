interface Window {
  checkout: (callback: (response: any) => Promise<void>, path: string) => void;
}


