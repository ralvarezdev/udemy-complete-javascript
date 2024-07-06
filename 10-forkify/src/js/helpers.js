import {TIMEOUT_SEC} from "./config";

export const timeout = function (s) {
    return new Promise(function (_, reject) {
        setTimeout(function () {
            reject(new Error(`Request took too long! Timeout after ${s} second`));
        }, s * 1000);
    });
};

export const getHash = function () {
    // Get Hash ID
    return window.location.hash.slice(1);
};

export const AJAX = async function (url, uploadData = undefined) {
    try {
        const fetchPromise = uploadData ?
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(uploadData)
            })
            : fetch(url);

        // Fetching Data
        const res = await Promise.race([fetchPromise, timeout(TIMEOUT_SEC)]);
        // Get JavaScript Object from JSON
        const data = await res.json();

        if (!res.ok) throw new Error(`${data.message} ${data.status}`);

        console.log(res, data);
        return data;
    } catch (err) {
        // Re-throwing the Error
        throw (err);
    }
};