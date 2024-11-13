import { connection } from '../config/database';

export async function insertCategory(category: string): Promise<number> {
    return new Promise((resolve, reject) => {
        const checkQuery = `SELECT id FROM categories WHERE category_name = ?`;

        connection.query(checkQuery, [category], (error, results: any) => {
            if (error) {
                reject(error);
                return;
            }

            if (results && Array.isArray(results) && results.length > 0) {
                resolve(results[0].id);
            } else {
                const insertQuery = `INSERT INTO categories (category_name) VALUES (?)`;

                connection.query(insertQuery, [category], (insertError, insertResults) => {
                    if (insertError) {
                        reject(insertError);
                    } else {
                        resolve((insertResults as ResultSetHeader).insertId);
                    }
                });
            }
        });
    });
}