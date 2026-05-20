define(['jquery', './config.js?v=' + sensei_widget_version,], function($, config) {
    return function indexeddbService() {
        this.openDatabase = (dbName, dbVersion, objectStoreName) => {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(dbName, dbVersion);

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(objectStoreName)) {
                        db.createObjectStore(objectStoreName, { keyPath: 'id', autoIncrement: true });
                    }
                };

                request.onsuccess = (event) => {
                    resolve(event.target.result);
                };

                request.onerror = (event) => {
                    reject(`Ошибка: ${event.target.errorCode}`);
                };
            });
        }

        this.addItem = (db, objectStoreName, data) => {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([objectStoreName], 'readwrite');
                const objectStore = transaction.objectStore(objectStoreName);
                const request = objectStore.add(data);

                request.onsuccess = () => {
                    resolve('Запись успешно добавлена.');
                };

                request.onerror = (event) => {
                    reject(`Ошибка добавления: ${event.target.errorCode}`);
                };
            });
        }

        this.getItem = (db, objectStoreName, key) => {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([objectStoreName], 'readonly');
                const objectStore = transaction.objectStore(objectStoreName);
                const request = objectStore.get(key);

                request.onsuccess = (event) => {
                    resolve(event.target.result);
                };

                request.onerror = (event) => {
                    reject(`Ошибка получения: ${event.target.errorCode}`);
                };
            });
        }

        this.updateItem = (db, objectStoreName, data) => {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([objectStoreName], 'readwrite');
                const objectStore = transaction.objectStore(objectStoreName);
                const request = objectStore.put(data);

                request.onsuccess = () => {
                    resolve('Запись успешно обновлена.');
                };

                request.onerror = (event) => {
                    reject(`Ошибка обновления: ${event.target.errorCode}`);
                };
            });
        }

        this.deleteItem = (db, objectStoreName, key) => {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([objectStoreName], 'readwrite');
                const objectStore = transaction.objectStore(objectStoreName);
                const request = objectStore.delete(key);

                request.onsuccess = () => {
                    resolve(true);
                };

                request.onerror = (event) => {
                    console.debug(`Ошибка удаления: ${event.target.errorCode}`)
                    reject(false);
                };
            });
        }
    }
})