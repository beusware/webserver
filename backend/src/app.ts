import * as ip from "ip";
import * as http from "http";
import * as express from "express";
import { Server } from "socket.io";

import { router } from "../../router";
import { log } from "../../helpers/log_handler";
import * as constants from "../../helpers/constants";
import { cloudsocket } from "./cloud/cloudsocket";
import { pokersocket } from "./poker/pokersocket";
import { dashboardsocket } from "./dashboard/dashboardsocket";

const app = express();
const directory = constants.paths.publicDirectory;

app.use("/", express.static(directory));
app.use("/", router);

// Initialize SocketIO
const server = http.createServer(app);
const io = new Server(server);

// Initialize modules
cloudsocket(io);
pokersocket(io);
dashboardsocket(io);

// TODO: Initialize cleaner
// require("./helpers/clean_handler")();

export const webserver = async () => {
  server.listen(constants.HTTP_PORT, () => {
    log(`info`, `Webserver`, `Webserver ist in Betrieb unter http://${ip.address()}:${constants.HTTP_PORT}/`);
  });
};

webserver();