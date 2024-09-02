import { CardEditorTextAreaProps } from "./card-editor-interface";

// Have the default CSS styling as well as modify it if there's styling based on arguments
// Make sure to pass in dndItemId to know that it's a child of the container

const CardEditorTextArea: React.FC<CardEditorTextAreaProps> = ({ dndItemId = "dndItemId", placeholder, input, rows, columns, fontFamily}) => {
    const defaultCardEditorTextAreaStyle = (fontFamily: string | undefined, borderColor: string): React.CSSProperties => {
        return {
            color: "black",
            fontFamily: fontFamily || "Arial",
            border: `2px solid ${borderColor}`,
            borderRadius: '4px',
            outline: 'none',
            boxSizing: 'border-box',
            /*width: '200cqw',
            height:'100cqh',*/
            maxWidth: '100cqw', /*'100%', /*(cardWidth) ? (var(cardWidth)) : '100%'*/
            maxHeight:'50cqh', /*'100%',*/ // Why aren't these overriding width and height
            cursor: 'grab',
            padding: '10px',
        }
    };

    return (
        <textarea style={defaultCardEditorTextAreaStyle(fontFamily, 'black')} id={dndItemId as string} name={dndItemId as string} rows={rows} cols={columns} placeholder={placeholder}>
        </textarea>
)};

export default CardEditorTextArea;