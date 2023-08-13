const router = require('express').Router();
const { updateUserInfoValidation } = require('../middlewares/dataValidator');
const {
  updateUserInfo,
  getUserMe,
} = require('../controllers/users');

router.get('/me', getUserMe);

router.patch('/me', updateUserInfoValidation, updateUserInfo);

module.exports = router;
