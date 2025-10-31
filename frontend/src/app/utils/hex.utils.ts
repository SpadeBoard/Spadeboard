export function isValidHexLength(length: number): boolean {
    return length == 4 || length == 7;
}

export function isShortHex(length: number): boolean {
    return length === 4;
}

// https://www.geeksforgeeks.org/check-if-a-given-string-is-a-valid-hexadecimal-color-code-or-not/
export function isValidHexaCode(str: string): boolean {
    if (str[0] != '#')
        return false;

    if (!isValidHexLength(str.length))
        return false;

    for (let i = 1; i < str.length; i++)
        if (!isValidHexCharacter(str[i]))
            return false;

    return true;
}

export function isValidHexCharacter(char: string): boolean {
    // Handle empty string or longer than 1 char (just in case)
    if (char.length !== 1) return false;

    let c: any = char.charCodeAt(0);

    let isDigit: boolean = c >= '0'.charCodeAt(0) && c <= '9'.charCodeAt(0);
    let isLower: boolean = c >= 'a'.charCodeAt(0) && c <= 'f'.charCodeAt(0);
    let isUpper: boolean = c >= 'A'.charCodeAt(0) && c <= 'F'.charCodeAt(0);
    return isDigit || isLower || isUpper;
}

export function validateHex(hex: string, defaultHex: string = "#FFFFFF"): string {
    return (isValidHexaCode(hex)) ? hex : defaultHex;
}

export function convertShortHexToLongForm(hex: string): string {
    hex = hex.startsWith("#") ? hex.slice(1) : hex;

    if (hex.length === 3) {
        // Expand the short hex code (e.g., #abc to #aabbcc)
        let r: string = hex[0];
        let g: string = hex[1];
        let b: string = hex[2];

        return `#${r}${r}${g}${g}${b}${b}`;
    }
    else if (hex.length === 6) {
        return `#${hex}`;
    }
    else {
        throw new Error("Invalid hex code");
    }
}