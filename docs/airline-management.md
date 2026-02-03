# Airline Management System

This module adds a foundational airline management system to the existing backend. It provides CRUD APIs for core airline entities so the application can manage airports, aircraft, routes, flights, passengers, bookings, and crew.

## Core Entities

- **Airports**: IATA/ICAO code, location, and timezone details.
- **Aircraft**: Fleet registry with capacity, range, and maintenance status.
- **Routes**: Origin/destination airport pairs with distance and duration.
- **Flights**: Schedules tied to routes and aircraft with real-time status.
- **Passengers**: Customer profile records.
- **Bookings**: Ticket reservations linked to passengers and flights.
- **Crew**: Flight and ground crew roster with base airport.

## API Endpoints

Base path: `/api/airline`

### Airports

- `GET /airports`
- `GET /airports/:id`
- `POST /airports`
- `PUT /airports/:id`
- `DELETE /airports/:id`

### Aircraft

- `GET /aircraft`
- `GET /aircraft/:id`
- `POST /aircraft`
- `PUT /aircraft/:id`
- `DELETE /aircraft/:id`

### Routes

- `GET /routes`
- `GET /routes/:id`
- `POST /routes`
- `PUT /routes/:id`
- `DELETE /routes/:id`

### Flights

- `GET /flights`
- `GET /flights/:id`
- `POST /flights`
- `PUT /flights/:id`
- `DELETE /flights/:id`

### Passengers

- `GET /passengers`
- `GET /passengers/:id`
- `POST /passengers`
- `PUT /passengers/:id`
- `DELETE /passengers/:id`

### Bookings

- `GET /bookings`
- `GET /bookings/:id`
- `POST /bookings`
- `PUT /bookings/:id`
- `DELETE /bookings/:id`

### Crew

- `GET /crew`
- `GET /crew/:id`
- `POST /crew`
- `PUT /crew/:id`
- `DELETE /crew/:id`

## Next Steps

- Add pricing rules and seat maps for advanced booking flows.
- Connect a front-end dashboard for operational staff.
- Implement notification workflows for delays and schedule changes.
- Integrate role-based permissions for airline staff.
