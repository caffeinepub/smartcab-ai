# SmartCab AI

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- User authentication (sign up / log in) via authorization component
- Cab booking flow: enter pickup and drop locations
- Ride options: Mini, Sedan, SUV with estimated fare, distance, travel time
- Simulated map interface showing route between pickup and destination
- Driver details display: name, vehicle number, car model, rating, ETA
- Ride status tracking (Searching, Driver Assigned, En Route, Arrived, Completed)
- AI assistant: analyzes pickup/drop to suggest fastest/cheapest route and best ride option
- AI trip summary after ride completion (distance, time, fare)
- Ride history page
- User profile management
- Driver rating after ride
- Notifications for booking confirmation and driver arrival
- Mobile-friendly responsive UI

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Select authorization and http-outcalls components
2. Generate Motoko backend: user profiles, ride bookings, ride history, driver ratings
3. Build frontend: auth screens, booking flow, ride options, map simulation, driver card, ride tracking, AI assistant panel, trip summary, ride history, profile page
