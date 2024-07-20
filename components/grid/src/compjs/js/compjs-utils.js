export const getMapFromObject = (obj) => {
    if (typeof obj !== 'object')
        throw new Error("Object must be an instance of Object.");

    const map = new Map();
    for (let [key, value] of Object.entries(obj))
        map.set(key, value);

    return map;
}

export const getListFromObject = (obj) => {
    if (typeof obj !== 'object')
        throw new Error("Object must be an instance of Object.");

    return [...obj];
}