import SystemSettings, { SystemSettingsModel } from '../model/SystemSettings';

async function create(
  category: string,
  settings: Map<string, any> = new Map(),
): Promise<SystemSettings> {
  const now = new Date();
  const settingsDoc = new SystemSettingsModel({
    category,
    settings,
    createdAt: now,
    updatedAt: now,
  });
  return await settingsDoc.save();
}

async function findByCategory(
  category: string,
): Promise<SystemSettings | null> {
  return await SystemSettingsModel.findOne({ category }).lean();
}

async function updateByCategory(
  category: string,
  settings: Map<string, any> | Record<string, any>,
): Promise<SystemSettings | null> {
  let settingsMap: Map<string, any>;

  if (settings instanceof Map) {
    settingsMap = settings;
  } else if (settings && typeof settings === 'object') {
    settingsMap = new Map(Object.entries(settings));
  } else {
    settingsMap = new Map();
  }

  return await SystemSettingsModel.findOneAndUpdate(
    { category },
    {
      settings: settingsMap,
      updatedAt: new Date(),
    },
    { new: true, upsert: true },
  ).lean();
}

async function getOrCreate(
  category: string,
  defaultSettings: Map<string, any> | Record<string, any> = new Map(),
): Promise<SystemSettings> {
  let settings = await this.findByCategory(category);

  if (!settings) {
    const settingsMap =
      defaultSettings instanceof Map
        ? defaultSettings
        : new Map(Object.entries(defaultSettings));
    settings = await this.create(category, settingsMap);
  }

  return settings;
}

async function getSetting(category: string, key: string): Promise<any> {
  const settings = await this.findByCategory(category);
  return settings?.settings?.get?.(key) ?? null;
}

async function setSetting(
  category: string,
  key: string,
  value: any,
): Promise<SystemSettings | null> {
  const settings = await this.findByCategory(category);

  if (settings) {
    const updatedSettings = new Map(settings.settings);
    updatedSettings.set(key, value);
    return await this.updateByCategory(category, updatedSettings);
  } else {
    const newSettings = new Map();
    newSettings.set(key, value);
    return await this.create(category, newSettings);
  }
}

async function deleteSetting(
  category: string,
  key: string,
): Promise<SystemSettings | null> {
  const settings = await this.findByCategory(category);

  if (settings && settings.settings?.has(key)) {
    const updatedSettings = new Map(settings.settings);
    updatedSettings.delete(key);
    return await this.updateByCategory(category, updatedSettings);
  }

  return settings;
}

async function deleteCategory(category: string): Promise<boolean> {
  const result = await SystemSettingsModel.deleteOne({ category });
  return result.deletedCount > 0;
}

async function getAllCategories(): Promise<string[]> {
  const categories = await SystemSettingsModel.distinct('category');
  return categories;
}

export default {
  create,
  findByCategory,
  updateByCategory,
  getOrCreate,
  getSetting,
  setSetting,
  deleteSetting,
  deleteCategory,
  getAllCategories,
};
