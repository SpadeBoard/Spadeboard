import { ApplicationRef, ComponentRef } from "@angular/core";

export function openModal(
    appRef: ApplicationRef,
    instance: {
        host: HTMLElement,
        ref: ComponentRef<any>
    }
): void {
    let { host, ref } = instance;

    appRef.attachView(ref.hostView);
    document.body.appendChild(host);
}

export function closeModal(
    appRef: ApplicationRef, 
    instance: {
        host: HTMLElement,
        ref: ComponentRef<any>
    },
    shouldDestroyRef: boolean = true
): void {
    let { host, ref } = instance;

    document.body.removeChild(host);
    appRef.detachView(ref.hostView);
    if (shouldDestroyRef) ref.destroy();
}