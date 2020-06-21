'use strict';

import * as functions from 'firebase-functions';
import { firestore, initializeApp } from 'firebase-admin';
import { CrudService } from './crudService';

const MOCK_USER = false
const COLLECTION_OFFER = 'offer'
const COLLECTION_RESERVATION = 'reservation'
const COLLECTION_NOTIFICATION_TOKEN = 'notificationToken'
const COLLECTION_USER = 'reservation'

initializeApp();

const db: firestore.Firestore = firestore()
const crudService: CrudService = new CrudService(db)

const getLoggedUser = (context: functions.https.CallableContext) => MOCK_USER ? "iXeDCUW0NBW6kX4ZOhpAYJcydAR2" : context.auth?.uid

const create = (collectionName: string) =>
    (data: any, context: functions.https.CallableContext) =>
        crudService.create(collectionName, data, getLoggedUser(context))
const update = (collectionName: string) =>
    (data: any, context: functions.https.CallableContext) =>
        crudService.update(collectionName, data.id, data)
const getAll = (collectionName: string) =>
    (request: functions.https.Request, response: functions.Response<any>) =>
        crudService.getAll(collectionName, request.query, (data: any) => response.send(data));
const get = (collectionName: string) =>
    (request: functions.https.Request, response: functions.Response<any>) =>
        crudService.getById(collectionName, request.params[0].substr(1), (data) =>
            data ? response.send(data) : response.status(404).send({ error: "Not Found" }))

export const createOffer = functions.https.onCall(create(COLLECTION_OFFER))
export const updateOffer = functions.https.onCall(update(COLLECTION_OFFER));
export const getOffers = functions.https.onRequest(getAll(COLLECTION_OFFER));
export const getOffer = functions.https.onRequest(get(COLLECTION_OFFER));

export const createReservation = functions.https.onCall(create(COLLECTION_RESERVATION))
export const updateReservation = functions.https.onCall(update(COLLECTION_RESERVATION));
export const getReservations = functions.https.onRequest(getAll(COLLECTION_RESERVATION));
export const getReservation = functions.https.onRequest(get(COLLECTION_RESERVATION));

export const createNotificationToken = functions.https.onCall(create(COLLECTION_NOTIFICATION_TOKEN))
export const updateNotificationToken = functions.https.onCall(update(COLLECTION_NOTIFICATION_TOKEN));
export const getNotificationTokens = functions.https.onRequest(getAll(COLLECTION_NOTIFICATION_TOKEN));
export const getNotificationToken = functions.https.onRequest(get(COLLECTION_NOTIFICATION_TOKEN));

export const createUser = functions.https.onCall(create(COLLECTION_USER))
export const updateUser = functions.https.onCall(update(COLLECTION_USER));
export const getUsers = functions.https.onRequest(getAll(COLLECTION_USER));
export const getUser = functions.https.onRequest(get(COLLECTION_USER));