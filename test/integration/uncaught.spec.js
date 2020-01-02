'use strict';

var assert = require('assert');
var helpers = require('./helpers');
var run = helpers.runMochaJSON;
var runMocha = helpers.runMocha;
var args = [];

describe('uncaught exceptions', function() {
  it('handles uncaught exceptions from hooks', function(done) {
    run('uncaught/hook.fixture.js', args, function(err, res) {
      if (err) {
        done(err);
        return;
      }
      assert.strictEqual(res.stats.pending, 0);
      assert.strictEqual(res.stats.passes, 0);
      assert.strictEqual(res.stats.failures, 1);

      assert.strictEqual(
        res.failures[0].fullTitle,
        'uncaught "before each" hook'
      );
      assert.strictEqual(res.code, 1);
      done();
    });
  });

  it('handles uncaught exceptions from async specs', function(done) {
    run('uncaught/double.fixture.js', args, function(err, res) {
      if (err) {
        done(err);
        return;
      }
      assert.strictEqual(res.stats.pending, 0);
      assert.strictEqual(res.stats.passes, 0);
      assert.strictEqual(res.stats.failures, 2);

      assert.strictEqual(
        res.failures[0].title,
        'fails exactly once when a global error is thrown first'
      );
      assert.strictEqual(
        res.failures[1].title,
        'fails exactly once when a global error is thrown second'
      );
      assert.strictEqual(res.code, 2);
      done();
    });
  });

  it('handles uncaught exceptions from which Mocha cannot recover', function(done) {
    run('uncaught/fatal.fixture.js', args, function(err, res) {
      if (err) {
        return done(err);
      }

      var testName = 'should bail if a successful test asynchronously fails';
      expect(res, 'to have failed')
        .and('to have passed test count', 1)
        .and('to have failed test count', 1)
        .and('to have passed test', testName)
        .and('to have failed test', testName);

      done();
    });
  });

  it('handles uncaught exceptions within pending tests', function(done) {
    run('uncaught/pending.fixture.js', args, function(err, res) {
      if (err) {
        return done(err);
      }

      expect(res, 'to have failed')
        .and('to have passed test count', 3)
        .and('to have pending test count', 1)
        .and('to have failed test count', 1)
        .and(
          'to have passed test',
          'test1',
          'test3 - should run',
          'test4 - should run'
        )
        .and('to have pending test order', 'test2')
        .and('to have failed test', 'test2');

      done();
    });
  });

  it("handles uncaught exceptions after runner's end", function(done) {
    runMocha(
      'uncaught/after-runner.fixture.js',
      args,
      function(err, res) {
        if (err) {
          return done(err);
        }

        expect(res, 'to have failed').and('to satisfy', {
          failing: 0,
          passing: 1,
          pending: 0,
          output: expect.it('to contain', 'Error: Unexpected crash')
        });

        done();
      },
      'pipe'
    );
  });

  it('issue-1327: should run the first test and then bail', function(done) {
    run('uncaught/issue-1327.fixture.js', args, function(err, res) {
      if (err) {
        return done(err);
      }
      expect(res, 'to have failed')
        .and('to have passed test count', 1)
        .and('to have failed test count', 1)
        .and('to have passed test', 'test 1')
        .and('to have failed test', 'test 1');
      done();
    });
  });

  it('issue-1417: uncaught exceptions from async specs', function(done) {
    run('uncaught/issue-1417.fixture.js', args, function(err, res) {
      if (err) {
        return done(err);
      }
      expect(res, 'to have failed with errors', 'sync error a', 'sync error b')
        .and('to have exit code', 2)
        .and('not to have passed tests')
        .and('not to have pending tests')
        .and('to have failed test order', [
          'fails exactly once when a global error is thrown synchronously and done errors',
          'fails exactly once when a global error is thrown synchronously and done completes'
        ]);
      done();
    });
  });
});
