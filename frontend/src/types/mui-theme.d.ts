import '@mui/material/styles';

declare module '@mui/material/styles' {
    interface TypeText {
        ternary: string;
    }
    
    interface Palette {
        static: {
            primary: string;
            secondary: string;
            ternary: string;
        };
        progressbar: {
            main: string;
        };
    }
    
    interface PaletteOptions {
        static?: {
            primary: string;
            secondary: string;
            ternary: string;
        };
        progressbar?: {
            main: string;
        };
    }
}
