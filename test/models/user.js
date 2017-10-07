const User = require('../../models').user
const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const expect = chai.expect;
const server = require('../../app_test');
const setup = require('./setup');
const db = require('../../db.js');

chai.use(chaiHttp);


// Request server
const app = chai.request(server);


describe("USER TESTS", function() {

	var user = {
		age: 25,
		gender: 'male',
		phoneNumber: '7779999999',
		password: 'password',
	}

	// Add two test users to DB
	before(function(done) {
		setup.setup(db,app,done);
	});

	// Destroy all users in DB after tests
	after(function(done) {
		setup.resetDb(db,app,done);
	});


	// Ensure that two users are in DB 
	describe("DB setup", function() {
		// There should be no users in DB
		it('should return two', function(done) {
			User.count((count,err) => {
				if (err) done(err);
				expect(count).to.equal(setup.userCount);
				done();
			});
		});
	});

	// Test creating a user 
	describe("User Create", function() {
		// Test creating a user
		it('should create a user', function(done) {
			User.count(count => {
				app
				.post('/users')
				.send(user)
				.end(function(err, res) {
					res.should.have.status(201);
					User.count((newCount,err) => {
						if (err) done(err);
						expect(newCount).to.equal(count+1);
						done();	
					});
				});
			});
		});
	});


	// Test getting user page 
	describe("User retrieval", function() {
		it('should get user index', function(done) {
			app
			.get('/users')
			.end(function(err, res) {
				res.should.have.status(200);				
				for (var key in user) {
					expect(res.text).to.include(user[key]);	
				}
				done();
			});
		});

		// Get a single user
		it('should get a single user', function(done) {
			app
			.get('/users/'+1)
			.send({ userId: 1 })
			.end(function(err, res) {
				res.should.have.status(200);				
				for (var key in setup.user1) {
					expect(res.text).to.include(setup.user1[key]);	
				}
				done();
			});
		});
	});

	// Test destroying users
	describe("User destroy", function() {
		// Test destroying a user
		it('should destroy user', function(done) {
			User.count((count,err) => {
				if (err) done(err);
				app
				.del('/users/'+3) 
				.send({ userId: 3 }) // Delete the third user
				.end(function(err, res) {
					res.should.have.status(204);
					User.count((newCount,err) => {
						if (err) done(err);
						expect(newCount).to.equal(count-1);
						done();
					});
				});	
			});
		});		
	});


	// Test User updates
	describe("User Updates", function() {
		// Update user 1
		it('should update user', function(done) {
			app
			.put('/users/'+2) 
			.send({ userId: 2, age: 29 })
			.end(function(err, res) {
				res.should.have.status(200);
				// Ensure user has updated values
				app
				.get('/users/'+2)
				.end(function(err, res) {
					res.should.have.status(200);
					expect(res.text).to.include(29)
					done();
				});
			});
		});
		
	});
});
