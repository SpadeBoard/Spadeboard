import { ElementRef } from "@angular/core";
import { SafeUrl } from "@angular/platform-browser";
import html2canvas from "html2canvas";
import { FileMetadata, FileMetadataStatus } from "./models/file-metadata";
import { Observable, of, switchMap, tap } from "rxjs";
import { FileMetadataApiService } from "./services/file-metadata-api.service";
import { FileUploadApiService } from "./services/file-upload-api.service";
import ImageBlobReduce, { ResizeOptions } from 'image-blob-reduce';
import JSZip from "jszip";

export function getDefaultFileMetadata(): FileMetadata {
    return {
        fileMetadataId: "",
        volumePath: "",
        fileName: "",
        fileMetadataStatus: FileMetadataStatus.Pending,
        creationDate: null
    }
}


export function clamp(value: number, min: number, max: number): number {
    // console.log(`[CLAMP] value: ${value}, min: ${min}, max: ${max}`);

    if (min > max) throw new Error(`Invalid clamp range`);
    return Math.min(Math.max(value, min), max);
}

export async function safeUrlToBlob(safeUrl: SafeUrl): Promise<Blob | null> {
    try {
        let urlString: string = safeUrl.toString();
        let response: Response = await fetch(urlString);
        let blob: Blob = await response.blob();
        return blob;
    } catch (error) {
        console.error('Error converting SafeUrl to Blob:', error);
        return null;
    }
}

// TODO: Combine with blobUrlToDataUrl and have function overload
export async function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        let reader: FileReader = new FileReader();

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

export async function blobUrlToDataURL(blobUrl: string): Promise<string> {
    let response: Response = await fetch(blobUrl);
    let blob: Blob = await response.blob();
    return new Promise((resolve) => {
        let reader: FileReader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
}

export function dataURLtoBlob(dataUrl: string, type?: string): Blob {
    if (!dataUrl || dataUrl.length <= 0) throw new Error("Data URL must have content");

    let arr: string[] = dataUrl.split(',');

    let match: RegExpMatchArray | null = arr[0].match(/:(.*?);/);

    let mime: string | undefined = match ? match[1] :  type;
    let bstr: string = atob(arr[1]);
    let n: number = bstr.length;
        
    let u8arr: Uint8Array<ArrayBuffer> = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], {type: mime});
}

export function createImageFromBlob(blob: Blob): HTMLImageElement {
    let image: HTMLImageElement = new Image();
    let objectUrl: string = URL.createObjectURL(blob);
    image.src = objectUrl;
    return image;
}


// TODO: Refactor all these functions, probably should split them into smaller files
export function getScaledItemRenderDimensions(
    original: Dimensions,
    scale: number
): Dimensions {
    return {
        width: original.width * scale,
        height: original.height * scale
    };
}

export type Coordinates = {
    x: number;
    y: number;
}

export type Dimensions = {
    width: number;
    height: number;
}

export function areDimensionsHigherThanZero(dimensions: Dimensions) {
    return (dimensions.width > 0 && dimensions.height > 0);
}

