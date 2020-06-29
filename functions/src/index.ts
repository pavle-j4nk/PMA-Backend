'use strict';

import * as functions from 'firebase-functions';
import { firestore, initializeApp, messaging } from 'firebase-admin';
import { CrudService } from './crudService';

const MOCK_USER = false
const COLLECTION_OFFER = 'offer'
const COLLECTION_RESERVATION = 'reservation'
const COLLECTION_NOTIFICATION_TOKEN = 'notificationToken'
const COLLECTION_NOTIFICATION = 'notifications'
const COLLECTION_USER = 'reservation'
const COLLECTION_COMMENTS = 'comments'
initializeApp();

const db: firestore.Firestore = firestore()
const crudService: CrudService = new CrudService(db)
const httpsFunctions = functions.region('europe-west3').https

const getLoggedUser = (context: functions.https.CallableContext) => MOCK_USER ? "iXeDCUW0NBW6kX4ZOhpAYJcydAR2" : context.auth?.uid

const getDocumentIdFromRequest = (request: functions.https.Request) => {
    if (request.params && request.params[0].substr(1)) {
        return request.params[0].substr(1);
    } else if (request.query.id) {
        return request.query.id
    } else {
        return request.body.data.id
    }
}

const create = (collectionName: string) =>
    (data: any, context: functions.https.CallableContext) =>
        crudService.create(collectionName, data, getLoggedUser(context))
const update = (collectionName: string) =>
    (data: any, context: functions.https.CallableContext) =>
        crudService.update(collectionName, data.id, data)
const getAll = (collectionName: string) =>
    (request: functions.https.Request, response: functions.Response<any>) =>
        crudService.getAll(collectionName, { ...request.query, ...request.body.data }, (data: any) => response.send(data));
const get = (collectionName: string) =>
    (request: functions.https.Request, response: functions.Response<any>) =>
        crudService.getById(collectionName, getDocumentIdFromRequest(request), (data) =>
            data ? response.send(data) : response.status(404).send({ error: "Not Found" }));

export const sendNotification = functions.https.onCall((data, context) => {

    //for testing use token of your device
    const registrationToken = data.userToken;
    const message = {
        notification: {
            title: data.titel,
            body: 'You recive notification from user' + data.userName
        },
        token: registrationToken
    };

    // Send a message to devices subscribed to the combination of topics
    // specified by the provided condition.
    messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });
});

export const createOffer = httpsFunctions.onCall(create(COLLECTION_OFFER))
export const updateOffer = httpsFunctions.onCall(update(COLLECTION_OFFER));
export const getOffers = httpsFunctions.onRequest(getAll(COLLECTION_OFFER));
export const getOffer = httpsFunctions.onRequest(get(COLLECTION_OFFER));

export const createReservation = httpsFunctions.onCall(create(COLLECTION_RESERVATION))
export const updateReservation = httpsFunctions.onCall(update(COLLECTION_RESERVATION));
export const getReservations = httpsFunctions.onRequest(getAll(COLLECTION_RESERVATION));
export const getReservation = httpsFunctions.onRequest(get(COLLECTION_RESERVATION));

export const createNotificationToken = httpsFunctions.onCall(create(COLLECTION_NOTIFICATION_TOKEN))
export const updateNotificationToken = httpsFunctions.onCall(update(COLLECTION_NOTIFICATION_TOKEN));
export const getNotificationTokens = httpsFunctions.onRequest(getAll(COLLECTION_NOTIFICATION_TOKEN));
export const getNotificationToken = httpsFunctions.onRequest(get(COLLECTION_NOTIFICATION_TOKEN));

export const createUser = httpsFunctions.onCall(create(COLLECTION_USER))
export const updateUser = httpsFunctions.onCall(update(COLLECTION_USER));
export const getUsers = httpsFunctions.onRequest(getAll(COLLECTION_USER));
export const getUser = httpsFunctions.onRequest(get(COLLECTION_USER));

export const createNotification = httpsFunctions.onCall(create(COLLECTION_NOTIFICATION))
export const updateNotification = httpsFunctions.onCall(update(COLLECTION_NOTIFICATION));
export const getNotifications = httpsFunctions.onRequest(getAll(COLLECTION_NOTIFICATION));
export const getNotification = httpsFunctions.onRequest(get(COLLECTION_NOTIFICATION));

export const createComment = httpsFunctions.onCall(create(COLLECTION_COMMENTS))
export const updateComment = httpsFunctions.onCall(update(COLLECTION_COMMENTS));
export const getComments = httpsFunctions.onRequest(getAll(COLLECTION_COMMENTS));
export const getComment = httpsFunctions.onRequest(get(COLLECTION_COMMENTS));