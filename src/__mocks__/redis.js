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
            on: function () {
                return new Promise((resolve, reject) => {
                    resolve(false)
                })
            }
        }
    }

}




module.exports = redis;