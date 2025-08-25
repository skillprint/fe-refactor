import config from '../startup/config';

/**
 * Manages getting items from and saving items to local storage
 */
export default class {
    /**
     * Gets an item from local storage
     * returns null if the key doesn't exist
     *
     * @param {string} key
     * @returns {string} data in string format
     */
    getItem(key) {
        let path = `${config.prefix}${key}`;
        return localStorage.getItem(path);
    }

    /**
     * Sets an item and assings a given key to it
     *
     * @param {string} key
     * @param {string | integer | boolean} value
     */
    setItem(key, value) {
        let path = `${config.prefix}${key}`;
        localStorage.setItem(path, value);
    }

    /**
     * Sets the value to an existing item, or creates a new record
     * if the key doesn't exist
     *
     * @param {string} key
     * @param {string | integer | boolean} defaultValue
     * @returns {string} value
     */
    initItem(key, defaultValue) {
        let path = `${config.prefix}${key}`;
        let item = localStorage.getItem(path);

        if (item === null) {
            localStorage.setItem(path, defaultValue);
            return localStorage.getItem(path);
        }

        return item;
    }
}
