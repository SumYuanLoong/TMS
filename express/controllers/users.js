const pool = require("../utils/db");

/**
 * To use prepared statements, use pool.execute('query', [data,'data'])
 * This will internally call prepare and query seperately
 */
