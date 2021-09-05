import * as fs from "fs";
import * as path from "path";
import * as multer from "multer";
import { Router } from "express";

import { Util } from "../../helpers/util";
import { log } from "../../helpers/log_handler";
import * as constants from "../../helpers/constants";

export const router = Router();

const cloudDataDirectory = constants.paths.cloudDataDirectory;
const htmlpath = constants.paths.viewsDirectory;

// TODO: Move to backend util
// Saves files to disk
const diskStorage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, cloudDataDirectory);
  },
  filename: (_, file, cb) => {
    cb(null, Util.sanetizeString(file.originalname, true));
  }
});

// Dashboard
router.get(["/", "/dashboard"], (_, res) => {
  res.sendFile(`${htmlpath}/dashboard.html`);
});

// Poker
router.get(["/poker"], (_, res) => {
  res.sendFile(`${htmlpath}/poker.html`);
});

// Cloud
router.get(["/cloud"], (_, res) => {
  res.sendFile(`${htmlpath}/cloud.html`);
});

// Cloud download
router.get(["/cloud/:file"], (req, res) => {
  const respond = () => {
    const code = 500;

    res.status(code).sendFile(`${htmlpath}/error.html`);
    log("error", "Cloud System", "Download ist fehlgeschlagen", code);
  }

  if (!fs.existsSync(cloudDataDirectory)) {
    fs.mkdir(cloudDataDirectory, () => log);
    respond();
    return;
  }

  res.download(`${cloudDataDirectory}/${req.params["file"]}`, (error) => {    
    if (error) {
      respond();
    } else {
      log("info", "Cloud System", `Download wurde genehmigt`);
    }
  });
});

// Cloud upload
router.post("/cloud/upload", multer.default({storage: diskStorage}).single("file"), (_, res) => {
  res.sendStatus(200);
});

// 404
router.get("*", (_, res) => {
  res.status(404).sendFile(`${htmlpath}/error.html`);
});