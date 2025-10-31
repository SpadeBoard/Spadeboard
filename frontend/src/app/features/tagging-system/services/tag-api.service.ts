import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable, of } from 'rxjs';
import { Tag } from '../models/tag';
@Injectable({
  providedIn: 'root'
})
export class TagApiService {
  // TODO: Make a giant interface to use for all the CRUD operations then have the API services inherit from it
  private readonly http: HttpClient = inject(HttpClient);
  
  // TODO: Replace with actual API url from the config
  private readonly apiUrl: string = `${environment.hostServerUrl}/api/Tags`;

  constructor() { }

  public getTags$(): Observable<Tag[] | undefined> {
    return this.http.get<Tag[]>(this.apiUrl);
  }

  public getTag$(id: string): Observable<Tag | undefined> {
    return this.http.get<Tag>(`${this.apiUrl}/${id}`);
  }

  public createTag$(tag: Tag): Observable<Tag | undefined> {
    if (!tag) {
      return of(undefined);
    }
    // TODO: Separate properties
    return this.http.post<Tag>(this.apiUrl, tag);
  }

  public updateTag$(tag: Tag): Observable<void | undefined> {
    return this.http.put<void>(`${this.apiUrl}/${tag.tagId}`, tag);
  }

  public deleteTag$(id: string): Observable<void | undefined> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  public deleteByTagNamesAndCardId$(cardId: string, tagNames: string[]): Observable<void | undefined> {
    let params: HttpParams = new HttpParams();
    tagNames.forEach(tag => params = params.append('tagNames', tag));
    return this.http.delete<void>(`${this.apiUrl}/tag-names/${cardId}`, { params });
  }

  public getTagNames$(): Observable<string[] | undefined> {
    return this.http.get<string[]>(`${this.apiUrl}/tag-names`);
  }

  public getTagByTagName$(tagName: string): Observable<Tag | undefined> {
    return this.http.get<Tag | undefined>(`${this.apiUrl}/tag-name/${encodeURIComponent(tagName)}`);
  }

  public getTagNamesByCardId$(cardId: string): Observable<string[] | undefined> {
    return this.http.get<string[]>(`${this.apiUrl}/tag-names-by-card-id/${cardId}`);
  }

  // TODO: Make backend function for grabbing all tag names as a string array

  // Orphaned tags, every couple days, if there's more than 1000 orphaned tags, start deleting them
  // Possibly: Only keep orphans if they pass a spellcheck. Reason for this: If someone makes a tag, then realizes they make a typo, they'll probably edit the tag (functionally making a new tag?), and we don't necessarily want to keep the typo in our system as a suggestion for other users.
  // When editing a tag: Do we create a new tag in the DB? Or do we allow edits to alter the original tag?
  // Editing existing tag in DB means that (potentially) everyone else who uses that tag will be affected by the change.
  // We *could* make so that when a user edits a tag, it alters the tags for every tag *that user* has authority on. Then we'd just have 2 tags in our DB, which is no big deal.
}
