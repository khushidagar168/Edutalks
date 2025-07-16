// server/routes/siteSettingsRoutes.js
import express from 'express';
import {
  getSiteSettings,
  updateSiteSettings,
} from '../controllers/siteSettingsController.js';

const router = express.Router();

router.get('/', getSiteSettings);
router.put('/', updateSiteSettings);

export default router;
