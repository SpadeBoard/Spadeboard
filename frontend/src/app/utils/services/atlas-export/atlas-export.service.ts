import { Injectable } from '@angular/core';
import { areDimensionsHigherThanZero, clamp, Coordinates, Dimensions, download, getMidpoint, normalize } from '../../utils';

export function guillotine(images: HTMLImageElement[], margin: number = 0.5): {
  imagePiecesWithCoordinates: Map<Coordinates, HTMLImageElement>,
  canvasDimensions: Dimensions
} {
  class Node {
    id: string;

    dimensions: Dimensions = {
      width: 0,
      height: 0
    };

    parent: Node | null;
    left: Node | null;
    right: Node | null;
    isPiece: boolean = false;

    static nodes: Node[] = [];

    // NOTE: We want to keep it 0-1 https://www.cyanilux.com/tutorials/sprite-local-uv/
    coordinates: Coordinates = {
      x: 0,
      y: 0
    };

    // CHECKME: Do we also add coordinates here?
    constructor(id: string, dimensions?: Dimensions, parent?: Node | null, left?: Node | null, right?: Node | null) {
      this.id = id;

      this.dimensions = dimensions ?? {
        width: 0,
        height: 0
      }

      this.parent = parent ?? null;
      this.left = left ?? null;
      this.right = right ?? null;
    
      Node.nodes.push(this);
    }
  }

  function isCut(node: Node): boolean {
    return (node.left && node.right) ? true : false;
  }

  function uncut(node: Node): void {
    node.left = null;
    node.right = null;
  }

  function cut(id: string, parent: Node, side: 'w' | 'h', offset: number): 'w' | 'h' | undefined {
    let centre: Coordinates = parent.coordinates;

    if (side == 'w' && offset <= parent.dimensions.width) {
      parent.left = new Node(id, { width: offset, height: parent.dimensions.height }, parent);
      parent.right = new Node(id, { width: parent.dimensions.width - offset, height: parent.dimensions.height }, parent);

      /*
      this.left.draw( { x: o.x - this.w/2 + this.left.w/2, y: o.y })
      this.right.draw({ x: o.x - this.w/2 + this.left.w + this.right.w/2, y: o.y })
      */

      let halfParentWidth: number = parent.dimensions.width / 2;
      let halfLeftWidth: number = parent.left.dimensions.width / 2;
      let halfRightWidth: number = parent.right.dimensions.width / 2;

      parent.left.coordinates = { x: centre.x - halfParentWidth + halfLeftWidth, y: centre.y };
      parent.right.coordinates = { x: centre.x - halfParentWidth + parent.left.dimensions.width + halfRightWidth, y: centre.y };

      return side;
    }

    if (side == 'h' && offset <= parent.dimensions.height) {
      parent.left = new Node(id, { width: parent.dimensions.width, height: parent.dimensions.height - offset }, parent);
      /*
      this.left.draw( { x: o.x, y: o.y - this.h/2 + this.right.h + this.left.h/2 })
      this.right.draw({ x: o.x, y: o.y - this.h/2 + this.right.h/2 })
      */

      parent.right = new Node(id, { width: parent.dimensions.width, height: offset }, parent);

      let halfParentHeight: number = parent.dimensions.height / 2;
      let halfLeftHeight: number = parent.left.dimensions.height / 2;
      let halfRightHeight: number = parent.right.dimensions.height / 2;

      parent.left.coordinates = { x: centre.x, y: centre.y - halfParentHeight + parent.right.dimensions.height + halfLeftHeight };
      parent.right.coordinates = { x: centre.x, y: centre.y - halfParentHeight + halfRightHeight };

      return side;
    }

    console.error("An attempt has been made to create an invalid cut");
    return;
  }

  // NOTE: Attempts to place piece in existing node
  function canPush(piece: Node, margin: number): boolean {
    for (let node of Node.nodes) {
      // For expansion of the canvas if necessary
      if (node.dimensions.width < piece.dimensions.width || node.dimensions.height < piece.dimensions.height) {
        /*node.dimensions = {
          width: (node.dimensions.width + piece.dimensions.width)/margin,
          height: (node.dimensions.height + piece.dimensions.height)/margin
        }*/

        console.warn(`Node: ${JSON.stringify(node.dimensions, null, 2)} is smaller than piece: ${JSON.stringify(piece.dimensions, null, 2)}`);
        continue;
      }

      if (!node.isPiece && !isCut(node)) {
        // TODO: Potentially have user choice in how to cut? 
        cut(piece.id, node, 'w', piece.dimensions.width/* / margin*/);

        if (!node.left) throw new Error("Guillotine - node.left: When you cut a node, there should be a left and right");

        cut(piece.id, node.left, 'h', piece.dimensions.height/* / margin*/);

        if (!node.left.right) throw new Error("Guillotine - node.left.right: When you cut a node, there should be a left and right");

        node.left.right.isPiece = true;
        return true;
      }
    }

    return false;
  }

  function shouldDraw(node: Node): boolean {
    return (!isCut(node) && areDimensionsHigherThanZero(node.dimensions) && node.isPiece);
  }

  margin = clamp(normalize(margin, 0.5, 1), 0.5, 1);

  let pieces: Node[] = images.map((image: HTMLImageElement) => {
    return new Node(
      image.src,
      {
        width: image.width,
        height: image.height
      }
    );
  });

  // We want to do this from the start because the canvas might already be big enough to store everything
  let canvasDimensions: Dimensions = {
    width: Math.max(...pieces.map(node => node.dimensions.width)) / margin,
    height: Math.max(...pieces.map(node => node.dimensions.height)) / margin
  }

  let root: Node = new Node('root', canvasDimensions);
  root.coordinates = { x: canvasDimensions.width / 2, y: canvasDimensions.height / 2 };

  // https://github.com/mariowise/2d-guillotine-cutter/blob/master/js/tree.js
  pieces.forEach((piece: Node) => {
    canPush(piece, margin);
  });

  // If should draw, then add coordinates to map and HTML Image Element based on ID

  let imagePiecesWithCoordinates: Map<Coordinates, HTMLImageElement> = new Map();

  Node.nodes.forEach((node: Node) => {
    if (!shouldDraw(node)) return;

    let idx: number = images.findIndex(i => i.src === node.id);

    if (idx > -1) imagePiecesWithCoordinates.set(node.coordinates, images[idx]);
  });

  return {
    imagePiecesWithCoordinates,
    canvasDimensions: {
      width: Math.max(...Node.nodes.map(node => /*node.coordinates.x + */node.dimensions.width))/* / margin*/,
      height: Math.max(...Node.nodes.map(node => /*node.coordinates.y + */node.dimensions.height))/* / margin*/
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class AtlasExportService {
  constructor() { }

  // FUNCTION: We grab all files of that type passing in the fileUploadApiService and the file names

  // The atlas should range from 0 - 1.
  // Get the dimensions of the images
  // Get the size of the padding based on that: 80/100 = x/y
  // Then determine the size of the canvas

  atlasExport(images: HTMLImageElement[], margin: number = 0.5, fileName: string = 'atlas'): void {
    let final: {
      imagePiecesWithCoordinates: Map<Coordinates, HTMLImageElement>;
      canvasDimensions: Dimensions;
    } = guillotine(images, margin);

    console.log(`Atlas export guillotine results: ${JSON.stringify(final, null, 2)}`);

    let canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width = final.canvasDimensions.width;
    canvas.height = final.canvasDimensions.height;

    let ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
    final.imagePiecesWithCoordinates.forEach((value: HTMLImageElement, key: Coordinates, map: Map<Coordinates, HTMLImageElement>) => {
      if (ctx && value.complete) ctx.drawImage(value, key.x /* + (value.width/2)*/, key.y /* + (value.height/2)*/); // CHECKME: The keys are 0, 0, so would we need to make sure it's shifted because the root node starts smack dab in the middle of the canvas?
    });

    console.log('Atlas export canvas size', canvas.width, canvas.height);

    canvas.toBlob((blob: Blob | null) => {
      if (!blob) throw new Error("Atlas export canvas can't be converted to a blob.");

      download(fileName, 'png', URL.createObjectURL(blob));
    });
  }

  /*
  FUNCTION:  Pass in the parameters, 
    Question is, do we want to pass in the list of blobs, or the list of images
    Max amount of elements per row there are - https://www.cyanilux.com/tutorials/sprite-local-uv/
    Margin as a number

    The atlas should range from 0 - 1.
  
    Canvas has alpha so no background images
    1 dimensional array: so we pass in the images =  [0, 1, 2, 3, 4, 5] == { {0, 1, 2}, {3, 4, 5} }

    To get a 1 dimensional array from a 2d matrix: it would be z = x * y. So to work backwards, we would get: x = z/y.
    // z: 1D array
    // y: Max amount of elements in one row - which determines the size of the column
    // x: How many rows there actually are

    // Index: y * rows + x;

    canvas width = max width out of all three widths
    canvas height = max height out of all elements in row (a) + max height out of all elements in row (b) + max height out of all elements in row (c) - keep in mind padding

    // https://cplusplus.com/forum/general/282765/
    // number of columns * desired row + desired column

    let potentialCanvasWidths: number[];
    let totalCanvasHeight: number;
    
    for (x: int = 0; x < rows; x++) {  //rows
      let potentialCanvasWidth: number = 0; // Add all the widths together to then add to potentialCanvasWidths

      let currentRowHeight: number = 0;

      for (y: int = 0; y < columns; y++) {   //columns
        index = y * rows + x;
        image = arr_of_images[index];

        Get the dimensions of the image
        potentialCanvasWidth += image.dimensions.width/normalize(margin, 0, 1);

        let height: number = image.dimensions.height/normalize(margin, 0, 1);
        
        if (currentRowHeight < height) currentRowHeight = height;
      }

      potentialCanvasWidths.push(potentialCanvasWidth);
      potentialCanvasWidth = 0;

      totalCanvasHeight += currentRowHeight;
    }

    let totalCanvasWidth: number = Math.max(potentialCanvasWidths);

    let canvas = document.getElementById("my-house");
    canvas.width = totalCanvasWidth;
    canvas.height = totalCanvasHeight;
    
    let ctx = canvas.getContext("2d");

    ctx.drawImage(image, x, y);

    Normalise after everything - maybe?
  */
}

