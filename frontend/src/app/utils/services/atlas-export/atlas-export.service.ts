import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { addMetadataToPng, areDimensionsHigherThanZero, clamp, Coordinates, Dimensions, download, normalize } from '../../utils';

export interface AtlasTextureImage {
  coordinates: Coordinates;
  dimensions: Dimensions;
  element: HTMLImageElement;
}

export function guillotine(images: HTMLImageElement[], margin: number = 0.5): {
  atlasTextureImages: AtlasTextureImage[],
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
    static root: Node;

    // NOTE: We want to keep it 0-1 https://www.cyanilux.com/tutorials/sprite-local-uv/
    coordinates: Coordinates = {
      x: 0,
      y: 0
    };

    // CHECKME: Do we also add coordinates here?
    constructor(id?: string, dimensions?: Dimensions, parent?: Node | null, left?: Node | null, right?: Node | null) {
      this.id = id ?? uuidv4();

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

  function cut(parent: Node, side: 'w' | 'h', offset: number): 'w' | 'h' | undefined {
    let origin: Coordinates = parent.coordinates; 

    // Coordinates are relative to the parent

    if (side == 'w' && offset <= parent.dimensions.width) {
      // We cut first at Node.root here - starts at 0, 0
      parent.left = new Node(uuidv4(), { width: offset, height: parent.dimensions.height }, parent);
      parent.left.coordinates = { x: origin.x, y: origin.y };  // Node.root.left starts at 0, 0

      parent.right = new Node(uuidv4(), { width: parent.dimensions.width - offset, height: parent.dimensions.height }, parent);
      parent.right.coordinates = { x: origin.x + offset, y: origin.y }; // Node.root.right starts at where it needs to be to fill the rest of the dimensions of Node.root

      return side;
    }

    // LEFT: BOTTOM, RIGHT: TOP?
    if (side == 'h' && offset <= parent.dimensions.height) {
      // We cut first at Node.root.left - starts at 0, 0
      parent.left = new Node(uuidv4(), { width: parent.dimensions.width, height: parent.dimensions.height - offset }, parent);
      parent.left.coordinates = { x: origin.x, y: origin.y + offset }; // Node.root.left.left starts at 0, where its rightcounterpart ends

      parent.right = new Node(uuidv4(), { width: parent.dimensions.width, height: offset }, parent);
      parent.right.coordinates = { x: origin.x, y: origin.y}; // Node.root.left.right starts at 0, 0

      return side;
    }

    console.error(`For side ${side}: An attempt has been made to create an invalid cut with an offset: ${offset} and parent dimensions: ${JSON.stringify(parent.dimensions)}`);
    return;
  }

  // NOTE: Attempts to place piece in existing node
  function canPush(piece: Node): boolean {
    function splitNode(node: Node): boolean {
      cut(node, 'w', piece.dimensions.width);

      if (!node.left) throw new Error("Guillotine - node.left: When you cut a node, there should be a left and right");

      cut(node.left, 'h', piece.dimensions.height);

      if (!node.left.right) throw new Error("Guillotine - node.left.right: When you cut a node, there should be a left and right");

      return true;
    }

    function getPiece(node: Node): Node {
      if (!splitNode(node)) throw new Error("Could not split node: When you cut a node, there should be a left and right");

      if (!node || !node.left || !node.left.right) throw new Error("Guillotine - node.left.right: When you cut a node, there should be a left and right");

      node.left.right.isPiece = true;
      return node.left.right;
    }

    // Essentially we need to find a fit node to place our piece inside
    function findFitNode(node: Node): Node | null {
      // So there's three possibilities: the node already fits the piece and isn't a piece itself
      if (!node.isPiece && !isCut(node) && node.dimensions.width >= piece.dimensions.width && node.dimensions.height >= piece.dimensions.height) return node;

      // The node has a left and or right node next to it that matches the first condition
      if (isCut(node)) {
        if (!node.left || !node.right) throw new Error("Guillotine: When you cut a node, there should be a left and right");

        let fit: Node | null = findFitNode(node.left);
        return (fit) ? fit : findFitNode(node.right);
      }

      // Or there's no fit node
      return null;
    }

    function setResizedRoot(): boolean {
      if (!Node.root.left || !Node.root.right) throw new Error("The root node should always have a left and right leaf. We know that there's no occupation for Node.root.right because we always make a piece the Node.root.left.right. So we need to make Node.root.right bigger.");

      let fitDimensionGap: Dimensions = {
        width: piece.dimensions.width - Node.root.right.dimensions.width,
        height: piece.dimensions.height - Node.root.right.dimensions.height
      };

      // BASE CASE: If there's no difference in dimension size, there's no need for the root to grow
      // If the root right's dimension is big enough to fit the piece, then don't expand it
      // Checks to see if the piece is smaller than the root's right
      if (fitDimensionGap.width <= 0 && fitDimensionGap.height <= 0) return false;

      // This is the amount of space needed then to fit the piece in
      let compensatedRootRightDimensions: Dimensions = {
        width: Node.root.right.dimensions.width + fitDimensionGap.width,
        height: Node.root.right.dimensions.height + fitDimensionGap.height
      }

      // CHECKME: Should be this, so we take the Node.root.left's dimensions + additional dimensions to what's our Node.root.right essentially
      // We're replacing the Node.root.right's original dimensions
      let resizedRootDimensions: Dimensions = {
        width: (fitDimensionGap.width > 0) ? Node.root.left.dimensions.width + compensatedRootRightDimensions.width : Node.root.dimensions.width,
        height: (fitDimensionGap.height > 0) ? Node.root.left.dimensions.height + compensatedRootRightDimensions.height : Node.root.dimensions.height
      }

      // CHECKME: Is the fallback value correct?
      let resizedRootRightDimensions: Dimensions = {
        width: (fitDimensionGap.width > 0) ? compensatedRootRightDimensions.width : Node.root.right.dimensions.width,
        height: (fitDimensionGap.height > 0) ? compensatedRootRightDimensions.height : Node.root.right.dimensions.height
      }

      /*********************************** Should be right logic **************************************** */
      let resizedRoot: Node = new Node(uuidv4(), resizedRootDimensions, null, Node.root);

      resizedRoot.right = new Node(uuidv4(), resizedRootRightDimensions, resizedRoot);

      if (!Node.root.right) throw new Error("The node should always have a right leaf");

      // CHECKME: I think it should be like this, because the right node of the original root never gets tampered with. Node.root.left gets splits
      resizedRoot.right.coordinates = Node.root.right.coordinates;

      Node.root.parent = resizedRoot;
      Node.root = resizedRoot;

      return true;
    }

    // So we want to find out whether the root node's already big enough, essentially if it isn't then we do stuff from there
    let node: Node | null = findFitNode(Node.root);
    if (node) { // TODO: Potentially have user choice in how to cut? 
      let leaf: Node = getPiece(node);
      leaf.id = piece.id; // We need to do this because we grab the specific pieces by their shared IDs

      return true;
    }

    // CASE: Node.root.right will not be split
    if (!setResizedRoot()) throw new Error("This is impossible considering Node.root.right hasn't been split, that means the original Node.root couldn't fit the piece");
    return canPush(piece);
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
    width: Math.max(...pieces.map(node => node.dimensions.width)),
    height: Math.max(...pieces.map(node => node.dimensions.height))
  }

  Node.root = new Node(uuidv4(), canvasDimensions);

  // https://github.com/mariowise/2d-guillotine-cutter/blob/master/js/tree.js
  pieces.forEach((piece: Node) => {
    canPush(piece);
  });

  let atlasTextureImages: AtlasTextureImage[] =[];

  Node.nodes.forEach((node: Node) => {
    if (!shouldDraw(node)) return;

    let idx: number = images.findIndex(i => i.src === node.id);

    if (idx > -1) atlasTextureImages.push({
      coordinates: node.coordinates,
      dimensions: node.dimensions,
      element: images[idx]
    });
  });
 
  return {
    atlasTextureImages,
    canvasDimensions: Node.root.dimensions // ASSUMPTION: We always have the root node be resized properly
  }
}

@Injectable({
  providedIn: 'root'
})
export class AtlasExportService {
  constructor() { }

  atlasExport(images: HTMLImageElement[], margin: number = 0.5, fileName: string = 'atlas'): void {
    let final: {
      atlasTextureImages: AtlasTextureImage[];
      canvasDimensions: Dimensions;
    } = guillotine(images, margin);

    console.log(`Atlas export guillotine results: ${JSON.stringify(final, null, 2)}`);

    let canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width = final.canvasDimensions.width;
    canvas.height = final.canvasDimensions.height;

    let ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
    
    if (!ctx) throw new Error("No Canvas Rendering Context");
    
    final.atlasTextureImages.forEach((value: AtlasTextureImage) => {
      if (value.element.complete) ctx.drawImage(value.element, value.coordinates.x, value.coordinates.y); // NOTE: This should be fine since all roots always start at 0, 0, so no matter what, all child nodes (including grandchildren) will always be absolutely positioned
    });

    console.log('Atlas export canvas size', canvas.width, canvas.height);
  
    canvas.toBlob(async (blob: Blob | null) => {
      if (!blob) throw new Error("Atlas export canvas can't be converted to a blob.");

      download(fileName, 'png', URL.createObjectURL(addMetadataToPng(await blob.arrayBuffer(), JSON.stringify(final.atlasTextureImages))));
    });
  }
}

