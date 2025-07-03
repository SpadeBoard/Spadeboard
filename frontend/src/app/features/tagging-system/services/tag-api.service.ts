import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable, of } from 'rxjs';
import { Tag } from '../models/tag';
@Injectable({
  providedIn: 'root'
})
export class TagApiService {
  // TODO: Make a giant interface to use for all the CRUD operations then have the API services inherit from it
  private http: HttpClient = inject(HttpClient);
  
  // TODO: Replace with actual API url from the config
  private apiUrl: string = `${environment.hostServerUrl}/api/Tags`;

  constructor() { }

  getTags$(): Observable<Tag[] | undefined> {
    return this.http.get<Tag[]>(this.apiUrl);
  }

  getTag$(id: string): Observable<Tag | undefined> {
    return this.http.get<Tag>(`${this.apiUrl}/${id}`);
  }

  createTag$(tag: Tag): Observable<Tag | undefined> {
    if (!tag) {
      return of(undefined);
    }
    // TODO: Separate properties
    return this.http.post<Tag>(this.apiUrl, tag);
  }

  updateTag$(tag: Tag): Observable<void | undefined> {
    return this.http.put<void>(`${this.apiUrl}/${tag.tagId}`, tag);
  }

  deleteTag$(id: string): Observable<void | undefined> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getTagNames$(): Observable<string[] | undefined> {
    return this.http.get<string[]>(`${this.apiUrl}/tag-names`);
  }

  getTagByTagName$(tagName: string): Observable<Tag | undefined> {
    return this.http.get<Tag | undefined>(`${this.apiUrl}/tag-name/${encodeURIComponent(tagName)}`);
  }

  getTagNamesByCardId$(cardId: string): Observable<string[] | undefined> {
    return this.http.get<string[]>(`${this.apiUrl}/tag-names-by-card-id/${cardId}`);
  }

  // TODO: Make backend function for grabbing all tag names as a string array

  // TODO: Make a TagPerCard bridge table
  // In CardEditorCardDto, we want an array of tags per tag
  // When updating tag editor tag dto, remember to delete the tag per tag bridge table too

  // Orphaned tags, every couple days, if there's more than 1000 orphaned tags, start deleting them
  // Possibly: Only keep orphans if they pass a spellcheck. Reason for this: If someone makes a tag, then realizes they make a typo, they'll probably edit the tag (functionally making a new tag?), and we don't necessarily want to keep the typo in our system as a suggestion for other users.
  // When editing a tag: Do we create a new tag in the DB? Or do we allow edits to alter the original tag?
  // Editing existing tag in DB means that (potentially) everyone else who uses that tag will be affected by the change.
  // We *could* make so that when a user edits a tag, it alters the tags for every tag *that user* has authority on. Then we'd just have 2 tags in our DB, which is no big deal.
}
