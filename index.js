const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


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

app.get('/details/:uid', (req, res) => {
    const { uid } = req.params;
    const account = findAccount(uid);
    if(!account) return res.status(404).send('User not found');
    return res.status(200).send(account);
});

app.post('/deposit/:uid', (req, res) => {
    const { uid } = req.params;
    const { amount } = req.body;

    const account = findAccount(uid);
    if(!account) return res.status(404).send('User not found');
    account.balance += amount

    return res.status(200).send(accounts);
});

app.post('/withdrawl/:uid', (req, res) => {
    const { uid } = req.params;
    const { amount } = req.body;

    const account = findAccount(uid);

    if(!account) return res.status(404).send('User not found');
    if (!checkBalance(amount, account)) return res.send('Balance is not enough');
    
    account.balance -= amount;
    return res.status(200).json(accounts);
});

const checkBalance = (amount, account) => account.balance >= amount;

const findAccount = (uid) => {
    const users = accounts.filter(acc =>  acc.uid === uid);
    if (users.length) return users[0];
    return null
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
