import { TIMEOUT_SEC } from "./config";

export const timeout = function (s)
{
  return new Promise(function (_, reject)
  {
    setTimeout(function ()
    {
      reject(new Error(`Request took too long! Timeout after ${ s } second`));
    }, s * 1000);
  });
};

export const getJSON = async function (url)
{
  try
  {
    // Fetching Data
    const res = await Promise.race([fetch(url), timeout(TIMEOUT_SEC)]);
    // Get JavaScript Object from JSON
    const data = await res.json();

    if (!res.ok) throw new Error(`${ data.message } ${ data.status }`);

    console.log(res, data);
    return data;
  }
  catch (err)
  {
    // Re-throwing the Error
    throw (err);
  }
};