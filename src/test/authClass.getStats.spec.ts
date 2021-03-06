import { expect } from 'chai'
import * as sinon from 'sinon'
import * as jwt from 'jsonwebtoken'

import { AuthService } from '../apiServices/AuthService'

const getRequest = require('../http/index')

describe('getStats', () => {
    const accessToken = {
        jti: '',
        iss: '',
        exp: Math.floor(new Date().getTime() / 1000) + 60 * 20,
        userId: '',
        iat: 0,
    }
    let getRequestStub: any

    let AUTH
    let isUserLoggedInStub: any
    beforeEach(() => {
        getRequestStub = sinon.stub(getRequest, 'getRequest')

        AUTH = new AuthService('user', 'password')
        AUTH.jwtTokens = {
            access: jwt.sign(accessToken, 'secret'),
            refresh: 'refresh',
        }

        isUserLoggedInStub = sinon.stub(AUTH, 'isUserLoggedIn')
    })

    afterEach(() => {
        getRequestStub.restore()
        isUserLoggedInStub.restore()

        delete AUTH.jwtTokens
    })

    it('is a function', () => {
        expect(AUTH.getStats).to.be.a('function')
    })

    it('returns an object containg stats', async () => {
        const response = [
            {
                from: '2018-01-01T00:00:00.000Z',
                interval: 'LIFE_TIME',
                createdAt: '2019-06-14T12:32:59.794Z',
                type: 'USERS_ANALYSES',
                revision: 14,
                data: { numUsers: [], numAnalyses: [], analysis: [] },
            },
        ]
        isUserLoggedInStub.returns(true)

        getRequestStub.resolves({
            data: response,
        })

        const result = await AUTH.getStats()
        expect(result).to.deep.equal(response)
    })

    it('should fail if there is something wrong with the request', async () => {
        isUserLoggedInStub.returns(true)

        getRequestStub.throws('400')

        try {
            await AUTH.getStats()
            expect.fail('getStats should be rejected')
        } catch (err) {
            expect(err.message).to.equal('MythxJS. Error with your request. 400')
        }
    })
})
