/*
FVector UGridGeneratorComponent::GetWorldPosForGridCell(const FIntPoint& Pos) const
{
    Cell index multiplied by the size of the cell (gives the scale of the cell), shifted by the location of the grid and then subtract half of the cell in order to land in the centre and get the actual positioning
	return FVector(Pos.Y * GetGridCellSize().X + GetOwner()->GetActorLocation().X - CellDisplacement().X, Pos.X * GetGridCellSize().Y + GetOwner()->GetActorLocation().Y - CellDisplacement().Y, GetOwner()->GetActorLocation().Z);
}
 */

// Need to create a grid overlay where it grabs the dimensions of the thing it's in, have a default cell size, then figure out from there the snapping
// Gotta grab the centre of the item that needs to snap to in question though