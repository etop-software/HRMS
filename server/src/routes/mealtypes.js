const  express =require('express');

const router=express.Router();

const mealController = require('../controllers/mealController');

router.get('/',mealController.getAllMealTypes);
router.get('/:id',mealController.getMealTypeById);
router.post('/',mealController.createMealType);
router.put('/:id',mealController.updateMealType);
router.delete('/:id',mealController.deleteMealType);

module.exports=router;