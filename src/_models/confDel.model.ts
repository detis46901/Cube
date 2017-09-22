//export class if defining function
//export interface if declaring function without code

export interface confirmDelete {
    objectCode: number;
    objectID: number;

    //Can this be defined completely here and used in all of the class implementations? (not currently being used), would export class not interface
    confDel(objectCode, objectID): void;
}