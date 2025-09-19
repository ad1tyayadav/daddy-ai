declare module 'html2canvas' {
  interface Html2CanvasOptions {
    scale?: number;
    useCORS?: boolean;
    logging?: boolean;
  }

  function html2canvas(element: HTMLElement, options?: Html2CanvasOptions): Promise<HTMLCanvasElement>;
  
  export default html2canvas;
}