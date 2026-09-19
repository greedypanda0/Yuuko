import { Pool } from "pg";
import { config } from "../config.js";

class Postgres extends Pool {
  constructor() {
    super({ connectionString: config.database.url });
  }
}

export { Postgres };
