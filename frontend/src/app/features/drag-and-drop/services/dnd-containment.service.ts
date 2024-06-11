import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DndContainmentService {

  constructor() { }

  // TODO: This should probably be used with retrieving data from the backend
  getContaineesFromContainer(container: any): any[] {
    return container && container.children ? [...container.children] : [];
  }

  // TODO: This should probably be modified to work with retrieving data from the backend
  getContainerFromContainee(containee: any, container: any[]): any {
    if (container.find(container => container.has(containee)) == undefined)
      return null;

    return container;
  }

  // TODO: This should probably be used with retrieving data from the backend
  getContainerFromContainees(): any {

  }
}
