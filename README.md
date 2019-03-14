# blockchain-explorer-pubsub


## Running in a deployed environment

When the application is launched in a deployed environment we make no assumptions about the environment variables within the app, we explicitly set the variables as we launch < < pm2? > >.

This is mentioned here as a handy guide to pointing local applications to other services, and a reminder that developers adding new requirements would be advised to update the devOps team!

Required environment parameters vary per envoirement, if using pm2 you could check the following files, or the convict config on src/config

For master - _startup.yml
for housekeeper - _housekeeper.yml
for deferred - _deferred.yml

eg:
```bash
// TODO
// example

curl -u <USER>:<PASSWORD> https://pillarproject.jfrog.io/pillarproject/api/npm/auth >> .npmrc

npm pack [content of pillar-bcx-pubsub.txt] --registry https://pillarproject.jfrog.io/pillarproject/api/npm/npm/

tar -xvf pillar-bcx-pubsub-*.tgz

cd package/

cp ../.npmrc .

npm install

//TODO write values into a process.yml file

pm2 start process.yml

```

### Migrations

 To create a new migration file execute the command

  ```
npm run migrate:create <migrationName>
```

 Write your code inside the up and down methods

 ```
module.exports.up = function (next) {
  next()
}
 module.exports.down = function (next) {
  next()
}
```

 Execute all migrations (up method) with the command

 ```
npm run migrate
```

 You can also run migrations incrementally by specifying a migration

 ```
npm run migrate:up <migrationFullName>
```

 This will run up-migrations up to (and including) <migrationFullName>

 Execute all migrations (down method) with the command

 ```
npm run migrate:down
```