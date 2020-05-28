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

Then you can run it in development mode using `npm start` or create a production build
that can be served by a web server using `npm run build`.

Note that this app requires a dedicated backend that should be installed separately from
https://github.com/chb/pop-health-app-server. Alternatively, you can use Docker (see below)
to run both the front-end, backend and a sample database server.

## Docker
To run the project in a docker container that will also set up the back-end service and
a database, `cd` into the project directory and run:
```sh
docker-compose -f docker/docker-compose.yml up
```
Then just go to http://localhost:8080/

## License
[Apache 2](LICENSE)
