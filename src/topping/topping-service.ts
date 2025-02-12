import ToppingModel from "./topping-model";
import { ITopping } from "./topping-types";

export class ToppingService {
    async createTopping(topping: ITopping) {
        return await ToppingModel.create(topping);
    }

    async getTopping(toppingId: string): Promise<ITopping | null> {
        return await ToppingModel.findById(toppingId);
    }

    async updateTopping(toppingId: string, topping: ITopping) {
        return await ToppingModel.findByIdAndUpdate(
            toppingId,
            {
                $set: topping,
            },
            { new: true },
        );
    }

    async getToppings() {
        return await ToppingModel.find().lean(); //: lean() -> Converts documents into plain JS objects
    }
}
