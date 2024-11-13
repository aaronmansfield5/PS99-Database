import { createConnection, Connection } from 'mysql2';

export const connection: Connection = createConnection({
    host: 'localhost',
    user: 'root',
    database: 'ps99_rap',
});