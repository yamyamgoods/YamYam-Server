const pool = require('../config/dbConfig');

async function Query(...args) {
    const query = args[0];
    const data = args[1];
    let result;

    try {
        var connection = await pool.getConnection();
        result = await connection.query(query, data) || null;
    } catch (err) {
        connection.rollback(() => {});
        next(err);
    } finally {
        pool.releaseConnection(connection);
        return result;
    }
}

async function Transaction(...args) {
    let result = "Success";

    try {
        var connection = await pool.getConnection();
        await connection.beginTransaction();

        await args[0](connection, ...args);
        await connection.commit();
    } catch (err) {
        await connection.rollback();
        result = undefined;
    } finally {
        pool.releaseConnection(connection);
        return result;
    }
}

module.exports = {
    Query,
    Transaction,
};