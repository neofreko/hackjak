var config = require('./config').config;
var db = require("seraph")({
    server: config.server
})

// you need to do it one by one from tp1 to tp6
var data = require('./tp6').data;
var Q = require('q');

function ensureUnique() {
    var deferred = Q.defer();

    db.constraints.uniqueness.createIfNone('PoI', 'unique_key', function(err, constraint) {
        console.log('created contraint for label PoI', constraint);
        deferred.resolve(constraint)
    })

    return deferred.promise;
}

function poi_find(predicate) {
    var deferred = Q.defer();

    db.find(predicate,
        function(err, objs) {
            if (err) deferred.reject(new Error(err));
            deferred.resolve(objs);
        }
    );
    return deferred.promise;
}

function poi_insert(rute, trayek) {
    console.log('inserting ', rute);

    var deferred = Q.defer();

    poi_find({
        name: rute,
        wilayah: trayek.wilayah
    }).then(function(results) {
        if (results.length) {
            console.log('object found. returning ', results);
            deferred.resolve(results);
        } else {
            db.save({
                    name: rute,
                    wilayah: trayek.wilayah,
                    unique_key: rute + '__' +
                        trayek.wilayah
                },
                'PoI',
                function(err, node) {
                    if (err) {
                        console.log('node already exists. invoking poi_find ');
                        deferred.resolve(poi_find({
                            name: rute,
                            wilayah: trayek.wilayah
                        }));
                    };
                    console.log("rute ", rute, " inserted.");

                    deferred.resolve(node);
                });
        }
    })

    return deferred.promise;
}

function poi_connect(poi1, poi2, trayek) {
    var deferred = Q.defer();

    console.log('should connect ', poi1.name, ' to ', poi2.name, ' for trayek ', trayek.noTrayek);
    //throw 'fuk'
    //deferred.resolve(true);
    db.relate(poi1.id, 'CONNECT_TO', poi2.id, {
        using: trayek.noTrayek
    }, function(err, relationship) {
        if (err) {
            throw err;
            //ignore
            console.log('shit happened, but probably OK')
        } else {
            console.log('connected ', poi1.name, ' to ', poi2.name, ' using ', trayek.noTrayek);
        }

        deferred.resolve(relationship);
    });

    return deferred.promise;
}

function iterateTrayeks() {
    var trayeks = data.result
    var promise = Q.fcall(function() {});

    trayeks.forEach(function(elm) {
        var promise_link = function() {
            console.log('Processing trayek: ', elm.noTrayek)
            var routes = elm.ruteBerangkat;
            routes.concat(elm.ruteKembali);

            return iterateRoutes(routes, elm)
        }

        promise = promise.then(promise_link)
    })

    console.log('Iterates trayeks returning promise ', promise)
    return promise
}

function iterateRoutes(routes, trayek) {
    var promises = []

    routes.forEach(function(elm, index, arr) {
        console.log('Processing rute ', elm, ' on trayek ', trayek.noTrayek)
        var insert_current_rute = poi_insert(elm, trayek);
        var insert_next_rute = function() {
            console.log('last node in trayek: ', trayek.noTrayek)
        }
        if (index < arr.length - 1) {
            var next_rute = arr[index + 1];

            insert_next_rute = poi_insert(next_rute, trayek)
        }

        var promise_link = Q.spread(
            [insert_current_rute, insert_next_rute],
            function(poi1, poi2) {
                if (typeof(poi2) === 'function') {
                    poi2()
                } else {
                    console.log('connects it ', poi1, poi2)
                    return poi_connect(poi1[0], poi2[0], trayek)
                }
            })

        promises.push(promise_link)
    })
    console.log('Iterates routes returning promise ', promises)

    return promises.reduce(Q.when, Q(1));
}

Q.fcall(ensureUnique)
    .then(iterateTrayeks)
    .then(function(status) {
        console.log('status: ', status)
    })
    .then(function() {
        console.log('phew!')
    }).fail(function(err) {
        console.log(err, err.stack)
    })
