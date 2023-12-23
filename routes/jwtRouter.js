const express = require('express');
const router = express.Router();
const jwt = require('../middlewares/jwtVerify');

router.post(
    '/jwt',
    jwt.verifyJwt,

  );
 
  module.exports = router;