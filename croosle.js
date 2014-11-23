/* settings */
var listen_port         = 7777;
var db_connection       = "croosle.db";
var socket_interval     = 1000; //once a second
var db_write_interval   = 60 * 1000; //once a minute

/* imports */
var SensorTag = require("sensortag");
var prompt    = require('prompt');
var util      = require('util');
var async     = require('async');
var sqlite3   = require("sqlite3");

var connected   = 0;
var subscribed  = 0;
var writingdb   = 0;
var writingio   = 0;

/* data */
var _sensorTag = null;
var _db        = null;
var _data      = new Object();

/* hello croosle users */
print_banner();
print_help();
prompt.start();

function p() {
    prompt.get(['command'], function (err, result) {
        var c = result.command.toLowerCase();

        if (result.command == "c") {
        	console.log('searching');
            
            SensorTag.discover(function (sensorTag) {
                console.log('connecting');

                //disconnect callback
                sensorTag.on('disconnect', function () {
                    console.log('disconnected ', new Date());

                    //if disconnect occurs stop writing to db
                    if (writingdb == 1) {
                        writingdb = 0;
                        _db.close();
                    }

                    //stop emiting socket
                    if (writingio == 1) {
                        writingio = 0;
                    }

                });

                async.series([

                    function (callback) {
                        console.log('connect', new Date());
                        sensorTag.connect(callback);
                    },
                    function (callback) {
                        //connected to new device
                        connected   = 1;
                        subscribed  = 0;
                        writingdb   = 0;
                        writingio   = 0;
                        _sensorTag  = sensorTag;
                        sensorTag.discoverServicesAndCharacteristics(callback);
                    },
                    function (callback) {
                        sensorTag.readSystemId(function (systemId) {
                            console.log('uuid: ' + systemId);
                            _data.uuid = systemId;
                            callback();
                        });
                    },
                    //prizgemo se vse senzorje
                    function (callback) {
                        console.log('enableIrTemperature');
                        _sensorTag.enableIrTemperature(callback);
                    },
                    function (callback) {
                        console.log('enableAccelerometer');
                        _sensorTag.enableAccelerometer(callback);
                    },
                    function (callback) {
                        console.log('enableHumidity');
                        _sensorTag.enableHumidity(callback);
                    },
                    function (callback) {
                        console.log('enableMagnetometer');
                        _sensorTag.enableMagnetometer(callback);
                    },
                    function (callback) {
                        console.log('enableBarometricPressure');
                        _sensorTag.enableBarometricPressure(callback);
                    },
                    function (callback) {
                        console.log('enableGyroscope');
                        _sensorTag.enableGyroscope(callback);
                    },
                    //buttons
                    function (callback) {
                        _sensorTag.on('simpleKeyChange', function (left, right) {
                            console.log('\n[left: ', left, ',right: ', right, ']');
                            if (left && right) {
                                _sensorTag.notifySimpleKey(callback);
                            }
                        });
                        _sensorTag.notifySimpleKey(callback);
                    },
                    function (callback) {
                        p(); //prompt
                    }
                ]);
            });
        } else if (result.command == "i") {
            if (connected == 1) {
                async.series([
                    function (callback) {
                        _sensorTag.readDeviceName(function (deviceName) {
                            console.log('device name = ' + deviceName);
                            callback();
                        });
                    },
                    function (callback) {
                        _sensorTag.readSystemId(function (systemId) {
                            console.log('system id = ' + systemId);
                            callback();
                        });
                    },
                    function (callback) {
                        _sensorTag.readSerialNumber(function (serialNumber) {
                            console.log('serial number = ' + serialNumber);
                            callback();
                        });
                    },
                    function (callback) {
                        _sensorTag.readFirmwareRevision(function (firmwareRevision) {
                            console.log('firmware revision = ' + firmwareRevision);
                            callback();
                        });
                    },
                    function (callback) {
                        _sensorTag.readHardwareRevision(function (hardwareRevision) {
                            console.log('hardware revision = ' + hardwareRevision);
                            callback();
                        });
                    },
                    function (callback) {
                        _sensorTag.readHardwareRevision(function (softwareRevision) {
                            console.log('software revision = ' + softwareRevision);
                            callback();
                        });
                    },
                    function (callback) {
                        _sensorTag.readManufacturerName(function (manufacturerName) {
                            console.log('manufacturer name = ' + manufacturerName);
                            callback();
                        });
                    },
                    function (callback) {
                        console.log('connected  :' + connected);
                        console.log('subscribed :' + subscribed);
                        console.log('database   :' + writingdb + ' (' + db_connection + ' every ' + db_write_interval + ' ms)');
                        console.log('socket     :' + writingio + ' (http://localhost:' + listen_port + '/socket.io/socket.io.js)');
                        p(); //prompt
                    }
                ]);
            } else {
                console.log('not connected');
                p(); //prompt
            }
        } else if (result.command == "p") {
            console.log('data :\n' + JSON.stringify(_data));
            p(); //prompt
        } else if (result.command == "d") {
            if (connected == 1) {
                async.series([
                    function (callback) {
                        console.log('disableIrTemperature');
                        _sensorTag.disableIrTemperature(callback);
                    },
                    function (callback) {
                        console.log('disableAccelerometer');
                        _sensorTag.disableAccelerometer(callback);
                    },
                    function (callback) {
                        console.log('disableHumidity');
                        _sensorTag.disableHumidity(callback);
                    },
                    function (callback) {
                        console.log('disableMagnetometer');
                        _sensorTag.disableMagnetometer(callback);
                    },
                    function (callback) {
                        console.log('disableBarometricPressure');
                        _sensorTag.disableBarometricPressure(callback);
                    },
                    function (callback) {
                        console.log('disableGyroscope');
                        _sensorTag.disableGyroscope(callback);
                    },
                    function (callback) {
                        _sensorTag.disconnect(function () {
                            connected = 0;
                            p();
                        });
                    }
                ]);
            } else {
                console.log('not connected');
                p(); //prompt
            }
        } else if (result.command == "r") {
            if (connected == 1) {
                async.series([
                    function (callback) {
                        _sensorTag.readIrTemperature(function (objectTemperature, ambientTemperature) {
                            console.log('object temperature = %d °C', objectTemperature);
                            console.log('ambient temperature = %d °C', ambientTemperature);
                            callback();
                        });
                    },
                    function (callback) {
                        _sensorTag.readAccelerometer(function (x, y, z) {
                            console.log('x = %d G', x);
                            console.log('y = %d G', y);
                            console.log('z = %d G', z);
                            callback();
                        });
                    },
                    function (callback) {
                        _sensorTag.readHumidity(function (temperature, humidity) {
                            console.log('temperature = %d °C', temperature);
                            console.log('humidity = %d %', humidity);
                            callback();
                        });
                    },
                    function (callback) {
                        _sensorTag.readMagnetometer(function (x, y, z) {
                            console.log('x = %d μT', x);
                            console.log('y = %d μT', y);
                            console.log('z = %d μT', z);
                            callback();
                        });
                    },
                    function (callback) {
                        _sensorTag.readBarometricPressure(function (pressure) {
                            console.log('pressure = %d mBar', pressure);
                            callback();
                        });
                    },
                    function (callback) {
                        _sensorTag.readGyroscope(function (x, y, z) {
                            console.log('x = %d °/s', x);
                            console.log('y = %d °/s', y);
                            console.log('z = %d °/s', z);
                            callback();
                        });
                    },
                    function (callback) {
                        p(); //prompt
                    }
                ]);
            } else {
                console.log('not connected');
                p(); //prompt
            }
        } else if (result.command == "s") {
            if (connected == 1) {
                if (subscribed == 1) {
                    async.series([
                        function (callback) {
                            _sensorTag.unnotifyIrTemperature(function () {});
                            callback();
                        },
                        function (callback) {
                            _sensorTag.unnotifyAccelerometer(function () {});
                            callback();
                        },
                        function (callback) {
                            _sensorTag.unnotifyHumidity(function () {});
                            callback();
                        },
                        function (callback) {
                            _sensorTag.unnotifyMagnetometer(function () {});
                            callback();
                        },
                        function (callback) {
                            _sensorTag.unnotifyBarometricPressure(function () {});
                            callback();
                        },
                        function (callback) {
                            _sensorTag.unnotifyGyroscope(function () {});
                            callback();
                        },
                        function (callback) {
                            console.log("unsubscribed");
                            subscribed = 0;
                            p(); //prompt
                        }
                    ]);
                } else {
                    async.series([
                        function (callback) {
                            _sensorTag.on('irTemperatureChange', function (objectTemperature, ambientTemperature) {
                                _data.irtemperatureObject = objectTemperature;
                                _data.irtemperatureAmbient = ambientTemperature;
                            });

                            _sensorTag.notifyIrTemperature(function () {});
                            callback();
                        },
                        function (callback) {
                            _sensorTag.on('accelerometerChange', function (x, y, z) {
                                _data.accelerometerX = x;
                                _data.accelerometerY = y;
                                _data.accelerometerZ = z;
                            });

                            _sensorTag.notifyAccelerometer(function () {});
                            callback();
                        },
                        function (callback) {
                            //todo
                            _sensorTag.setAccelerometerPeriod(10, function () {});
                            callback();
                        },
                        function (callback) {
                            _sensorTag.on('humidityChange', function (temperature, humidity) {
                                _data.temperature = temperature;
                                _data.humidity = humidity;
                            });

                            _sensorTag.notifyHumidity(function () {});
                            callback();
                        },
                        function (callback) {
                            _sensorTag.on('magnetometerChange', function (x, y, z) {
                                _data.magnetometerX = x;
                                _data.magnetometerY = y;
                                _data.magnetometerZ = z;
                            });

                            _sensorTag.notifyMagnetometer(function () {});
                            callback();
                        },
                        function (callback) {
                            //todo
                            _sensorTag.setMagnetometerPeriod(10, function () {});
                            callback();
                        },
                        function (callback) {
                            _sensorTag.on('barometricPressureChange', function (pressure) {
                                _data.barometricPressure = pressure;
                            });

                            _sensorTag.notifyBarometricPressure(function () {});
                            callback();
                        },
                        function (callback) {
                            _sensorTag.on('gyroscopeChange', function (x, y, z) {
                                _data.gyroscopeX = x;
                                _data.gyroscopeY = y;
                                _data.gyroscopeZ = z;
                            });

                            _sensorTag.notifyGyroscope(function () {});
                            callback();
                        },
                        function (callback) {
                            //todo
                            //_sensorTag.changeGyroscopePeriod(10, function () {});
                            callback();
                        },
                        function (callback) {
                            console.log("subscribed");
                            subscribed = 1;
                            p(); //prompt
                        }
                    ]);
                }
            } else {
                console.log('not connected');
                p(); //prompt
            }
        } else if (result.command == "db") {
            if ((connected == 1) && (subscribed == 1) && writingdb == 0) {
                writingdb = 1;
                console.log("DB write");
                _db = new sqlite3.Database("croosle.db");
                _db.run("create table if not exists sensortag (uuid string, captured integer, gyroscopeX real, gyroscopeY real, gyroscopeZ real, irtemperatureObject real, irtemperatureAmbient real, barometricPressure real, accelerometerX real, accelerometerY real, accelerometerZ real, temperature real, humidity real, magnetometerX real, magnetometerY real, magnetometerZ real)", function () {
                    next_write();
                });
            } else {
                console.log('not connected/not subscribed/allready writing');
            }
            p(); //prompt
        } else if (result.command == "io") {
            if ((connected == 1) && (subscribed == 1)) {
                console.log("IO open");
                writingio = 1;
            } else {
                console.log('not connected/not subscribed');
            }
            p(); //prompt
        } else if (result.command == "q") {
            if (connected == 1) {
                console.log('disconnect first');
                p(); //prompt
            } else {
                console.log('bye');
                process.exit();
            }
        } else if (result.command == "x") {
            console.log('bye');
            process.exit();
        } else if (result.command == "h") {
            print_help();
            p(); //prompt
        } else {
            console.log('illegal command');
            print_help();
            p(); //prompt
        }
    });
}

