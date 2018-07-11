const reporter = require('cucumber-html-reporter');

const options = {
        theme: 'bootstrap',
        jsonFile: 'reports/BlockChainExplorerPubSub_report.json',
        output: 'reports/BlockChainExplorerPubSub_report.html',
        reportSuiteAsScenarios: true,
        launchReport: true,
        metadata: {
            "App Version":"TBA",
        }
    };

    reporter.generate(options);