export type Rect = {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export type Threshold = {
    min: number;
    max: number;
}

// https://www.geeksforgeeks.org/convex-hull-using-jarvis-algorithm-or-wrapping/
// https://en.wikipedia.org/wiki/Graham_scan
/*
let points be the list of points
let stack = empty_stack()

find the lowest y-coordinate and leftmost point, called P0
sort points by polar angle with P0, if several points have the same polar angle then only keep the farthest

for point in points:
    # pop the last point from the stack if we turn clockwise to reach this point
    while count stack > 1 and ccw(next_to_top(stack), top(stack), point) <= 0:
        pop stack
    push point to stack
end
*/

// https://www.geeksforgeeks.org/convex-hull-using-graham-scan/

// Function to compute orientation of the triplet (a, b, c)
// Returns -1 for clockwise, 1 for counter-clockwise, 0 for collinear
export function orientationFromCoordinates(a: Coordinates, b: Coordinates, c: Coordinates) {
    let v: number = a.x * (b.y - c.y) +
        b.x * (c.y - a.y) +
        c.x * (a.y - b.y);
    if (v < 0) return -1;  // clockwise
    if (v > 0) return +1;  // counter-clockwise
    return 0;              // collinear
}

export function orientationFromAngle(a: number) {
    if (a < 0) return -1; // clockwise
    if (a > 0) return +1; // counter-clockwise
    return 0; // collinear
}

export function getPolarAngle(a: Coordinates, b: Coordinates): number {
    return Math.atan2(b.y - a.y, b.x - a.x);
}

export function getDistanceSquared(a: Coordinates, b: Coordinates): number {
    return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

export function sortByPolarAngle(coordinates: Coordinates[]): Coordinates[] {
    let p0: Coordinates = getMinCoordinates(coordinates);

    let others: Coordinates[] = coordinates.filter(c => c !== p0);

    // Sort by polar angle, then by distance descending
    others.sort((a, b) => {
        let angleA: number = getPolarAngle(p0, a);
        let angleB: number = getPolarAngle(p0, b);

        if (angleA !== angleB) return angleA - angleB;
        return getDistanceSquared(p0, b) - getDistanceSquared(p0, a);
    });

    // Remove closer duplicates (keep only farthest for each angle)
    let unique: Coordinates[] = [];

    let lastAngle: number | null = null;
    for (const p of others) {
        let angle = getPolarAngle(p0, p);

        if (angle !== lastAngle) {
            unique.push(p);
            lastAngle = angle;
        }
    }

    return [p0, ...unique];
}

export function grahamScanAlgorithm(coordinates: Coordinates[]): Coordinates[] {
    let points: Coordinates[] = sortByPolarAngle(coordinates);
    let stack: Coordinates[] = [points[0]];

    points.forEach((point: Coordinates) => {
        while (stack.length > 1 && orientationFromCoordinates(points[points.length - 2], points[points.length - 1], point) <= 0) {
            stack.pop();
        }
        stack.push(point);
    });
    return points;
}

export function getMinCoordinates(coordinates: Coordinates[]): Coordinates {
    return {
        x: Math.min(...coordinates.map(c => c.x)),
        y: Math.min(...coordinates.map(c => c.y))
    };
}

export function getMaxCoordinates(coordinates: Coordinates[]): Coordinates {
    return {
        x: Math.max(...coordinates.map(c => c.x)),
        y: Math.max(...coordinates.map(c => c.y))
    };
}

// https://stackoverflow.com/questions/46335488/how-to-efficiently-find-the-bounding-box-of-a-collection-of-points#46336730
// https://stackoverflow.com/questions/19590865/from-an-array-of-objects-extract-value-of-a-property-as-array
export function getBoundingBox(coordinates: Coordinates[]): {
    min: Coordinates,
    max: Coordinates
} {
    return {
        min: getMinCoordinates(coordinates),
        max: getMaxCoordinates(coordinates)
    };
}

export function moveToFront(array: any[], index: number) {
    if (index > 0 && index < array.length) {
        let [item]: any = array.splice(index, 1);
        array.unshift(item);
    }
    return array;
}

export function moveToBack(array: any[], index: number) {
    if (index >= 0 && index < array.length) {
        let [item]: any = array.splice(index, 1);
        array.push(item);
    }
    return array;
}

export function getMidpoint(a: Coordinates, b: Coordinates): Coordinates {
    return {
        x: a.x + b.x / 2,
        y: a.y + b.y / 2
    }
}

export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONValue[] | { [key: string]: JSONValue };

// TODO: Probably shouldn't have any
export function exportCustomTypeFile(data: any | JSONValue, filename: string, extension: string) {
    let fileContent: string = JSON.stringify(data); // NOTE: Pretty printing screws up with the hash so no
    let blob: Blob = new Blob([fileContent], { type: 'application/octet-stream' });
    download(filename, extension, URL.createObjectURL(blob));
}

export function download(filename: string, extension: string, href: any) {
    let a: HTMLAnchorElement = document.createElement('a');
    a.href = href;
    a.download = `${filename}.${extension}`; // custom extension
    a.click();
    if (a.href.startsWith('blob:')) URL.revokeObjectURL(a.href);
}

/* https://html2canvas.net/how-to-convert-canvas-to-base64-image/*/


// https://stackoverflow.com/a/50736279
export async function flattenToImage(elementRef: ElementRef<any>, scale: number = 1.0, dpi: number = 96, backgroundColor: string = 'transparent'): Promise<FormData> {
    function factor(dpi: number = 600): number {
        // DPI is around 96 when scale is 1, and 300 DPI is around 3
        return Math.floor(dpi / 96);
    }

    return new Promise((resolve, reject) => {
        // TODO: Pass in the ref and scale as parameters
        html2canvas(elementRef.nativeElement, {
            scale: scale * factor(dpi), // DPI is around 96 when scale is 1, and 300 DPI is around 3
            backgroundColor: backgroundColor
        })
            .then((canvas: any) => {
                canvas.toBlob(async (blob: Blob | null) => {
                    if (!blob /*|| cardFace === undefined || cardFace?.cardFaceThumbnailFilePath === undefined*/) {
                        reject(new Error('Canvas blob is null'));
                        return;
                    }

                    let formData = new FormData();

                    formData.append('formFile', blob);
                    // console.log(cardFaceFileName);
                    // console.log(`Form data: ${JSON.stringify(formData.values)}`);

                    resolve(formData);
                }, 'image/png', 0.8);
            })
            .catch((error: any) => {
                reject(error);
            });
    });
}

// https://www.npmjs.com/package/image-blob-reduce


export async function generateResizedImagesAtQualities(
    image: FormData,
    key: string = 'formFile',
    scales: number[] = [0.8, 0.6, 0.4, 0.2]
): Promise<FormData> {
    let images: FormData = new FormData();
    let reduce: ImageBlobReduce.ImageBlobReduce = ImageBlobReduce();

    interface ExtendedResizeOptions extends ResizeOptions {
        quality?: number;
    }

    reduce.before('_create_blob', async (env: any) => {
        env.opts.quality = env.opts.quality ?? 0.8;
        return env;
    });

    let blob: Blob = image.get(key) as Blob;

    if (!blob) throw new Error('No file blob found in form data');

    images.append('formFiles', blob, `image_${1.0}.jpg`);

    await Promise.all(scales.map(async (scale: number) => {
        let opts: ExtendedResizeOptions = { quality: scale };
        let reducedBlob: Blob = await reduce.toBlob(blob, opts);
        images.append('formFiles', reducedBlob, `image_${scale}.jpg`);
    }));

    return images;
}

// TODO: Normalise function 
// https://www.statology.org/normalize-data-between-0-and-1/
export function normalize(value: number, min: number, max: number): number {
    return (value - min) / (max - min);
}

// TODO: Maybe make it dynamic and calculate the LOD instead
// Calculate how many levels of detail there are, normalise it between 0 - 1
// Then use that to compare to the scale
export function getLodIndex(scale: number, lodsAmt: number = 5): number {
    if (scale > 1) scale = normalize(scale, 0, 1);
    return Math.floor(clamp((scale * lodsAmt) - 1, 0, lodsAmt - 1)); // Because the LODs start with 0
}

// CHECKME: Would this work, the FileMetadataApiService being passed through part
export function createFilesMetadata$(fileMetadataApiService: FileMetadataApiService, volumePath: string, fileNames: string[], fileMetadataStatus: FileMetadataStatus): Observable<FileMetadata[] | undefined> {
    let filesMetadata: FileMetadata[] = [];

    fileNames.forEach((fileName) => {
        let fileMetadata: FileMetadata = {
            fileMetadataId: '0',
            volumePath: volumePath,
            fileName: fileName,
            creationDate: new Date(),
            fileMetadataStatus: fileMetadataStatus
        };

        filesMetadata.push(fileMetadata);
    });

    return fileMetadataApiService.createFilesMetadata$(filesMetadata).pipe(
        tap(result => {
            if (result === undefined) {
                throw new Error("File metadata wasn't able to be created");
            }
            console.log(`Created file metadata: ${JSON.stringify(result, null, 2)}`);
        })
    );
}

export function createFileMetadata$(fileMetadataApiService: FileMetadataApiService, volumePath: string, fileName: string, fileMetadataStatus: FileMetadataStatus): Observable<FileMetadata | undefined> {
    let fileMetadata: FileMetadata = {
        fileMetadataId: '0',
        volumePath: volumePath,
        fileName: fileName,
        creationDate: new Date(),
        fileMetadataStatus: fileMetadataStatus
    };

    return fileMetadataApiService.createFileMetadata$(fileMetadata).pipe(
        tap(result => {
            if (result === undefined) {
                throw new Error("File metadata wasn't able to be created");
            }
            console.log(`Created file metadata: ${JSON.stringify(result, null, 2)}`);
        })
    );
}

export function duplicateFile$(fileUploadApiService: FileUploadApiService, fileMetadataApiService: FileMetadataApiService, fileMetadata: FileMetadata, fileType: string, filePath: string, fileMetadataStatus: FileMetadataStatus = FileMetadataStatus.Pending): Observable<FileMetadata | undefined> {
    return fileUploadApiService.replaceFilePath$(fileMetadata.fileName, fileType).pipe(
        switchMap((result: { id: string | undefined }) => {
            if (!result.id) return of(undefined);
            return createFileMetadata$(fileMetadataApiService, filePath, result.id, fileMetadataStatus);
        })
    );
}

export function duplicateFiles$(fileUploadApiService: FileUploadApiService, fileMetadataApiService: FileMetadataApiService, filesMetadata: FileMetadata[], fileType: string, filePath: string, fileMetadataStatus: FileMetadataStatus = FileMetadataStatus.Pending) {
    let fileNames: string[] = filesMetadata.map((fm: FileMetadata) => (fm.fileName));

    return fileUploadApiService.replaceFilePaths$(fileNames, fileType).pipe(
        switchMap((result: string[]) => {
            return createFilesMetadata$(fileMetadataApiService, filePath, result, fileMetadataStatus);
        })
    )
}

export async function unzipImages(result: Blob): Promise<HTMLImageElement[] | undefined> {
    return new Promise(async (resolve) => {
        try {
            let zip: JSZip = await JSZip.loadAsync(result);
            let files: JSZip.JSZipObject[] = Object.values(zip.files);

            console.log(`Zip files: ${JSON.stringify(files, null, 2)})`);

            let images: HTMLImageElement[] = [];

            for (let file of files) {
                if (file.dir) {
                    throw new Error("Zip contains directories, expected only files");
                }

                let blob: Blob = await file.async("blob");
                let image: HTMLImageElement = new Image();
                let objectUrl: string = URL.createObjectURL(blob);

                // Await image load or error
                await new Promise<void>((imageResolve, imageReject) => {
                    image.onload = () => {
                        imageResolve();
                    };
                    image.onerror = () => {
                        URL.revokeObjectURL(objectUrl);
                        imageReject(new Error(`Failed to load image ${file.name}`));
                    };
                    image.src = objectUrl;
                });

                images.push(image);
            }

            resolve(images);
        } catch (error) {
            console.error("Error while processing zip file images", error);
            resolve(undefined);
        }
    }
    )
}