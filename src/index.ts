import './config'; // Load environment variables
import 'express-async-errors'; // Enable default error handling for async errors
import express, { Express } from 'express';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import { scheduleJob } from 'node-schedule';
import { sendOneWeekReminders } from './services/reminderService';
import { validateNewUserBody, validateLoginBody } from './validators/authValidator';

import {
  registerUser,
  logIn,
  getUserInfo,
  updateBirthday,
  updateEmailAddress,
  updateGender,
  updatePlace,
  updateUserName,
  createReminder,
  getUserDashboard,
} from './controllers/UserController';
import {
  addNewMedicalHistory,
  getMedicalHistory,
  getAllMedicalHistoryByUser,
  updateMedicalHistory,
  deleteMedicalHistory,
} from './controllers/MedicalHistoryController';
import {
  addNewMedicationData,
  getMedicationData,
  getAllMedicationDataByUser,
  updateMedicationData,
  deleteMedicationData,
} from './controllers/MedicationDataController';

import FoodController from './controllers/FoodDataController';
import ActivityController from './controllers/ActivityDataController';
import { getAllUserSleepData } from './controllers/SleepDataController';
import { getAllUserHealthData } from './controllers/HealthDataController';
import { getAllHealthDataForUser, updateHealthData } from './models/HealthDataModel';
import { getAllSleepDataForUser } from './models/SleepDataModel';

const app: Express = express();
app.set('view engine', 'ejs');

const { PORT, COOKIE_SECRET } = process.env;
app.use(express.static('public', { extensions: ['html'] }));

let store;
if (process.env.CAROLYN_ENV) {
  const redisClient = createClient();
  await redisClient.connect();
  store = new RedisStore({
    client: redisClient,
  });
} else {
  const SQLiteStore = connectSqlite3(session);
  store = new SQLiteStore({ db: 'sessions.sqlite' });
}

app.use(
  session({
    store,
    secret: COOKIE_SECRET as string,
    cookie: { maxAge: 8 * 60 * 60 * 1000 }, // 8 hours
    name: 'session',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', getUserDashboard);
app.get('/activity', ActivityController.getAllUserActivityData);
app.get('/activity/stats', ActivityController.getActivityStats);
app.get('/food', FoodController.getAllUserFoodData);
app.get('/food/stats', FoodController.getFoodStats);

app.post('/register', validateNewUserBody, registerUser);
app.post('/login', validateLoginBody, logIn);
app.get('/users/:userId', getUserInfo);
app.post('/api/users/:userId/email', updateEmailAddress);
app.post('/api/users/:userId/gender', updateGender);
app.post('/api/users/:userId/place', updatePlace);
app.post('/api/users/:userId/birthday', updateBirthday);
app.post('/api/users/:userId/name', updateUserName);

app.post('/api/reminders', createReminder);

app.post('/api/medical-history', addNewMedicalHistory);
app.get('/api/medical-history/:medicalHistoryId', getMedicalHistory);
app.get('/api/users/:userId/medical-history', getAllMedicalHistoryByUser);
app.post('/api/medical-history/:medicalHistoryId/update', updateMedicalHistory);
app.delete('/api/medical-history/:medicalHistoryId', deleteMedicalHistory);

app.post('/api/medication', addNewMedicationData);
app.get('/api/medication/:medicationDataId', getMedicationData);
app.get('/api/users/:userId/medication', getAllMedicationDataByUser);
app.post('api/medication/:medicationDataId/update', updateMedicationData);
app.delete('/api/medication/:medicationDataId', deleteMedicationData);

app.get('/api/food/search', FoodController.searchFoodData);
app.get('/api/food/stats', FoodController.getFoodStats);
app.get('/api/food/:foodDataId', FoodController.getFoodData);
app.get('/api/food/user/:userId', FoodController.getAllUserFoodData);
app.post('/api/food', FoodController.submitFoodData);
app.post('/api/food/:foodDataId', FoodController.updateFoodData);
app.delete('/api/food/:foodDataId', FoodController.deleteFoodData);

app.get('/api/activity/search', ActivityController.searchActivityData);
app.get('/api/activity/stats', ActivityController.getActivityStats);
app.get('/api/activity/:activityDataId', ActivityController.getActivityData);
app.get('/api/activity/user/:userId', ActivityController.getAllUserActivityData);
app.post('/api/activity', ActivityController.submitActivityData);
app.post('/api/activity/:activityDataId', ActivityController.updateActivityData);
app.delete('/api/activity/:activityDataId', ActivityController.deleteActivityData);

app.get('/api/activity/:userId', getAllUserSleepData);
app.get('/api/activity/:userId', getAllHealthDataForUser);
app.post('/api/activity/', updateHealthData);

app.get('/api/activity/:userId', getAllUserHealthData);
app.post('/api/activity/', getAllSleepDataForUser);

scheduleJob('0 0 7 * * *', sendOneWeekReminders);

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
