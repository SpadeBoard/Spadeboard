import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { areDimensionsHigherThanZero, clamp, Coordinates, Dimensions, download, normalize } from '../../utils';

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
    let centre: Coordinates = parent.coordinates;

    if (side == 'w' && offset <= parent.dimensions.width) {
      parent.left = new Node(uuidv4(), { width: offset, height: parent.dimensions.height }, parent);
      parent.right = new Node(uuidv4(), { width: parent.dimensions.width - offset, height: parent.dimensions.height }, parent);

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
      parent.left = new Node(uuidv4(), { width: parent.dimensions.width, height: parent.dimensions.height - offset }, parent);
      /*
      this.left.draw( { x: o.x, y: o.y - this.h/2 + this.right.h + this.left.h/2 })
      this.right.draw({ x: o.x, y: o.y - this.h/2 + this.right.h/2 })
      */

      parent.right = new Node(uuidv4(), { width: parent.dimensions.width, height: offset }, parent);

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
    function splitNode(piece: Node, node: Node): boolean {
      cut(node, 'w', piece.dimensions.width/* / margin*/);

      if (!node.left) throw new Error("Guillotine - node.left: When you cut a node, there should be a left and right");

      cut(node.left, 'h', piece.dimensions.height/* / margin*/);

      if (!node.left.right) throw new Error("Guillotine - node.left.right: When you cut a node, there should be a left and right");

      return true;
    }

    function getPiece(piece: Node, node: Node): Node {
      if (!splitNode(piece, node)) throw new Error("Could not split node: When you cut a node, there should be a left and right");

      if (!node || !node.left || !node.left.right) throw new Error("Guillotine - node.left.right: When you cut a node, there should be a left and right");

      node.left.right.isPiece = true;
      return node.left.right;
    }

    // Essentially we need to find a fit node to place our piece inside
    function findFitNode(node: Node, piece: Node): Node | null {
      // So there's three possibilities: the node already fits the piece and isn't a piece itself
      if (!node.isPiece && !isCut(node) && node.dimensions.width >= piece.dimensions.width && node.dimensions.height >= piece.dimensions.height) return node;

      // The node has a left and or right node next to it that matches the first condition
      if (isCut(node)) {
        if (!node.left || !node.right) throw new Error("Guillotine: When you cut a node, there should be a left and right");

        let fit: Node | null = findFitNode(node.left, piece);

        if (fit) return fit;

        return findFitNode(node.right, piece);
      }

      // Or there's no fit node
      return null;
    }

    // So we want to find out whether the root node's already big enough, essentially if it isn't then we do stuff from there
    let node: Node | null = findFitNode(Node.root, piece);
    if (node) { // TODO: Potentially have user choice in how to cut? 
      let leaf: Node = getPiece(piece, node);
      leaf.id = piece.id; // We need to do this because we grab the specific pieces by their shared IDs

      return true;
    }


    // This is to check whether the canvas needs to be expanded, which is the size of our root
    // ASSUMPTION: Root's initial dimension will always be based on biggest item's dimensions
    // We check if there's a difference because we need to see if there's an overlap, x >=0 means there is an overlap
    let difference: Dimensions = {
      width: Node.root.dimensions.width - piece.dimensions.width,
      height: Node.root.dimensions.height - piece.dimensions.height
    }

    // BASE CASE: If there's no difference in dimension size, there's no need for the root to grow
    if (difference.width < 0 && difference.height < 0) return false;

    let resizedRootDimensions: Dimensions = {
      width: (difference.width >= 0) ? Node.root.dimensions.width + piece.dimensions.width / margin : Node.root.dimensions.width,
      height: (difference.height >= 0) ? Node.root.dimensions.height + piece.dimensions.height / margin : Node.root.dimensions.height
    }

    let resizedRootRightDimensions: Dimensions = {
      width: (difference.width >= 0) ? piece.dimensions.width / margin : Node.root.dimensions.width,
      height: (difference.height >= 0) ? piece.dimensions.height / margin : Node.root.dimensions.height
    }

    let resizedRoot: Node = new Node(uuidv4(), resizedRootDimensions, null, Node.root);
    resizedRoot.coordinates = getCentre(resizedRootDimensions);

    resizedRoot.right = new Node(uuidv4(), resizedRootRightDimensions, resizedRoot);
    resizedRoot.right.coordinates = getCentre(resizedRootRightDimensions);

    Node.root.parent = resizedRoot;
    Node.root = resizedRoot;

    // So we want to replace the root with a new root so we don't need to reposition our pieces
    return canPush(piece, margin);
  }

  function shouldDraw(node: Node): boolean {
    return (!isCut(node) && areDimensionsHigherThanZero(node.dimensions) && node.isPiece);
  }

  // So this is to make sure coordinate alignments is correct, we start from the centre of the canvas, not top left
  function getCentre(dimensions: Dimensions): Coordinates {
    return {
      x: dimensions.width / 2,
      y: dimensions.height / 2
    }
  }

  // For use with image nodes because the problem is position's relative to parent
  function getAbsoluteCoordinates(node: Node): Coordinates {
    if (!node.parent) return node.coordinates;

    let parent: Coordinates = getAbsoluteCoordinates(node.parent);
    // Move right, move down
    return {
      x: parent.x + node.coordinates.x,
      y: parent.y + node.coordinates.y
    }
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

  Node.root = new Node(`${uuidv4()}`, canvasDimensions);
  Node.root.coordinates = getCentre(canvasDimensions);

  // https://github.com/mariowise/2d-guillotine-cutter/blob/master/js/tree.js
  pieces.forEach((piece: Node) => {
    canPush(piece, margin);
  });

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
    },
  }
}

@Injectable({
  providedIn: 'root'
})
export class AtlasExportService {
  constructor() { }

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
    final.imagePiecesWithCoordinates.forEach((value: HTMLImageElement, key: Coordinates) => {
      if (ctx && value.complete) ctx.drawImage(value, (key.x  + (canvas.width / 2) - value.width)/2, (key.y + (canvas.height/2) - value.height)/2); // CHECKME: The keys are 0, 0, so would we need to make sure it's shifted because the root node starts smack dab in the middle of the canvas?
    });

    console.log('Atlas export canvas size', canvas.width, canvas.height);

    canvas.toBlob((blob: Blob | null) => {
      if (!blob) throw new Error("Atlas export canvas can't be converted to a blob.");

      download(fileName, 'png', URL.createObjectURL(blob));
    });
  }
}

