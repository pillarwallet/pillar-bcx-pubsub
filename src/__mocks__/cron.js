const start = () => {
    return "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d"
}

class CronJob {
    constructor() {
    }

    start() {
        return start
    }
}


let cron = {
    CronJob: CronJob

}


module.exports = cron;