import { useState } from "react";

export const useLocalStorage = (keyName: string, defaultValue?: any) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const value = window.localStorage.getItem(keyName);
      if (value) {
        return JSON.parse(value);
      } else {
        window.localStorage.setItem(keyName, JSON.stringify(defaultValue));
        return defaultValue;
      }
    } catch (err) {
      console.log(err);
      return defaultValue;
    }
  });
  const setValue = (newValue: any) => {
    try {
      window.localStorage.setItem(keyName, JSON.stringify(newValue));
    } catch (err) {
      console.log(err);
    }
    if (newValue instanceof Array) {
      setStoredValue([...newValue]);
    } else {
      if (newValue instanceof Object) {
        setStoredValue({ ...newValue });
      } else {
        setStoredValue(newValue);
      }
    }
  };
  return [storedValue, setValue];
};
