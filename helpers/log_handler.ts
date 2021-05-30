import * as colors from "colors";
import * as path from "path";
import * as fs from "fs";

const output: string = `${__dirname}/../logs/${Date.now()}.log`;
const nologfile: string = `${__dirname}/../.nologs`;
let disableActiveLogging: boolean = false;

// Catches errors
const onerror = (error: NodeJS.ErrnoException) => {
  if (error) log("error", "Log Handler", "Die aktuelle Logdatei konnte nicht beschrieben werden.");
}

// Logs to log file
const logtofile = (sender: string, message: string, status: number = 200, data: any = null) => {
  if (disableActiveLogging) return;

  const date = new Date().toLocaleString();
  
  if (!fs.existsSync(path.dirname(output))) fs.mkdirSync(path.dirname(output));

  fs.appendFile(output, `[ ${sender} ] [ ${date} ] [ ${status} ] ${message}\n`, onerror);
  if (data) fs.appendFile(output, `${data}\n`, onerror);
}

// Logs to console
export const log = (type: string, sender: string, message: string, status: number = null, append: boolean = true, data: any = null) => {
  colors.setTheme({
    info: "green",
    warn: "yellow",
    error: "red"
  });

  // @ts-ignore
  console.log(`[ ${sender.toString()[type]} ] [ ${new Date().toLocaleString().grey} ] ` + (status ? `[ ${status.toString()[type]} ] ${message}` : message.toString()));

  if (append) logtofile(sender, message, status, data);
}

if (fs.existsSync(nologfile)) disableActiveLogging = true;

if (disableActiveLogging) {
  log(`info`, `Log Handler`, `Logging ist passiv`);
} else {
  log(`info`, `Log Handler`, `Logging ist aktiv, output ist ${output}`);
}