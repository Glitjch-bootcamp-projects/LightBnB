SELECT properties.*, reservations.*, AVG(rating) as average_rating
FROM properties
JOIN reservations
ON properties.id = reservations.property_id
JOIN property_reviews
ON reservations.id = property_reviews.reservation_id
WHERE property_reviews.guest_id = 1
AND end_date < now()::date
GROUP BY properties.id, reservations.id
LIMIT 10;