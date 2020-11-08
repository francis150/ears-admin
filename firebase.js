const firebase = require('firebase')
require('firebase/database')
require('firebase/auth')

var firebaseConfig = {
    apiKey: "AIzaSyBqXc1h5LblV1ZvQc-R35a0oW4Dp3H-MEY",
    authDomain: "ears-control.firebaseapp.com",
    databaseURL: "https://ears-control.firebaseio.com",
    projectId: "ears-control",
    storageBucket: "ears-control.appspot.com",
    messagingSenderId: "622124551475",
    appId: "1:622124551475:web:e94e8df3358353e1acc246",
    measurementId: "G-JZREHCGDWB"
};

firebase.initializeApp(firebaseConfig);

module.exports = firebase