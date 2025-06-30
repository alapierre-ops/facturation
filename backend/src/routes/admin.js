const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

router.use(auth);

// Liste tous les utilisateurs
router.get('/users', adminController.getAllUsers);
// Détail d'un utilisateur
router.get('/users/:id', adminController.getUserById);
// Créer un utilisateur
router.post('/users', adminController.createUser);
// Modifier un utilisateur
router.put('/users/:id', adminController.updateUser);
// Supprimer un utilisateur
router.delete('/users/:id', adminController.deleteUser);
// Changer le mot de passe d'un utilisateur
router.post('/users/:id/password', adminController.changeUserPassword);
// Statistiques d'un utilisateur
router.get('/users/:id/stats', adminController.getUserStats);

module.exports = router; 