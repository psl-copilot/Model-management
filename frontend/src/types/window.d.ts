// Extend Window interface for flow generation methods
declare global {
  interface Window {
    generateFlowJson?: () => void;
    generateFlowCode?: () => void;
    generateNestedFlowJson?: () => void;
    generateNestedFlowCode?: () => void;
  }
}

export {};
