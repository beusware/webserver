import * as path from "path";

export const HTTP_PORT = 80;
export const HTTPS_PORT = 8443;

export const paths = {
    cloudDataDirectory: path.resolve(`${__dirname}/../backend/data/cloud/`),
    publicDirectory: path.resolve(`${__dirname}/../public/`),
    viewsDirectory: path.resolve(`${__dirname}/../public/views/`),
    certificateDirectory: path.resolve(`${__dirname}/../certificates/`),
}