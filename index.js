import { Database } from "./src/database.js";

class ViewModel {
    constructor() {
        Database.connect().then(database => globalThis.database = database);
    }
}

globalThis.viewModel = new ViewModel();