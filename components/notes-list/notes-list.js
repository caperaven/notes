/**
 * @class NotesList - This manages the dom for the notes list
 * @extends HTMLUListElement
 *
 * methods:
 * - addCollection - add a collection of notes to the list
 * - create - create a new note list item
 * - update - update a note list item
 * - delete - delete a note list item
 */
class NotesList extends HTMLUListElement {
    /**
     * @method #addListItem - add a single note to the list
     * @param note {object} - the note to add
     * @param parentElement {HTMLElement} - the parent element to add the note list item too
     * @param note
     */
    #addListItem(note, parentElement) {
        const listItem = document.createElement("li");
        listItem.innerHTML = note.title;
        listItem.setAttribute("data-id", note.id);
        parentElement.appendChild(listItem);
    }

    /**
     * @method addCollection - add a collection of notes to the list
     * @param collection {Array} - the collection of notes to add
     */
    async addNotes(collection) {
        const fragment = document.createDocumentFragment();
        collection.forEach(note => this.#addListItem(note, fragment));
        this.appendChild(fragment);
    }

    /**
     * @method create - create a new note list item
     * @param note
     */
    async create(note) {
        this.#addListItem(note, this);
    }

    /**
     * @method update - update a note list item
     * @param note
     */
    async update(note) {
        const listItem = this.querySelector(`[data-id="${note.id}"]`);
        listItem.innerHTML = note.title;
    }

    /**
     * @method delete - delete a note list item
     * @param id
     */
    async delete(id) {
        const listItem = this.querySelector(`[data-id="${id}"]`);
        listItem.remove();
    }
}

customElements.define('notes-list', NotesList, { extends: 'ul' });