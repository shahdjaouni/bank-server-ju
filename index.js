const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const fs = require('fs')
const { promisify } = require('util')
const lockfile = require('proper-lockfile');
const Promise = require('bluebird');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)

const accounts = [
    {
        uid: '101',
        name: "Chandler",
        balance: 15000
    },
    {
        uid: '102',
        name: "Joey",
        balance: 100
    },
    {
        uid: '103',
        name: "Ross",
        balance: 10000
    },
]

app.get('/', (req, res) => res.send('Welcome to OS assignment ^_^'))

app.get('/details/:uid', async (req, res) => {
    const { uid } = req.params;
    const account = await readFile('./db.txt', uid)
    if (!account) return res.status(404).send('User not found');
    return res.status(200).send(account);
});

app.post('/deposit/:uid', async (req, res) => {
    const { uid } = req.params;
    const { amount } = req.body;
    await writeFile("./db.txt", uid, amount);
    const account = findAccount(uid);
    if (!account) return res.status(404).send('User not found');
    account.balance += amount

    return res.status(200).send(account);
});

app.post('/withdrawl/:uid', (req, res) => {
    const { uid } = req.params;
    const { amount } = req.body;

    const account = findAccount(uid);

    if (!account) return res.status(404).send('User not found');
    if (!checkBalance(amount, account)) return res.send('Balance is not enough');

    account.balance -= amount;
    return res.status(200).json(account);
});

const checkBalance = (amount, account) => account.balance >= amount;

const findAccount = (uid) => {
    const users = accounts.filter(acc => acc.uid === uid);
    if (users.length) return users[0];
    return null
}

const writeFile = (path, uid, amount) => {
    const retryOptions = {
        retries: {
            retries: 5,
            factor: 3,
            minTimeout: 1 * 1000,
            maxTimeout: 60 * 1000,
            randomize: true,
        }
    };

    let cleanup;
    return Promise.try(() => {
        return lockfile.lock(path, retryOptions);
    }).then(async release => {
        cleanup = release;

        let lines = await readFileAsync(path);
        lines = lines.toString();

        const line = await findLine(lines, uid);
        var regex = new RegExp(line);

        const lineData = line.split(' ');
        lineData[2] = +lineData[2] + amount;

        let replacement = lineData.join(" ");
        var result = lines.replace(regex, replacement);

        await writeFileAsync(path, result, 'utf8')
    }).then(() => {
        console.log('Finished!');
    }).catch((err) => {
        console.error(err);
    }).finally(() => {
        cleanup && cleanup();
    });
}

const findLine = (lines, uid) => {
    return new Promise(resolve => setTimeout(() => {
        let result = null;
        lines.split(/\r?\n/).forEach(function (line) {
            const lineData = line.split(' ');
            if (lineData[0] === uid)
                result = line
        });
        resolve(result)
    }, 500));
};

const readFile = async (path = './db.txt', uid) => {
    let account = null;

    const lines = await readFileAsync(path);
    lines.toString().split(/\r?\n/).forEach(function (line) {
        const lineData = line.split(' ');
        if (lineData[0] === uid)
            account = { uid: lineData[0], name: lineData[1], balance: lineData[2] };
    });

    return account;
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
