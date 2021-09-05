import * as os from "os-utils";

const interval = 5000;

const getSystemInformation = async () => {
  const result: Map<String, any> = new Map();

  os.cpuUsage((usage) => {
    result.set("cpu", usage);
  });

  result.set("free", os.freemem());
  result.set("total", os.totalmem());

  return result;
}

export const dashboardsocket = (io: any) => {
  io.on("connection", (socket: any): void => { });

  setInterval(async () => {
    const info = await getSystemInformation();
    
    io.emit(`tick`, `${info.get("cpu")} % - ${info.get("free")} / ${info.get("total")}`);
  }, interval);
};
