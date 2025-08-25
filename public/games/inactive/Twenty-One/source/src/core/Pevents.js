export default class {
    constructor() {
        this.listeners = [];
    }

    addListener(event, fn, context, once) {
        if (typeof fn !== 'function') {
            throw new TypeError('The listener must be a function');
        }

        let existing = this.listeners.find((l) => l.event === event && l.fn === fn && l.context === context);
        if (existing) return;

        this.listeners.push({ event, fn, context, once });
    }

    removeListener(event, fn, context) {
        let existing = this.listeners.filter((l) => l.event === event && l.fn === fn && l.context === context);
        existing.forEach((entry) => {
            let index = this.listeners.indexOf(entry);
            this.listeners.splice(index, 1);
        });
    }

    on(event, fn, context) {
        this.addListener(event, fn, context, false);
    }

    once(event, fn, context) {
        this.addListener(event, fn, context, true);
    }

    off(event, fn, context) {
        this.removeListener(event, fn, context);
    }

    async emit(event, ...args) {
        let jobs = [];
        let existing = this.listeners.filter((l) => l.event === event);
        existing.forEach((entry) => jobs.push(entry.fn.call(entry.context, ...args)));

        await Promise.all(jobs);

        existing.forEach((entry) => {
            if (entry.once) this.removeListener(entry.event, entry.fn, entry.context);
        });

        return new Promise((resolve) => resolve());
    }
}
