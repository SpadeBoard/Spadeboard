export interface CardEditorComponentTypesProps {
    type: 'textarea' | 'image' | 'progress-bar'; // This is for determining the JSX rendering
    position: {top: number | null, left: number | null}; // Should be percentage based so absolute positioning, so ((component location x/card width) * 100) and (component location y/card height) * 100
    style: React.CSSProperties; // Have the default be absolute positioning, pass positioning here and other things
}

export interface CardEditorTextAreaProps {
    dndItemId: string | number;
    placeholder: string;
    input?: string;
    cardWidth?: string | number;
    rows?: number;
    columns?: number;
    fontFamily: string;
    borderColor: string;
    borderRadius: string | number;
}

export interface CardEditorImageProps {
    dndItemId: string | number;
    src: string; // Image source
}