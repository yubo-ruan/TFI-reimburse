import { ethers } from 'ethers'
import { connect } from './providers'
import { contracts } from './constants'
const fs = require('fs');

const [, provider, wallet] = connect()
const abi = ['function totalSupply() public view returns (uint256)','function poolValue() public view returns (uint256)','event Borrow(address borrower, uint256 amount, uint256 fee)']
const tusdAbi = [   "event Transfer(address indexed src, address indexed dst, uint val)",
                    'event Funded(address indexed loanToken, uint256 amount)',
                    'function totalSupply() public view returns (uint256)',
                    'event Reclaimed(address indexed loanToken, uint256 amount)',
                    'event Closed(Status status, uint256 returnedAmount)',
                    'event LoanTokenCreated(address contractAddress)']

const curveGaugeAbi = [ 'event Deposit(address indexed provider, uint256 value)',
                        'event Withdraw(address indexed provider, uint256 value)']

const loanToken = ['0xe2531311b00f19b0da74491900cc2959bf2e6745',
                        '0x643dc313835f9773d865fc3ebc09e366210bb5e8']

// end of the bug: 11700307 
// start of the bug: 11628810
const start = 11628810
const end = 11700307
const originalPrice = 1.0130916566
const currentPrice = 1.018


// one more transaction: https://etherscan.io/tx/0x9a9fd27151ece393c297021f69c62640cca361be8d13338deb55807524938e94
// price: 40,000/39,483.100802186720326291 = 1.0130916566


const tfi = new ethers.Contract(contracts.tfi, abi, wallet) 
const tusd = new ethers.Contract(contracts.tusd, tusdAbi, wallet) 
const curveGauge = new ethers.Contract(contracts.curveGauge, curveGaugeAbi, wallet) 
const loan1 = new ethers.Contract(loanToken[0], tusdAbi, wallet) 
const loan2 = new ethers.Contract(loanToken[1], tusdAbi, wallet) 
const lender = new ethers.Contract(contracts.lender, tusdAbi, wallet) 
const loanFactory = new ethers.Contract(contracts.loanFactory, tusdAbi, wallet)

export const getTfiTotalSupply = async () => {
    return await tfi.totalSupply()/1e18
}

export const getPoolValue = async () => {
    return await tfi.poolValue()/1e18
}


const getEventsHelper = async (topic:string,index:number) => {
    let result = []
    let total = 0
    let totalDiff = 0
    const logInfo = {address: contracts.tfi, topics:[ethers.utils.id(topic)], fromBlock: start, toBlock: end}    
    const res = await provider.getLogs(logInfo)
    for(let i=0;i<res.length;i++){
        let TUSD = parseInt(res[i]['data'].substr(2+64*index,64),16)/1e18
        const TFI = parseInt(res[i]['data'].substr(2+64*1,64),16)/1e18
        TUSD = Number(TUSD.toFixed(0))
        const TfiPrice = TUSD/TFI
        const trueTFI = TUSD/originalPrice
        const diff = trueTFI - TFI
        total += TUSD
        totalDiff += diff
        result.push({   
                        TUSD_sent: TUSD,
                        TFI_received: TFI,
                        Tfi_price: TfiPrice,
                        Tfi_correct_amount: trueTFI,
                        Tfi_diff: diff,
                        Total_diff: totalDiff,
                        Hash: res[i]['transactionHash'],
                        BlockNumber: res[i]['blockNumber'],
                        Address: '0x'+res[i]['topics'][1].substr(2+24,40)
                    })
    }
    console.log("Total transactions: " + result.length)
    fs.writeFileSync('./output.json', JSON.stringify(result,null,2));
    return result
}
export const getPoolJoined = async () => {
    return await getEventsHelper('Joined(address,uint256,uint256)',0)
}



export const loanTokenFinder = async() => {
    
    let result = [];
    await provider.getLogs({address: contracts.loanFactory, topics:lender.filters.LoanTokenCreated().topics, fromBlock: 0, toBlock: "latest"}).then(res => {
            result.push(res)
    })
    // Address: '0x'+res[i]['topics'][1].substr(2+24,40)
    return result
}







