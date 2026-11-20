// Read a saved value. Falls back if nothing is saved, the text is corrupted,
// or the saved value isn't the expected kind (e.g. we expect an array).
export function loadFromStorage(key, fallback){
  try{
    const value = JSON.parse(localStorage.getItem(key));
    if(value === null) return fallback;
    if(Array.isArray(fallback) && !Array.isArray(value)) return fallback;
    return value;
  } catch {
    return fallback;
  }
}

export function saveToStorage(key, value){
  localStorage.setItem(key, JSON.stringify(value));
}
