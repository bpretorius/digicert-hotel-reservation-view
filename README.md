# Hotel Reservation View

## Perform the following to run the application

Run the following in the command prompt/powershell in the root of the application:
1. npm start

Or via docker cmd:
1. docker build . --tag=reservation-view:latest
2. docker run reservation-view:latest

FYI: Application runs on port 3000

### Due to time constraints, the following is still outstanding tasks and considerations.
- Improve front-end validation
- Improve and standerdise error handling from the backend API e.g. status 400's and 500's
- Parameterise Hard coded backend urls per SDLC env
- Use TypeScript instead of Javascript. I used javascript because I am a bit more familiar and it is faster to code. Typescript enforces better discipline and constriants as it is tightly type scoped.
- Add Hotel and Customer drop down and date picker when creating and editing a reservation
- Look to see if can add any valuable unit testing
- Also look at mobile and auto resizing.
