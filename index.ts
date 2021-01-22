import {getPoolJoined,loanTokenHelper} from './src/pool'

const loanToken = ['0xe2531311b00f19b0da74491900cc2959bf2e6745',
                    '0x643dc313835f9773d865fc3ebc09e366210bb5e8',
                    '0x3344fC6Db44382Ac5c0A7cCDeF2A3dD5db8A4229']


// end of the bug: 11700307 
// start of the bug: 11628810



// reclaimHelper(loanToken[3]).then(res => {
//     res.forEach(element => {
//         console.log(element)        
//     });
// })

getPoolJoined().then(res => {
    res.forEach(element => {
        console.log(element)        
    });
})

// loanTokenHelper(loanToken[0]).then(res => {
//     res.forEach(element => {
//         console.log(element)        
//     });
// })

