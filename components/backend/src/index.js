const express = require('express');
const cors = require('cors')

const app = express();
const fs = require('fs')
const path = require('path')

app.use(cors({
    origin: '*',
}))
app.use(express.json({}))

const diskCache = process.env.DISK_CACHE_DIR

const defaultPort = 8008;

const { API_LISTENER_PORT = defaultPort } = process.env

app.get('/health', (req, res) => {
    res.json({ status: 'ro-covid backend up and running' })
})

app.post('/data/:option', (req, res) => {
    const { body: { date }, params: { option } } = req
    console.log(diskCache)
    const file = JSON.parse(fs.readFileSync(path.resolve(diskCache, 'data.json'), 'utf-8'))
    console.debug('received', option, date)
    switch (option) {
        case 'currentDay':
            res.json(file.currentDayStats)
            break;
        case 'perDay':
            if (date) {
                if (file.historicalData[date]) {
                    res.json(file.historicalData[date])
                } else {
                    res.status(400).json({ error: 'Day not found' })
                }
            } else {
                res.status(400).json({ error: 'Missing day body param' })
            }
            break;
        default:
            res.status(400).json({ error: 'Invalid option' })
    }
})

app.listen(API_LISTENER_PORT, () => {
    console.info('rocovid-19 backend started and listening on ' + API_LISTENER_PORT)
})