p(); //prompt

function print_help() {
    console.log('Commands:');
    console.log('h (help)');

    if (connected == 1) {
        console.log('c (connect) [***connected***]');
    } else {
        console.log('c (connect)');
    }

    console.log('i (info)');
    console.log('p (print data)');
    console.log('r (read sensors)');

    if (subscribed == 1) {
        console.log('s (unsubscribe to sensors) [***subscribed***]');
    } else {
        console.log('s (subscribe to sensors)');
    }

    if (writingdb == 1) {
        console.log('db (stop writing data to database) [***writing***]');
    } else {
        console.log('db (write data to database)');
    }

    if (writingio == 1) {
        console.log('io (close io socket) [***open***]');
    } else {
        console.log('io (open io socket)');
    }

    console.log('d (Disconnect)');
    console.log('q (Quit)');
    console.log('x (Exit)');
    console.log('');
}

function next_write() {
    if (writingdb == 1) {
        _data.captured = Math.round(new Date().getTime() / 1000);

        var stmt = _db.prepare("insert into sensortag (uuid, captured, gyroscopeX, gyroscopeY, gyroscopeZ, irtemperatureObject, irtemperatureAmbient, barometricPressure, accelerometerX, accelerometerY, accelerometerZ, temperature, humidity, magnetometerX, magnetometerY, magnetometerZ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");

        stmt.run(_data.uuid, _data.captured, _data.gyroscopeX, _data.gyroscopeY, _data.gyroscopeZ, _data.irtemperatureObject, _data.irtemperatureAmbient, _data.barometricPressure, _data.accelerometerX, _data.accelerometerY, _data.accelerometerZ, _data.temperature, _data.humidity, _data.magnetometerX, _data.magnetometerY, _data.magnetometerZ);

        stmt.finalize();
    }
    setTimeout(next_write, db_write_interval);
}

/*socket*/
app = require('express.io')();
app.http().io();
app.listen(listen_port)

app.io.sockets.on('connection', function (socket) {
    setTimeout(function next() {
        _data.captured = Math.round(new Date().getTime() / 1000);
        if (writingio == 1) {
            socket.emit('sensor', {
                data: _data
            });
        }
        setTimeout(next, socket_interval);
    }, socket_interval);
});

// Send the client html.
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/client.html')
})

function print_banner() {
    console.log('   _____ _____   ____   ____   _____ _      ______ \r\n  \/ ____|  __ \\ \/ __ \\ \/ __ \\ \/ ____| |    |  ____|\r\n | |    | |__) | |  | | |  | | (___ | |    | |__   \r\n | |    |  _  \/| |  | | |  | |\\___ \\| |    |  __|  \r\n | |____| | \\ \\| |__| | |__| |____) | |____| |____ \r\n  \\_____|_|  \\_\\\\____\/ \\____\/|_____\/|______|______|\r\n');
}