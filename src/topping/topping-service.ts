import ToppingModel from "./topping-model";
import { ITopping } from "./topping-types";

export class ToppingService {
    async createTopping(topping: ITopping) {
        return await ToppingModel.create(topping);
    }
}
