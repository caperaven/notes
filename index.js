class ViewModel {
    #databaseWorker = new Worker("/src/database-worker.js");

    constructor() {
    }

    dispose() {
        this.#databaseWorker.terminate();
    }

    /**
     * @method performAction - perform an action on the database
     * @param type {string} - the type of action to perform and includes "create", "read", "update", and "delete"
     * @param data {object} - the data to perform the action on and can be either an object or id depending on the action
     * @returns {Promise<unknown>}
     */
    performAction(type, data) {
        return new Promise((resolve, reject) => {
            this.#databaseWorker.onmessage = (event) => {
                resolve(event.data);
            };

            this.#databaseWorker.onerror = (event) => {
                reject(event.error);
            };

            this.#databaseWorker.postMessage({type, data});
        });
    }
}


globalThis.viewModel = new ViewModel();