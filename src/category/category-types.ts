//: Type of Category Object
export interface IPriceConfiguration {
    [key: string]: {
        priceType: "base" | "additional";
        availableOptions: string[];
    };
}

export interface IAttribute {
    name: string;
    widgetType: "switch" | "radio";
    defaultValue: string;
    availableOptions: string[];
}

export interface ICategory {
    name: string;
    priceConfiguration: IPriceConfiguration;
    attributes: IAttribute[];
}
