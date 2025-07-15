import { Tag } from "../../tagging-system/models/tag";
import { Card } from "./card";

export interface TagsPerCard {
    tag: Tag;
    card: Card;

    // TODO: In backend, we only add the IDs of the tag and card in the CardEditorCardDto
    // In backend, when getting from CardEditorCardDto, we grab the card ID, get all the tags via the card ID from the TagsPerCard table, then from there, loop through the Tags table itself to then get the information back
}