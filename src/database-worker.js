importScripts("/src/database.js");

/**
 * class DatabaseWorker - a wrapper for the Database class
 */
class DatabaseWorker {
    static async create(record) {
        return globalThis.database.create(record);
    }

    static async read(id) {
        return globalThis.database.read(id);
    }

    static async update(record) {
        return globalThis.database.update(record);
    }

    static async delete(id) {
        return globalThis.database.delete(id);
    }

    static async getAll() {
        return globalThis.database.getAll();
    }
}

/**
 * @method onmessage - handle messages from the main thread and perform the appropriate action on the database
 * @param event - the message event
 * @param event.data - the message data object containing the type of action to perform and the data to perform it on
 * @param event.data.type - the type of action to perform and includes "create", "read", "update", and "delete"
 * @param event.data.data - the data to perform the action on and can be either an object or id depending on the action
 * @returns {Promise<void>}
 */
self.onmessage = async (event) => {
    const {type, data} = event.data;

    switch (type) {
        case "create": {
            await DatabaseWorker.create(data);
            self.postMessage({data: true});
            break;
        }
        case "read": {
            const result = await DatabaseWorker.read(data);
            self.postMessage({data: result});
            break;
        }
        case "update": {
            await DatabaseWorker.update(data);
            self.postMessage({data: true});
            break;
        }
        case "delete": {
            await DatabaseWorker.delete(data);
            self.postMessage({data: true});
            break;
        }
        case "getAll": {
            const result = await DatabaseWorker.getAll();
            self.postMessage({data: result});
            break;
        }
        case "initDB": {
            await initDB();
            self.postMessage({type: "ready"});
            break;
        }
    }
};

async function initDB() {
    return new Promise(resolve => {
        Database.connect().then(database => {
            globalThis.database = database;
            resolve();
        })
    })
}