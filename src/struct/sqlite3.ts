import Database from "better-sqlite3";
import { config } from "../config.js";

class Sqlite3 extends Database {
  constructor() {
    super(config.sqlite.path, config.sqlite.options ?? {});
  }
}

export { Sqlite3 };
