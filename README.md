# PopHealthApp
The Pop-Health App of the LEAP Project 

This is a sample React web application, designed to demonstrate what could be possible
if we had a population level FHIR data available from EHRs through a bulk-data export.
In this case we chose to create an app that visualizes data for quality measures.

Note that this app currently connects to a demo database that contains combination of
generic and de-identified patient data. This means that what you see in the app is not
real data and should not be used for deriving realistic conclusions. It should however
be possible to reconfigure the app to run against real data, once we have it available.

## Installation
It is a React web app, built with Node and stored on GitHub. This means that once you
have NodeJS (version 12) and git installed, you can install it like so:

```sh
cd ~
git clone https://github.com/chb/pop-health-app.git
cd pop-health-app
npm i
```

## Build
```sh
npm run build
```

## Start
```sh
npm run start:server`
```

Note that this app connects to external MySQL database. Alternatively, you can use Docker
(see below) to run both the app, and a sample database server.

## Environment Variables
- `HOST` - The host on which the app is available. Defaults to `0.0.0.0`.
- `PORT` - The port on which the app is available. Defaults to `8080`.
- `DB_HOST` - The database host. Defaults to `localhost`.
- `DB_USER` - The database user.
- `DB_PASS` - The database user password.
- `DB_SCHEMA` - The database schema.
- `DB_WAIT_FOR_CONNECTION` - Whether to wait until a connection is available. Set to `"false"` to turn that off.
- `DB_CONNECTION_LIMIT` - Max number of active connections in the pool. Defaults to `10`.
- `DB_QUEUE_LIMIT` - How many connections can wait in the queue. Set to `0` for no limit. Defaults to `0`.

## Docker
To run the project in a docker container that will also set up the back-end service and
a database, `cd` into the project directory and run:
```sh
docker-compose -f docker/docker-compose.yml up
```
Then just go to http://localhost:8080/

## License
[Apache 2](LICENSE)
