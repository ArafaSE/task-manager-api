const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {userOneId, userOne, setupDatabase} = require('./fixtures/db')
 
beforeEach(setupDatabase)

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Mohamed',
        email: 'mohamed@gmail.com',
        password: 'mohamed1234'
    }).expect(201)

    // Assert that user is saved in database correctly 
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()
    
    // Assertion about the response body
    expect(response.body).toMatchObject({
        user:{
            name: 'Mohamed',
            email: 'mohamed@gmail.com'
        },
        token: user.tokens[0].token
    })

    // Assertion to make sure the password saved as hashed passwrod in database
    expect(user.password).not.toBe('mohamed1234')
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(userOneId)

    // Assert that the user get the second token after login
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login non existent user', async ()=> {
    await request(app)
    .post('/users/login')
    .send({
        email: userOne.email,
        password: 'hamada1234'
    })
    .expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})


test('Should delete account for user', async () => {
    await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    // Assertion to make sure the user is deleted from database
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauthorized user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async() => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Hamada'
        })
        .expect(200)
    // Assert that user updated in the DB correctly
    const user = await User.findById(userOneId) 
    expect(user.name).toBe('Hamada')
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Cairo'
        })
        .expect(400)
})