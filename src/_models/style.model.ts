// Includes both style and filter classes

export class MyCubeFeatureStyle {
    color: string;
    width: number;
}

export class MyCubeFilterFields {
    column: string;
    operator: string;
    value: string | boolean;
}

export class MyCubeFilterOperator {
    operator: string;
}

export class MyCubeStyle {
    load: MyCubeFeatureStyle;
    current: MyCubeFeatureStyle;
    listLabel: string;
    filter: MyCubeFilterFields;
    filterOperator: MyCubeFilterOperator; //not used yet
}

//filter classes
export class filterOperators {
    isEqual = [
        { value: 'isEqual', viewValue: 'Equal' },
        { value: 'isNotEqual', viewValue: 'Not Equal' }
    ]
    contains = [
        { value: 'contains', viewValue: 'Contains' }
    ]
    beforeAfter = [
        { value: 'isGreaterThan', viewValue: 'After' },
        { value: 'isLessThan', viewValue: 'Before' }
    ]
    inequality = [
        { value: 'isGreaterThan', viewValue: 'Greater Than' },
        { value: 'isLessThan', viewValue: 'Less Than' }
    ]

    booleanOperators = this.isEqual
    textOperators = this.isEqual.concat(this.contains)
    dateOperators = this.isEqual.concat(this.beforeAfter)    
    doublePrecisionOperators = this.isEqual.concat(this.inequality)
}
