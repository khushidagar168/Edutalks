// server/models/SiteSettings.js
import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
  id: { type: String, default: 'global-settings' },  // Fixed ID
  email: { type: String, required: true },
  phone: { type: String, required: true },
  location: { type: String, required: true },
  facebook: { type: String },
  twitter: { type: String },
  instagram: { type: String },
  linkedin: { type: String },
  other_fields: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

export default SiteSettings;
