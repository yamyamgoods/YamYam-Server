const mysqlPool = require('../../config/mysqlConfig');

async function Query(...args) {
  const query = args[0];
  const data = args[1];
  let result;
  let connection;

  try {
    connection = await mysqlPool.getConnection();
    result = await connection.query(query, data) || null;
  } catch (err) {
    connection.rollback(() => {});
  } finally {
    connection.release();
    // mysqlPool.releaseConnection(connection);
  }

  return result;
}

async function Transaction(...args) {
  let result = 'Success';
  let connection;

  try {
    connection = await mysqlPool.getConnection();
    await connection.beginTransaction();

    await args[0](connection, ...args);
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    result = undefined;
  } finally {
    connection.release();
    // mysqlPool.releaseConnection(connection);
  }

  return result;
}

module.exports = {
  Query,
  Transaction,
};
