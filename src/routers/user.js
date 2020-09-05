const express = require('express')
const multer = require('multer')
const sharp = require('sharp')

const User = require('../models/user')
const auth = require('../middleware/auth')
const {sendWelcomeEmail, sendCancelationEmail} = require('../emails/accounts')

const router = new express.Router()
const upload = multer({
    // dest: 'avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image'))
        }
        cb(undefined, true)
    }
})

// Create a new User
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    
     try{
         await user.save()
         sendWelcomeEmail(user.email, user.name)
         const token = await user.generateAuthToken()
         res.status(201).send({user, token})
     } catch (e){
         res.status(400).send(e)
     }
 
 })

 // login
router.post('/users/login', async (req, res) => {
     try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
     } catch (e){
        res.status(400).send('User Not Found!')
     }  
 })

 // logout
 router.post('/users/logout', auth, async (req, res) => {
     try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()
        res.send()
     }catch(e){
        res.status(500).send()
     }
 })
  // logout All
  router.post('/users/logoutAll', auth, async (req, res) => {
    try{
       req.user.tokens =  []

       await req.user.save()
       res.send()
    }catch(e){
       res.status(500).send()
    }
})

  // read loged in user profile
  router.get('/users/me', auth, async (req, res) => {
    try{
       res.send(req.user)
    }catch(e){
       res.send(e)
    }
  
})

 
 // Delete User
router.delete('/users/me', auth, async (req, res) => {
     try{
         await req.user.remove()
         sendCancelationEmail(req.user.email, req.user.name)
         res.send(req.user)
     }catch(e){
         res.status(500).send(e)
     }
 })

 // update user 
router.patch('/users/me', auth,async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','email','password','age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid Updates!'})
    }

    try{
        const user = req.user
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()

        res.send(user)
    }catch(e){
        res.status(400).send(e)
    }
})

// upload user avatar 
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()

    res.send()
},(error, req, res, next) => { // handle error result
    res.status(400).send({error: error.message})
})


// Delete user avatar DELETE /user/me/avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

// get user avatar 
router.get('/users/me/avatar', auth, async(req, res) => {
    try{
        const user = req.user
        if(!user.avatar){
            throw new Error('No Image found!')
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})


module.exports = router