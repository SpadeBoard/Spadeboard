import { Component, ElementRef, input, InputSignal, model, ModelSignal, output, OutputEmitterRef } from '@angular/core';
import { TagData } from '@yaireo/tagify';
import { Tag } from '../../../tagging-system/models/tag';
import { CardEditorOperationsComponent } from '../../card-editor/components/operations/card-editor-operations.component';
import { CardEditorFaceComponent } from '../../card-editor-face/components/core/card-editor-face.component';
import { CardEditorChangeFaceComponent } from '../../card-editor/components/change-face/card-editor-change-face.component';
import { CardEditorTagsComponent } from '../../card-editor/components/tags/card-editor-tags.component';
import { BehaviorSubject } from 'rxjs';
import { Style } from '../../../style/models/style';
import { Coordinates, Dimensions } from '../../../../utils/utils';

@Component({
  selector: 'app-card-editor-preview',
  imports: [
    CardEditorOperationsComponent,
    CardEditorChangeFaceComponent,
    CardEditorFaceComponent,
    CardEditorTagsComponent],
  templateUrl: './card-editor-preview.component.html',
  styleUrl: './card-editor-preview.component.scss'
})
// TODO: Just remove this
export class CardEditorPreviewComponent {
  public readonly $editable: InputSignal<boolean> = input<boolean>(true);
  
  public readonly $whitelist: InputSignal<BehaviorSubject<string[]>> = input<BehaviorSubject<string[]>>(new BehaviorSubject<string[]>([]));

  public readonly $isFlipped: InputSignal<boolean> = input.required<boolean>();

  public readonly $activateFlip: OutputEmitterRef<void> = output<void>();

  public readonly $hasCreated: InputSignal<boolean> = input<boolean>(false);

  public readonly $cardName: InputSignal<string> = input<string>('');

  public readonly $cardEditorFaceStyle: InputSignal<Omit<Style, 'styleId'>> = input.required<Omit<Style, 'styleId'>>();

  public readonly $cardEditorPreviewTags: ModelSignal<TagData[]> = model<TagData[]>([]);

  public readonly $changeCardName: OutputEmitterRef<string> = output<string>();

  public readonly $handleCardCreate: OutputEmitterRef<void> = output<void>();

  public readonly $handleCardSave: OutputEmitterRef<void> = output<void>();

  public readonly $tag: OutputEmitterRef<{
    operation: 'create' | 'update' | 'delete',
    tag: Tag,
    idx?: number
  }> = output<{
    operation: 'create' | 'update' | 'delete',
    tag: Tag,
    idx?: number
  }>();

  public readonly $cardEditorFace: OutputEmitterRef<ElementRef> = output<ElementRef>();

  public readonly $enableElement: OutputEmitterRef<{
    cardFaceElementId: string,
    type: string
  }> = output<{
    cardFaceElementId: string,
    type: string
  }>();

  public readonly $setElementAttributes: OutputEmitterRef<string> = output<string>();

  public readonly $setElementDimensions: OutputEmitterRef<Dimensions> = output<Dimensions>();

  public readonly $setElementPosition: OutputEmitterRef<Coordinates> = output<Coordinates>();

  public readonly $enableImageEditor: OutputEmitterRef<string> = output<string>();

  public readonly $toggleContextMenu: OutputEmitterRef<{
    event: MouseEvent,
    menu: 'Preview' | 'Templates'
  }>
    = output<{
      event: MouseEvent,
      menu: 'Preview' | 'Templates'
    }>();

  public readonly $deletedCardFaceElementPerCardFace: OutputEmitterRef<string> = output<string>();
  
  public readonly $cardFaceElementId: InputSignal<string> = input<string>('');
  
  public readonly $cardFaceElementRts: InputSignal<Map<string, string>> = input<Map<string, string>>(new Map<string, string>());

  public readonly $cardFaceElementImages: InputSignal<Map<string, string>> = input<Map<string, string>>(new Map<string, string>());

  public readonly $cardFaceElementIdentifiers: InputSignal<{
    cardFaceElementId: string,
    cardFaceElementType: 'Rt' | 'Image',
    cardFaceElementZIndex: string,
    cardFaceElementPerCardFaceId: string // TODO: Take this out
  }[]> = input<{
    cardFaceElementId: string,
    cardFaceElementType: 'Rt' | 'Image',
    cardFaceElementZIndex: string,
    cardFaceElementPerCardFaceId: string // TODO: Take this out
  }[]>([]);

  public readonly $cardFaceElementPositions: InputSignal<Map<string, Coordinates>> = input<Map<string, Coordinates>>(new Map<string, Coordinates>());

  public readonly $cardFaceElementDimensions: InputSignal<Map<string, Dimensions>> = input<Map<string, Dimensions>>(new Map<string, Dimensions>());

  constructor() { }

  protected changeCardName(event: Event): void {
    let value: string = (event.target as HTMLInputElement).value;
    this.$changeCardName.emit(value);
  }

  protected handleCardCreate(): void {
    this.$handleCardCreate.emit();
  }

  protected handleCardSave(): void {
    this.$handleCardSave.emit();
  }

  protected activateFlip(): void {
    this.$activateFlip.emit();
  }

  protected tag(tag: {
    operation: 'create' | 'update' | 'delete',
    tag: Tag,
    idx?: number
  }): void {
    this.$tag.emit(tag);
  }

  public setCardEditorFace(cardEditorFace: ElementRef): void {
    this.$cardEditorFace.emit(cardEditorFace)
  }

  protected enableElement(element: { cardFaceElementId: string, type: string }): void {
    this.$enableElement.emit(element);
  }

  protected setElementAttributes(cardFaceElementId: string): void {
    this.$setElementAttributes.emit(cardFaceElementId);
  }

  protected setElementPosition(coordinates: Coordinates): void {
    this.$setElementPosition.emit(coordinates);
  }

  protected setElementDimensions(dimensions: Dimensions): void {
    this.$setElementDimensions.emit(dimensions);
  }

  protected enableImageEditor(cardFaceElementId: string): void {
    this.$enableImageEditor.emit(cardFaceElementId);
  }

  protected toggleContextMenu(info: { event: MouseEvent, menu: 'Preview' | 'Templates' }): void {
    this.$toggleContextMenu.emit(info);
  }

  protected deletedCardFaceElementPerCardFace(id: string): void {
    this.$deletedCardFaceElementPerCardFace.emit(id);
  }
}
