export function parseCssDimension(value: string | undefined): number {
    if (!value) return 0;

    const match = value.match(/^(\d+(?:\.\d+)?)(px|em|rem|%|vw|vh|cm|mm|in|pt|pc)?$/);
    if (!match) return 0;

    const [, numStr, unit] = match;
    const num = parseFloat(numStr);

    switch (unit) {
        case 'px':
        case undefined:
            return num;
        case 'em':
        case 'rem':
            return num * 16; // Assuming 1em = 16px
        case '%':
        case 'vw':
        case 'vh':
            return num * 0.01 * 1000; // Arbitrary scale
        case 'cm':
            return num * 37.8; // 1cm ≈ 37.8px
        case 'mm':
            return num * 3.78; // 1mm ≈ 3.78px
        case 'in':
            return num * 96; // 1in = 96px
        case 'pt':
            return num * 1.33; // 1pt ≈ 1.33px
        case 'pc':
            return num * 16; // 1pc = 12pt ≈ 16px
        default:
            return 0;
    }
}

export function parseCssDimensionToNumber(cssDimension: string): number {
    return parseFloat(cssDimension); // Removes 'px' and converts to a number
}
