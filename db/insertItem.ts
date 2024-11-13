import { Connection } from 'mysql2';
import { Item } from '../types';

export async function insertItem(item: Item, categoryId: number, connection: Connection): Promise<void> {
    return new Promise((resolve, reject) => {
        const checkQuery = `SELECT id, rap, previous_rap FROM items WHERE name = ?`;

        connection.query(checkQuery, [item.name], (error, results: any) => {
            if (error) {
                reject(error);
                return;
            }

            if (results && results.length > 0) {
                const existingItem = results[0];
                const updateQuery = `
                    UPDATE items
                    SET 
                        rap = ?, 
                        previous_rap = ?, 
                        last_modified = ?, 
                        amount_exists = ?
                    WHERE id = ?`;

                connection.query(updateQuery, [
                    item.rap,
                    existingItem.rap,
                    item.lastModified,
                    item.amountExists ?? null,
                    existingItem.id
                ], (updateError) => {
                    if (updateError) {
                        reject(updateError);
                    } else {
                        resolve();
                    }
                });
            } else {
                const insertQuery = `
                    INSERT INTO items (name, rap, previous_rap, last_modified, category_id, titanic, huge, exclusive, amount_exists)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                connection.query(insertQuery, [
                    item.name,
                    item.rap,
                    item.rap,
                    item.lastModified,
                    categoryId,
                    item.titanic ? 1 : 0,
                    item.huge ? 1 : 0,
                    item.exclusive ? 1 : 0,
                    item.amountExists ?? null
                ], (insertError) => {
                    if (insertError) {
                        reject(insertError);
                    } else {
                        resolve();
                    }
                });
            }
        });
    });
}