
let redis = {
    createClient: function () {
        return {
            getAsync: function () {
                return new Promise((resolve, reject) => {
                    resolve(false)
                })
            },
            existsAsync: function () {
                return new Promise((resolve, reject) => {
                    resolve(false)
                })
            },
            setAsync: function () {
                return new Promise((resolve, reject) => {
                    resolve(false)
                })
            },
            set: function () {
                return new Promise((resolve, reject) => {
                    resolve(false)
                })
            },
            get: function (data, callback) {
                if(typeof callback == "function") {
                    callback(false, JSON.stringify({status:"completed"}))
                }
                else{
                    return new Promise((resolve, reject) => {
                        resolve(false)
                    })
                }
            },
            on: function () {
                return new Promise((resolve, reject) => {
                    resolve("testValue")
                })
            },
            get: function () {
                return new Promise((resolve, reject) => {
                    resolve("testValue")
                })
            }
        }
    }

}




module.exports = redis;