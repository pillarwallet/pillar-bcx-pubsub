var Redlock = require('redlock');

var migrate = require('migrate')

const redis = require("redis");
let client = redis.createClient();
var logger = require("./src/utils/logger");

const resource = "executing-migration";
const ttl = 600000;



var redlock = new Redlock(
	[client],
	{
		retryCount: 0
	}
);


redlock.lock(resource, ttl, function (err, lock) {
	if (err) {
		logger.info("Lock not adquired, migrations already running or redis down?", err);
		process.exit();
	}else{
		try{
		migrate.load(
			{
				stateStore: ".migrate"
			},
			function (err, set) {
				if (err) {
					throw err;
				}
				set.up(function (err) {
					if (err) {
						throw err;
					}
					logger.info("migrations successfully ran");
					lock.unlock(function (err) {
						if(err){
							logger.error("Failed to unlock", err);
							throw err;
						}
						process.exit();
					});
				});
			}
		);
		} catch (err){
			logger.error("Failed running migration", err);
			lock.unlock(function (err) {
				if (err) {
					logger.error("Failed to unlock", err);
					throw err;
				}
				process.exit();

			});
		}
	}
});

