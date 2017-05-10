import { Http, BaseRequestOptions, Response, ResponseOptions, RequestMethod } from '@angular/http';
//import { MockBackend, MockConnection } from '@angular/http/testing';
import "reflect-metadata";
import {Table, Column, PrimaryGeneratedColumn} from "typeorm";
//import {Photo} from './photos'

import "reflect-metadata";
import {createConnection} from "typeorm";
//import {Photo} from "./entity/Photo";

createConnection({
    driver: {
        type: "postgres",
        host: "c3tech.cby3iao8ulmu.us-west-2.rds.amazonaws.com",
        port: 5432,
        username: "geoadmin",
        password: "G30s3rv3r",
        database: "kokomo"
    },
    entities: [
        //Photo
    ],
    autoSchemaSync: true,
}).then(connection => {
    // here you can start to work with your entities
});
        