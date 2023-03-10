import { Request, Response } from 'express'
import { addFoodData, getAllFoodDataForUser } from '../models/FoodDataModel';
import { parseDatabaseError } from '../utils/db-utils';
import { UserIdParam } from '../types/userInfo';

async function submitFoodData(req: Request, res: Response): Promise<void> {
    const foodData = req.body as FoodData;
    
    try {
        const newFoodData = await addFoodData(foodData);
        console.log(newFoodData);
        res.sendStatus(201);
    } catch(err) {
        console.error(err);
        const databaseErrorMessage = parseDatabaseError(err);
        res.status(500).json(databaseErrorMessage);
    }
}

async function getAllUserFoodData(req: Request, res: Response): Promise<void> {
    const { userId } = req.params as unknown as UserIdParam;

    // include check for userid validity here once implemented

    try {
        const foodData = await getAllFoodDataForUser(userId);
        console.log(foodData);
        res.json(foodData);
    } catch(err) {
        console.error(err);
        const databaseErrorMessage = parseDatabaseError(err);
        res.status(500).json(databaseErrorMessage);
    }
}

export { 
    submitFoodData,
    getAllUserFoodData
}