import { SafeUrl } from "@angular/platform-browser";

export function clamp(value: number, min: number, max: number): number {
    // console.log(`[CLAMP] value: ${value}, min: ${min}, max: ${max}`);

    if (min > max) throw new Error(`Invalid clamp range`);
    return Math.min(Math.max(value, min), max);
}

export async function safeUrlToBlob(safeUrl: SafeUrl): Promise<Blob | null> {
    try {
        let urlString = safeUrl.toString();
        let response = await fetch(urlString);
        let blob = await response.blob();
        return blob;
    } catch (error) {
        console.error('Error converting SafeUrl to Blob:', error);
        return null;
    }
}

export async function onLoadReadBlobAsBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        // Read the blob as a data URL
        reader.readAsDataURL(blob);

        // Handle successful reading
        reader.onloadend = () => {
            if (reader.result) {
                resolve(reader.result.toString());
            } else {
                reject('Failed to read blob as base64');
            }
        };

        // Handle errors
        reader.onerror = (error) => {
            reject(error);
        };
    });
}

export async function blobToDataURL(blobUrl: string): Promise<string> {
    let response = await fetch(blobUrl);
    let blob = await response.blob();
    return new Promise((resolve) => {
        let reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
}