import { getPoolJoined } from './pool'


const createRoute = (call: Function) => async (req, res) => {
    try {
        const value = await call()
        res.send(value)
    }
    catch (error) {
        console.log(error)
    }
}

export const circulatingSupply = createRoute(getPoolJoined)