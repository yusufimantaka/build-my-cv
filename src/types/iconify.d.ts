// Deklarasi tipe untuk elemen kustom <iconify-icon> dari Iconify CDN
declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      "iconify-icon": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        icon?: string;
        width?: string | number;
        height?: string | number;
      };
    }
  }
}
