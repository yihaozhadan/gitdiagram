declare global {
  namespace JSX {
    interface IntrinsicElements {
      'l-trio': {
        size?: string | number;
        speed?: string | number;
        color?: string | number;
      };
    }
  }
}

export {};
