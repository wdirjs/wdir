import Debugger from "../core/debugger";

function parseConfig(val: string, prev: Array<Record<string, string>> = []) {
  const [name, valueStr] = val.split("=");
  if (!name || !valueStr) {
    const error = new Error("Key-value pair of config 'name=value' must not be undefined or null!");
    Debugger.getInstance().error(error.message);
    throw error;
  }

  let value: any = valueStr;

  if (valueStr.toLowerCase() === "true") value = true;
  else if (valueStr.toLowerCase() === "false") value = false;
  else if (!isNaN(Number(valueStr))) value = Number(valueStr);

  return [...prev, { key: name, value }];
}

export default parseConfig;
