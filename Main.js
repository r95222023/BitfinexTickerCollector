// const os = require('os');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const BFX = require('bitfinex-api-node');
const collectTimeInterval= 20000;
const collectNumber= 999;


const bfx = new BFX({
    apiKey: '',
    apiSecret: '',
    ws: {
        autoReconnect: true,
        seqAudit: true,
        packetWDDelay: 10 * 1000
    }
});


const rest = bfx.rest(2, {transform:true});
//
// rest.symbols().then(symbols => {
//     console.log(symbols)
// });
async function getTickerData(symbol){
    const ticker = await rest.tickers([symbol]);
    const data= ticker[0];
    const timestamp = (new Date()).getTime();
    return {
        timestamp,
        bid: data.bid,
        ask: data.ask,
        lastPrice: data.lastPrice,
        volume: data.volume
    };
}

async function writeCsv(data){
    const now = (new Date()).getTime();
    const csvWriter = createCsvWriter({
        path: now+'.csv',
        header: [
            {id: 'timestamp', title: 'Timestamp'},
            {id: 'bid', title: 'Bid'},
            {id: 'ask', title: 'Ask'},
            {id: 'lastPrice', title: 'Lastprice'},
            {id: 'volume', title: 'Volume'}
        ]
    });
    await csvWriter
        .writeRecords(data);
    console.log('The CSV file was written successfully at '+now)
}
(async ()=>{
    let table = [];
    setInterval(async ()=>{
        const tickerData = await getTickerData('tBTCUSD');
        table.push(tickerData);
        if(table.length>collectNumber){
            console.log(table);
            await writeCsv(table);
            table=[];
        }
    }, collectTimeInterval)
})();



