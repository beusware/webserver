import * as os from "os-utils";

export const dashboardsocket = (io: any) => {
  io.on("connection", (socket: any): void => { });

  setInterval(() => {
    os.cpuUsage((usage) => {
      io.emit(`tick`, `${usage} % - ${os.freemem()} / ${os.totalmem()}`);
    });
  }, 3000);
};
