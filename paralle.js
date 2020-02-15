var path = require('path'),
  async = require('async'), //https://www.npmjs.com/package/async
  newman = require('newman'),

  parametersForTestRun = {
    collection: path.join(__dirname, 'testing.postman_collection.json'), // your collection
    environment: path.join(__dirname, 'dev.postman_environment.json'), //your env
  };

parallelCollectionRun = function(done) {
  newman.run(parametersForTestRun, done);
};

// Runs the Postman sample collection thrice, in parallel.
async.parallel([
    parallelCollectionRun,
    parallelCollectionRun,
    parallelCollectionRun
  ],
  function(err, results) {
    err && console.error("err", err);

    results.forEach(function(result) {
      var failures = result.run.failures;
      
      
      console.info(failures.length ? errorFormat(failures) :
        `${result.collection.name} ran successfully.`);
    });
  });

  const errorFormat = (failures) => {
    let formated = '';

    failures.forEach(({source, error}) => {
        formated += `Request name: ${source.name}\n`
        formated += `Test name: ${error.test}\n`
        formated += error.message;
        formated += "\n---------------\n"
    })

    return formated;
  }