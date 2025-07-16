// server/controllers/siteSettingsController.js
import SiteSettings from '../models/SiteSettings.js';

// Always get the single settings doc
export const getSiteSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.findOne({ id: 'global-settings' });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching site settings' });
  }
};

// Always update by id
export const updateSiteSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.findOneAndUpdate(
      { id: 'global-settings' },
      req.body,
      { new: true, upsert: true } // If not found, create
    );
    res.json(settings);
  } catch (err) {
    res.status(400).json({ message: 'Error updating site settings' });
  }
};
