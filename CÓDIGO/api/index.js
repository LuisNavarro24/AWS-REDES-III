
import AWS from 'aws-sdk';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
const app = express()
const port = 3000
const TOKEN_SECRET = "tokensecret";
// Remember to set type: module in package.json or use .mjs extension
import fs from 'fs';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import mime from 'mime';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'path';
// File path
const __dirname = dirname(fileURLToPath(import.meta.url));
const userFile = join(__dirname, 'db/db_users.json')
const permissionFile = join(__dirname, 'db/db_permissions.json')
const recordFile = join(__dirname, 'db/db_records.json')
const scheduleFile = join(__dirname, 'db/db_schedules.json')
const instanceFile = join(__dirname, 'db/db_instances.json')

// Configure lowdb to write to JSONFile
const userAdapter = new JSONFile(userFile)
const userDB = new Low(userAdapter)

const permissionAdapter = new JSONFile(permissionFile)
const permissionDB = new Low(permissionAdapter)

const recordAdapter = new JSONFile(recordFile)
const recordDB = new Low(recordAdapter)

const scheduleAdapter = new JSONFile(scheduleFile)
const scheduleDB = new Low(scheduleAdapter)

const instanceAdapter = new JSONFile(instanceFile)
const instanceDB = new Low(instanceAdapter)

app.use(cors())
app.all('*', (res, req, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json())
app.use(express.json());



AWS.config.region = 'us-east-1';

const ACCESS_KEY = "AKIA5RSPQ77X2JWEB54H";
const SECRET_KEY = "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";

var getEC2Client = () => {
    return new AWS.EC2({
        credentials: {
            accessKeyId: ACCESS_KEY,
            secretAccessKey: SECRET_KEY
        }
    });
};

var getCredential = (req) => {
    var header = req.header("Authorization");
    if (!header) return null;
    try {
        var token = header.split(" ")[1];
        return jwt.verify(token, TOKEN_SECRET);
    }
    catch (ex) {
        return null;
    }
};

var sendError = (res, message) => {
    res.statusCode = 400;
    res.send({
        status: false,
        message: message
    });
};

var readDb = async () => {
    await userDB.read();
    userDB.data ||= { users: [] };
    await permissionDB.read();
    permissionDB.data ||= { permissions: [] };
    await scheduleDB.read();
    scheduleDB.data ||= { schedules: [] };
    await instanceDB.read();
    instanceDB.data ||= { instances: [] };
};

var readRecords = async () => {
    await recordDB.read();
    recordDB.data ||= { records: [] };
}

var startInstance = async (id) => {
    return new Promise((res, rej) => {
        var ec2 = getEC2Client();
        ec2.startInstances({ InstanceIds: [id] }, (err, data) => {
            if (err) {
                rej(false);
                return;
            } else {
                res(true); return
            }
        });
    });
};

var stopInstance = async (id) => {
    return new Promise((res, rej) => {
        var ec2 = getEC2Client();
        ec2.stopInstances({ InstanceIds: [id] }, (err, data) => {
            if (err) {
                rej(false);
                return;
            } else {
                res(true); return
            }
        });
    });
};
var getInstances = async () => {
    return new Promise((res, rej) => {
        var ec2 = getEC2Client();
        ec2.describeInstances(function (err, data) {
            if (err) {
                console.log(err, err.stack);
                res([]);
                return;
            } // an error occurred
            var instances = [];
            for (var reservation of data.Reservations) {
                for (var instance of reservation.Instances) {
                    instances.push({
                        instanceId: instance.InstanceId,
                        instanceType: instance.InstanceType,
                        platform: instance.Platform ? instance.Platform : 'linux',
                        publicIpAddress: instance.PublicIpAddress,
                        state: instance.State.Name,
                        name: instance.KeyName,
                        securityGroup: instance.SecurityGroups ? instance.SecurityGroups[0].GroupName : ""
                    });
                    // instances.push(instance);
                }
            }
            res(instances);
        });
    });
};

var loadInstances = async () => {
    await readDb();
    var instances = await getInstances();
    instanceDB.data.instances = instances;
    await instanceDB.write();
};
app.get('/api/', async (req, res) => {
    var instances = await getInstances();
    res.send(instances);
})

app.post('/api/start', async (req, res) => {
    var result = await startInstance(req.body.instanceId);
    if (!result) {
        result.send("ERROR");
        return;
    }
    res.send("OK")

})

app.post('/api/stop', async (req, res) => {
    var result = await stopInstance(req.body.instanceId);
    if (!result) {
        result.send("ERROR");
        return;
    }
    res.send("OK")
})


// usuarios
app.post('/api/users/login', async (req, res) => {
    await readDb();
    var user = userDB.data.users.find(x => x.name == req.body.name);
    if (!user) {
        res.statusCode = 400;
        res.send({
            mensaje: "No existe el usuario"
        });
        return;
    }

    if (user.password != req.body.password) {
        res.statusCode = 400;
        res.send({
            mensaje: "Credenciales incorrectas"
        });
        return;
    }

    var token = jwt.sign({
        id: user.id,
        name: user.name,
        type: user.type
    }, TOKEN_SECRET);
    res.send({
        token: token,
        type: user.type
    })
});

app.post('/api/users/signup', async (req, res) => {
    var credential = getCredential(req);
    await readDb();
    if ((credential == null || credential.type != "ADMIN") && userDB.data.users.length > 0) {
        res.statusCode = 400;
        res.send({
            mensaje: "Sin Permiso"
        });
        return;
    }

    var user = userDB.data.users.find(x => x.name == req.body.name);
    if (user != null) {
        res.statusCode = 400;
        res.send({
            mensaje: "Ya existe el usuario"
        });
        return;
    }
    var user = {
        id: uuidv4(),
        name: req.body.name,
        password: req.body.password,
        type: req.body.type
    };
    userDB.data.users.push(user)
    await userDB.write()
    var token = jwt.sign({
        id: user.id,
        name: user.name,
        type: user.type
    }, TOKEN_SECRET);
    res.send({
        token: token
    })
});

// permisos
app.post('/api/permissions', async (req, res) => {
    var credential = getCredential(req);
    if (!credential || credential.type != "ADMIN") {
        sendError(res, "Sin permisos");
        return;
    }

    await readDb();
    console.log(permissionDB.data, "data");

    var index = permissionDB.data.permissions.findIndex(x => x.userId == req.body.userId && x.instanceId == req.body.instanceId);
    var permission = {
        userId: req.body.userId,
        instanceId: req.body.instanceId,
        canList: req.body.canList,
        canStart: req.body.canStart,
        canStop: req.body.canStop
    };
    console.log(index);
    if (index < 0) {
        permissionDB.data.permissions.push(permission);
    } else {
        permissionDB.data.permissions[index] = permission;
    }

    await permissionDB.write();

    res.send({
        status: true
    })

});

app.get('/api/users/download', (req, res) => {

    var file = __dirname + '/db/db_users.json';

    var filename = path.basename(file);
    var mimetype = mime.lookup(file);

    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);

    var filestream = fs.createReadStream(file);
    filestream.pipe(res);
});

