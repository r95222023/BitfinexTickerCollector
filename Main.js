// const os = require('os');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const BFX = require('bitfinex-api-node');
const collectTimeInterval= 20000;
const collectNumber= 999;
const port = 80;
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

async function initFileServer(){
    const handler = require('serve-handler');

    const serveDirectory= async (request, response) => {
        await handler(request, response);
    };

    const server=await require('http')
        .createServer(serveDirectory);
    server.listen(port);

    setInterval(async ()=>{
        await server.close();
        await server.listen(port)
    }, (collectNumber+1)*collectTimeInterval);
    console.log('Listening port '+port);
}
(async ()=>{
    let table = [];
    setInterval(async ()=>{
        const now = (new Date()).getTime();
        const tickerData = await getTickerData('tBTCUSD');
        table.push(tickerData);
        if(table.length%10===0){
            console.log('Collecting data: '+now);
        }
        if(table.length>collectNumber){
            await writeCsv(table);
            table=[];
        }
    }, collectTimeInterval);

    await initFileServer();
})();



