var express = require('express');
var router = express.Router();
let Forge = require(`forge-apis`);
let config = require(`../../config`);
let ChangeRequest = require(`../model/ChangeRequest`);
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Login', roleId: 0 });
});

router.get('/admin', async function(req, res, next) {
  res.render('changeRequestTable', { 
    roleId: 1, 
    username: "mcewenal"
  })
});


/* POST login form */
router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    res.redirect('/');
  };

  res.render('requestForm', { 
    roleId: 1, 
    username: req.body.username 
  });
});

/* GET request form page */
router.get('/request-form', function(req, res, next){

  const roleId = 1;
  const username = req.body.username;

  res.render('requestForm', { 
    roleId, 
    username 
  });
});

router.get('/viewer/urn/:urn/change-request/:change_request_id', function(req, res, next){
  try {
    const roleId = 1;

    res.render('viewer', { 
      roleId,
      username: "currysl"
    });

  } catch (err){
    res.status(500).json(err);
  }
});

router.get('/admin/floor/:floor/dashboard', function(req, res, next){
  try {
    const roleId = 1;

    res.render('dashboard', { 
      roleId,
      username: "currysl"
    });

  } catch (err){
    res.status(500).json(err);
  }
});

router.get('/admin/viewer/floor/:floor/urn/:urn', function(req, res){
  try {
    const roleId = 1; 
    res.render(`adminViewer`, {roleId, username: "currysl"});
  } catch(err) {
    res.status(500).json(err);
  }
});

router.post('/counter', async function(req, res){
  try {
    let newCounter = new Counter();
    await newCounter.save();
    res.status(200).json();
  } catch (err){
    res.status(500).json(err);
  }
});

/* Forge Authentication */
router.get(`/user/forge/token`, function (req, res) {
  try {
    let client_id = config.forge.client_id;
    let client_secret = config.forge.client_secret;
    let scopes = config.forge.scopePublic;
    let forgeReq = new Forge.AuthClientTwoLegged(client_id, client_secret, scopes);
    forgeReq.authenticate()
        .then(function (credentials) {
          res.json({ access_token: credentials.access_token, expires_in: credentials.expires_in });
        });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/confirmation/:id', function(req, res, next){

  const roleId = 0;
  const username = "UC"
  const id = req.params.id;

  res.render('confirmation', {
    roleId,
    id
  });
});


module.exports = router;