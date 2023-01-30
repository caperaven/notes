/**
 * @class Database
 * This is a class that wraps indexdb operations for crud operations and filtering
 *
 * Fields in the store are:
 * - id - unique id for the record
 * - title - title of the record
 * - notes - notes for the record
 *
 * Methods:
 * - connect - create a data store if it does not exist and connect to the store for further operations
 * - disconnect -disconnect from the data store
 * - create - create a new record in the data store
 * - read - read a record from the data store based on the id
 * - update - update a record in the data store based on the id
 * - delete - delete a record from the data store based on the id
 * - filter - filter records from the data store based on the filter object
 */
class Database {
    #dbName = 'notes';
    #storeName = 'notes';
    #db = null;

    static async connect() {
        const instance = new Database();
        await instance.#connect();
        return instance;
    }

    async dispose() {
        await this.#disconnect();
    }

    /**
     * @method connect - connect to the database
     * @returns {Promise} - promise that resolves to the connection object
     */
    #connect() {
        return new Promise((resolve, reject) => {
            const request = self.indexedDB.open(this.#dbName, 1);

            request.onerror = (event) => {
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.#db = event.target.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                const store = db.createObjectStore(this.#storeName, { keyPath: "id", autoIncrement: true });

                store.createIndex("title", "title", { unique: false });
                store.createIndex("notes", "notes", { unique: false });
            };
        });
    }

    /**
     * @method disconnect - disconnect from the database
     * @returns {Promise<void>}
     */
    async #disconnect() {
        if (this.#db) {
            this.#db.close();
            this.#db = null;
        }
    }

    /**
     * @method #performTransaction - perform a transaction on the database store
     * The callback does the actual work but this function takes care of all the generic stuff
     * @param callback {function} - callback function that does the actual work
     * @returns {Promise<unknown>}
     */
    #performTransaction(callback) {
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction([this.#storeName], "readwrite");
            const store = transaction.objectStore(this.#storeName);

            const request = callback(store);

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    /**
     * @method create - create a new record in the database
     * @param {object} record - record to be created
     * @returns {Promise<void>}
     */
    create(record) {
        return this.#performTransaction((store) => {
            return store.add(record);
        });
    }

    /**
     * @method read - read a record from the database
     * @param {string} id - id of the record to be read
     * @returns {Promise<void>}
     */
    read(id) {
        return this.#performTransaction((store) => {
            return store.get(id);
        });
    }

    /**
     * @method update - update a record in the database
     * @returns {Promise<void>}
     */
    update(data) {
        return this.#performTransaction((store) => {
            return store.put(data);
        })
    }

    /**
     * @method delete - delete a record from the database
     * @returns {Promise<void>}
     */
    async delete(id) {
        return this.#performTransaction((store) => {
            return store.delete(id);
        });
    }

    /**
     * @method getAll - get all records from the database
     * @returns {Promise<void>}
     */
    async getAll() {
        return this.#performTransaction((store) => {
            return store.getAll();
        });
    }

    /**
     * @method filter - filter records from the database
     */
    async filter(title) {
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction([this.#storeName], "readonly");
            const store = transaction.objectStore(this.#storeName);
            const index = store.index("title");
            const notes = [];

            index.openCursor(IDBKeyRange.only(title)).onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.title.includes(title)) {
                        notes.push(cursor.value);
                    }
                    cursor.continue();
                } else {
                    resolve(notes);
                }
            };
        });
    }
}