"use strict";
//import { MockBackend, MockConnection } from '@angular/http/testing';
require("reflect-metadata");
var photos_1 = require('./photos');
require("reflect-metadata");
var typeorm_1 = require("typeorm");
//import {Photo} from "./entity/Photo";
typeorm_1.createConnection({
    driver: {
        type: "postgres",
        host: "c3tech.cby3iao8ulmu.us-west-2.rds.amazonaws.com",
        port: 5432,
        username: "geoadmin",
        password: "G30s3rv3r",
        database: "kokomo"
    },
    entities: [
        photos_1.Photo
    ],
    autoSchemaSync: true
}).then(function (connection) {
    // here you can start to work with your entities
});
