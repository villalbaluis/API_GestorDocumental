const { Router } = require('express');
const router = Router();

const { createUser, changeUserPassword, loginUser, logoutUser, allUsers, updateUser } = require('../api/auth.api');

router.post('/auth/create/user', createUser);
router.post('/auth/reset/password', changeUserPassword);
router.post('/auth/user/login', loginUser);
router.post('/auth/user/logout', logoutUser);
router.get('/auth/user/showusers', allUsers);
router.post('/auth/user/updateUser', updateUser);

module.exports = router;
