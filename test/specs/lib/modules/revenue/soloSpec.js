'use strict';

var EventEmitter = require('events').EventEmitter,

    chai = require('chai'),
    expect = chai.expect,

    Solo = require('../../../../../lib/modules/revenue/solo');

describe('modules/revenue/solo', function () {

    function setUp () {
        var app = new EventEmitter(),
            config = {
                miner: 'minerId',
                market: 'marketId',
                technical: 'technicalId'
            },
            solo = new Solo(app, config);

        return {
            app: app,
            module: solo
        };
    }

    it('should calculate revenue when any miner hashrate is updated', function (done) {
        var app = new EventEmitter(),
            config = {
                miner: [ 'minerId1', 'minerId2' ],
                market: 'marketId',
                technical: 'technicalId'
            },
            solo = new Solo(app, config);

        solo.minerData = {
            minerId1: { avgHashrate: 0.5 * 1e-6 }
        };
        solo.marketData = { ask: 100, currency: 'NMC' };
        solo.technicalData = { btcPerBlock: 10, probability: 0.0001 };

        solo.on('update:data', function (data) {
            expect(data).to.deep.equal({
                value: 8640,
                currency: 'NMC',
                interval: 'Day'
            });
            done();
        });

        app.emit('update:data:minerId2', { avgHashrate: 0.5 * 1e-6 });
    });

    it('should calculate revenue when miner is not connected', function (done) {
        var setup = setUp(),
            app = setup.app,
            solo = setup.module;

        solo.marketData = { ask: 100, currency: 'NMC' };
        solo.technicalData = { btcPerBlock: 10, probability: 0.0001 };

        solo.on('update:data', function (data) {
            expect(data).to.deep.equal({
                value: 0,
                currency: 'NMC',
                interval: 'Day'
            });
            done();
        });

        app.emit('update:data:minerId', { connected: false });
    });

    it('should calculate revenue when market prices are updated', function (done) {
        var setup = setUp(),
            app = setup.app,
            solo = setup.module;

        solo.minerData = { minerId: { avgHashrate: 1e-6 } };
        solo.technicalData = { btcPerBlock: 10, probability: 0.0001 };

        solo.on('update:data', function (data) {
            expect(data).to.deep.equal({
                value: 8640,
                currency: 'NMC',
                interval: 'Day'
            });
            done();
        });

        app.emit('update:data:marketId', { ask: 100, currency: 'NMC' });
    });

    it('should calculate revenue when technical info is updated', function (done) {
        var setup = setUp(),
            app = setup.app,
            solo = setup.module;

        solo.minerData = { minerId: { avgHashrate: 1e-6 } };
        solo.marketData = { ask: 100, currency: 'NMC' };

        solo.on('update:data', function (data) {
            expect(data).to.deep.equal({
                value: 8640,
                currency: 'NMC',
                interval: 'Day'
            });
            done();
        });

        app.emit('update:data:technicalId', { btcPerBlock: 10, probability: 0.0001 });
    });

    it('should set the title to "Revenue" when no title is set in config', function () {
        var app = {
                on: function () {}
            },
            solo = new Solo(app, {});

        expect(solo.title).to.equal('Revenue');
    });

    it('should set the title to config.title when it is set', function () {
        var app = {
                on: function () {}
            },
            solo = new Solo(app, {
                title: 'Some Title'
            });

        expect(solo.title).to.equal('Some Title');
    });

});