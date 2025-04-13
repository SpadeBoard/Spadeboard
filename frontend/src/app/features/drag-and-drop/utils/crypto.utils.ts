export function getCrypto() {
    try {
        return window.crypto;
    } catch {
        return crypto;
    }
}