// CRON
import cron from 'node-cron';

var schedules = [];

var loadSchedules = async () => {
    schedules.forEach(s => s.stop());
    schedules = [];
    await readDb();

    scheduleDB.data.schedules.forEach(async (schedule) => {
        if (schedule.cron) {
            var task = cron.schedule(schedule.cron, async () => {
                console.log("working " + schedule.scheduleId + "_" + schedule.instanceId);
                if (schedule.type == true) {
                    await startInstance(schedule.instanceId)
                }
                else {
                    await stopInstance(schedule.instanceId)
                }
            }, { scheduled: false });
            schedules.push(task);
            task.start();
        }

    });
}
app.get('/api/schedules/:id', async (req, res) => {
    await readDb();


    res.send({
        schedules: scheduleDB.data.schedules.filter(x => x.instanceId == req.params.id)
    })
});

app.post('/api/schedules', async (req, res) => {
    await readDb();

    var index = scheduleDB.data.schedules
        .findIndex(x => x.scheduleId == req.body.scheduleId);
    var schdule = {
        scheduleId: index < 0 ? uuidv4() : req.body.scheduleId,
        cron: req.body.cron,
        instanceId: req.body.instanceId,
        type: req.body.type,
        name: req.body.name
    };
    console.log(index);
    if (index < 0) {
        scheduleDB.data.schedules.push(schdule);
    } else {
        scheduleDB.data.schedules[index] = schdule;
    }

    await scheduleDB.write();

    await loadSchedules();
    res.send({
        status: true
    })
});

app.delete('/api/schedules/:id', async (req, res) => {
    await readDb();
    console.log("DELETE SCHEDULE " + req.params.id)
    var index = scheduleDB.data.schedules
        .findIndex(x => x.scheduleId == req.params.id);
    console.log(index);
    if (index < 0) {
        res.send({ status: false });
        return;
    }

    scheduleDB.data.schedules.splice(index, 1);

    await scheduleDB.write();

    await loadSchedules();
    res.send({
        status: true
    })
});

await loadSchedules();

////////// usuarios

app.get('/api/users/:id', async (req, res) => {
    await readDb();

    console.log(req.params.id)
    res.send(userDB.data.users.find(x => x.id == req.params.id));

});

app.get('/api/users', async (req, res) => {
    await readDb();


    res.send(userDB.data.users)
});

app.post('/api/users', async (req, res) => {
    await readDb();

    var index = userDB.data.users
        .findIndex(x => x.id == req.body.id);

    var user = {
        id: index < 0 ? uuidv4() : req.body.id,
        name: req.body.name,
        password: req.body.password,
        type: req.body.type
    };
    console.log(index);
    if (index < 0) {
        userDB.data.users.push(user);
    } else {
        userDB.data.users[index] = user;
    }

    await userDB.write();

    res.send({
        status: true
    })
});

app.delete('/api/users/:id', async (req, res) => {
    await readDb();
    var index = userDB.data.users
        .findIndex(x => x.id == req.params.id);
    console.log(index);
    if (index < 0) {
        res.send({ status: false });
        return;
    }

    userDB.data.users.splice(index, 1);

    await userDB.write();

    res.send({
        status: true
    })
});

app.get('/api/records/:instanceId', async (req, res) => {
    await readRecords();
    var instanceId = req.params.instanceId;
    res.send(recordDB.data.records.filter(x => x.instanceId == instanceId))
});
// var ping = require('ping');
import moment from 'moment';
import ping from 'ping';
setInterval(async () => {
    // hacer pings
    await readDb();
    await readRecords();
    var date = moment().format("YYYY-MM-DDTHH:mm:00");
    instanceDB.data.instances.forEach(async (i) => {
        if (i.instanceId && i.publicIpAddress) {
            ping.sys.probe(i.publicIpAddress, async (isAlive) => {
                var f = recordDB.data.records.find(x => x.date == date);
                if (isAlive && f == null) {
                    recordDB.data.records.push({
                        recordId: uuidv4(),
                        instanceId: i.instanceId,
                        date: date,
                        type: 0
                    })
                    await recordDB.write();
                }
            });
        }
    });


}, 5000);

app.use('/', express.static('../www'));
loadInstances();

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})