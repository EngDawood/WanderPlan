export const setCache = (key: string, data: any, ttlMinutes = 60) => {
  try {
    const now = new Date();
    const item = {
      data,
      expiry: now.getTime() + ttlMinutes * 60 * 1000,
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error('Error setting cache', error);
  }
};

export const getCache = (key: string) => {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    const now = new Date();

    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.data;
  } catch (error) {
    console.error('Error getting cache', error);
    return null;
  }
};
