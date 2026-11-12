const pool = require('../config/db');

function createPendingBooking(ownerId, petId, serviceId, bookingDate, callback) {
  pool.getConnection((connectionError, connection) => {
    if (connectionError) return callback(connectionError);

    let callbackCalled = false;

    function finish(error, result) {
      if (callbackCalled) return;
      callbackCalled = true;

      try {
        connection.release();
      } catch (releaseError) {
        return callback(releaseError);
      }

      callback(error, result);
    }

    function rollback(error, result) {
      connection.rollback((rollbackError) => {
        if (rollbackError) {
          const combinedError = new Error(
            `${error ? error.message : 'Transaction rollback failed'}; rollback failed: ${rollbackError.message}`
          );
          combinedError.originalError = error || null;
          combinedError.rollbackError = rollbackError;
          return finish(combinedError);
        }

        finish(error, result);
      });
    }

    connection.beginTransaction((transactionError) => {
      if (transactionError) return rollback(transactionError);

      const bookingSql = `
        INSERT INTO service_bookings
          (pet_id, service_id, booking_status, booked_price, booking_date)
        SELECT p.id, s.id, 'pending', s.price, ?
        FROM pets AS p
        JOIN services AS s ON s.id = ?
        WHERE p.id = ? AND p.owner_id = ? AND s.is_active = 1
      `;

      connection.query(
        bookingSql,
        [bookingDate, serviceId, petId, ownerId],
        (bookingError, bookingResult) => {
          if (bookingError) return rollback(bookingError);
          if (bookingResult.affectedRows !== 1) return rollback(null, null);

          const paymentSql = `
            INSERT INTO payments (booking_id, amount, payment_status)
            SELECT id, booked_price, 'pending'
            FROM service_bookings
            WHERE id = ?
          `;

          connection.query(
            paymentSql,
            [bookingResult.insertId],
            (paymentError, paymentResult) => {
              if (paymentError) return rollback(paymentError);
              if (paymentResult.affectedRows !== 1) {
                return rollback(new Error('Unable to create the pending payment record.'));
              }

              connection.commit((commitError) => {
                if (commitError) return rollback(commitError);
                finish(null, {
                  bookingId: bookingResult.insertId,
                  paymentId: paymentResult.insertId
                });
              });
            }
          );
        }
      );
    });
  });
}

function getBookingsByOwner(ownerId, callback) {
  const sql = `
    SELECT
      sb.id AS booking_id,
      DATE_FORMAT(sb.booking_date, '%Y-%m-%d') AS booking_date,
      p.name AS pet_name,
      s.name AS service_name,
      sb.booked_price,
      sb.booking_status,
      pay.payment_status
    FROM service_bookings AS sb
    JOIN pets AS p ON p.id = sb.pet_id
    JOIN services AS s ON s.id = sb.service_id
    LEFT JOIN payments AS pay ON pay.booking_id = sb.id
    WHERE p.owner_id = ?
    ORDER BY sb.created_at DESC, sb.id DESC
  `;
  pool.query(sql, [ownerId], callback);
}

module.exports = {
  createPendingBooking,
  getBookingsByOwner
};
