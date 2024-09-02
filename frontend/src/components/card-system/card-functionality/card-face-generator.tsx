// This is for determining what aspects of the card should be spawned and where
// We need to save the positioning and the styling
// And then convert it to percentage base
export const ConvertPixelLocationToPercentage = (childDimensions: {x: number, y: number}, parentDimensions: {x: number, y: number}): {x: number, y: number} => {
    return {x: (childDimensions.x/parentDimensions.x) * 100, y: (childDimensions.y/parentDimensions.y) * 100};
}

// Not sure how this would work, this would mean that inside of the card creation menu
// Every component would have to have a className to add here
export const CardFaceStyleGenerator = (): void => {

}