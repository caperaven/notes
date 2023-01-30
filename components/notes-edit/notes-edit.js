class NotesEdit extends HTMLElement {
    #form;
    #edtTitle;
    #edtNotes;
    #note;
    #clickHandler = this.#click.bind(this);

    #actions = Object.freeze({
        "new": this.#new.bind(this),
        "save": this.#save.bind(this),
        "delete": this.#delete.bind(this),
        "cancel": this.#reset.bind(this)
    })

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        this.shadowRoot.innerHTML = await fetch(import.meta.url.replace(".js", ".html")).then(response => response.text());

        requestAnimationFrame(() => {
            this.#form = this.shadowRoot.querySelector("form");
            this.#edtTitle = this.shadowRoot.querySelector("#edtTitle");
            this.#edtNotes = this.shadowRoot.querySelector("#edtNotes");
            this.addEventListener("click", this.#clickHandler);
        });
    }

    async disconnectedCallback() {
        this.removeEventListener("click", this.#clickHandler);
        this.#form = null;
        this.#edtTitle = null;
        this.#edtNotes = null;
        this.#clickHandler = null;
        this.#actions = null;
        this.#note = null;
    }

    async #new() {
        this.#note = null;
        await this.#reset();
    }

    async #save() {
        if (this.#form.checkValidity() == false) return;

        const event = this.#note == null ? "create" : "update";

        this.#note ||= {};
        this.#note.title = this.#edtTitle.value;
        this.#note.notes = this.#edtNotes.value;

        this.dispatchEvent(new CustomEvent("change", { detail: {
            event, note: this.#note
        }}));
    }

    async #delete() {
        if (this.#note == null) return;

        const id = this.#note.id;
        await this.#new();

        this.dispatchEvent(new CustomEvent("change", {
            detail: { event: "delete", note: id }
        }));
    }

    async #reset() {
        this.#edtTitle.value = this.#note?.title ?? "";
        this.#edtNotes.value = this.#note?.notes ?? "";
    }

    async #click(event) {
        event.preventDefault();
        const target = event.composedPath()[0];
        const action = target.dataset.action;
        this.#actions[action]?.();
    }

    async setNote(note) {
        this.#note = note;
        await this.#reset();
    }
}

customElements.define('notes-edit', NotesEdit);