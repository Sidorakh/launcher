import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import 'firebase/compat/analytics';
import axios from 'axios';

firebase.initializeApp(require('./firebase-config.json'));

const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();
const analytics = firebase.analytics();

const client = axios.create({
    baseURL: window.location.protocol + '//' + window.location.host,
});

export {
    client as axios,
    firebase,
    auth,
    firestore,
    storage,
    analytics,
}