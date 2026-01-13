// Extend Window interface for flow generation methods
declare global {
  interface Window {
    generateFlowJson?: () => string;
    generateFlowCode?: () => void;
    generateNestedFlowJson?: () => void;
    generateNestedFlowCode?: () => void;
  }
}

export {};
