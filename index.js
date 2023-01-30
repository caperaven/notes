/**
 * @class ViewModel - the view model for the application and handles all of the business logic
 */
class ViewModel {
    #databaseWorker = new Worker("/src/database-worker.js");
    #notesList = null;
    #notesEdit = null;
    #notesChangeHandler = this.#notesChange.bind(this);
    #notesListChangeHandler = this.#notesListChange.bind(this);

    async connectedCallback() {
        requestAnimationFrame(async () => {
            this.#notesList = document.querySelector('[is="notes-list"]');
            this.#notesEdit = document.querySelector("notes-edit");

            this.#notesEdit.addEventListener("change", this.#notesChangeHandler);
            this.#notesList.addEventListener("change", this.#notesListChangeHandler);

            await this.performAction("initDB", null);
            await this.#refresh();
        })
    }

    /**
     * @method dispose - dispose of the ViewModel instance and terminate the database worker
     */
    dispose() {
        this.#notesEdit.removeEventListener("change", this.#notesChangeHandler);
        this.#notesList.removeEventListener("change", this.#notesListChangeHandler);

        this.#databaseWorker.terminate();
        this.#databaseWorker = null;
        this.#notesList = null;
        this.#notesEdit = null;
        this.#notesChangeHandler = null;
        this.#notesListChangeHandler = null;
    }

    async #refresh() {
        const notes = await this.performAction("getAll", null);
        await this.#notesList.addNotes(notes.data);
    }

    async #notesChange(event) {
        const actionEvent = event.detail.event;
        const note = event.detail.note;
        const result = await this.performAction(actionEvent, note).catch(e => console.error(e));
        await this.#notesList[actionEvent](result.data);
        await this.#notesList.setSelected(result.data.id);

        if (typeof result.data == "object") {
            await this.#notesEdit.setNote(result.data);
        }
    }

    async #notesListChange(event) {
        const note = await this.performAction("read", Number(event.detail)).catch(e => console.error(e));
        await this.#notesEdit.setNote(note.data);
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