import { InjectionToken } from "@angular/core";

export const CLOSE_IMAGE_EDITOR_TOKEN = new InjectionToken<(showImageEditor: boolean) => void>(
    'CLOSE_IMAGE_EDITOR_TOKEN'
);

export const CROPPED_IMAGE_TOKEN = new InjectionToken<(croppedImage: string) => void>(
    'CROPPED_IMAGE_TOKEN'
);

export const RTE_HTML_CONTENT = new InjectionToken<(htmlContent: string) => void>(
    'RTE_HTML_CONTENT'
);