#!/bin/bash

reportsDirectory=./reports

mkdir -p $reportsDirectory

result=$(./node_modules/.bin/cucumber-js ./cucumber/features -r ./cucumber/step-definitions --tags=@automation-complete -f json:$reportsDirectory/cucumber_report.json)

errorCode=$?

node ./cucumber/glue/pubsub-format-report

exit $errorCode