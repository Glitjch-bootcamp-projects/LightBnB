const properties = require('./json/properties.json');
const users = require('./json/users.json');

const { Pool } = require('pg');
const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});


/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {

  const emailQuery = `SELECT * FROM users WHERE email = $1`;
  const values = [email];
  return pool.query(emailQuery, values)
    .then(result => result.rows[0])
    .catch(err => console.log(err));
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithId = function (id) {
  const idQuery = `SELECT * FROM users WHERE id = $1`;
  const values = [id];
  return pool.query(idQuery, values)
    .then(result => result.rows[0])
    .catch(err => console.log(err));
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  const userInsert = `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *;`;
  const values = [user.name, user.email, user.password];
  return pool.query(userInsert, values)
    .then(result => result.rows[0])
    .catch(error => console.log(error))
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  const getResQuery = `SELECT * FROM reservations WHERE guest_id = $1 LIMIT $2;`;
  const values = [guest_id, limit];
  return pool.query(getResQuery, values)
    .then(result => result.rows)
    .catch(error => console.log(error));
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {
  let queryString = ` SELECT properties.*, avg(property_reviews.rating) as average_rating FROM properties JOIN property_reviews ON properties.id = property_id `;
  const queryParams = [];

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  };

  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night);
    queryString += `AND cost_per_night >= $${queryParams.length} * 100`;
  };

  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night);
    queryString += `AND cost_per_night <= $${queryParams.length} * 100`;
  };

  if (options.owner_id) {
    queryParams.push(options.owner_id);
    queryString += `AND owner_id = $${queryParams.length} `;
  };

  queryString += `GROUP BY properties.id `;

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `HAVING AVG(property_reviews.rating) >= $${queryParams.length} `
  };

  queryParams.push(limit);
  queryString += `ORDER BY cost_per_night LIMIT $${queryParams.length};`;

  console.log(queryString, queryParams);

  return pool.query(queryString, queryParams)
    .then((res) => {
      return res.rows;
    })
    .catch(error => console.log(error));
};
exports.getAllProperties = getAllProperties;

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const { parking_spaces, number_of_bathrooms, number_of_bedrooms } = property;
  const values = [
    property.title,
    property.description,
    property.thumbnail_photo_url,
    property.cover_photo_url,
    property.cost_per_night,
    property.street,
    property.city,
    property.province,
    property.post_code,
    property.country,
    property.owner_id
  ];
  let addPropQuery = `INSERT INTO properties (
    title,
    description,
    thumbnail_photo_url,
    cover_photo_url,
    cost_per_night,
    street,
    city,
    province,
    post_code,
    country,
    owner_id
    `;
  let addEntry1 = 0;
  if (parking_spaces) {
    values.push(parking_spaces);
    addPropQuery += `, parking_spaces`;
    addEntry1 = values.length;
  }
  let addEntry2 = 0;
  if (number_of_bathrooms) {
    values.push(number_of_bathrooms);
    addPropQuery += `, number_of_bathrooms`;
    addEntry2 = values.length;
  }
  let addEntry3 = 0;
  if (number_of_bedrooms) {
    values.push(number_of_bedrooms);
    addPropQuery += `, number_of_bedrooms`;
    addEntry3 = values.length;
  }
  addPropQuery += `) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11`

  if (parking_spaces) {
    addPropQuery += `, $${addEntry1}`;
  }
  if (number_of_bathrooms) {
    addPropQuery += `, $${addEntry2}`;
  }
  if (number_of_bedrooms) {
    addPropQuery += `, $${addEntry3}`;
  }
  addPropQuery += `) RETURNING *;`;

  console.log(addPropQuery, values);
  return pool.query(addPropQuery, values)
    .then(result => result.rows[0])
    .catch(error => console.log(error));
}
exports.addProperty = addProperty;


