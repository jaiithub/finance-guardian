// Database schema for FinanceGuardian app using IndexedDB

const DB_VERSION = 1;
const DB_NAME = "FinanceGuardianDB";

// Database initialization function
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      reject("Database error: " + event.target.errorCode);
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create User store
      if (!db.objectStoreNames.contains("users")) {
        const userStore = db.createObjectStore("users", { keyPath: "id" });
        userStore.createIndex("pin", "pin", { unique: false });
      }
      
      // Create Expenses store
      if (!db.objectStoreNames.contains("expenses")) {
        const expenseStore = db.createObjectStore("expenses", { keyPath: "id", autoIncrement: true });
        expenseStore.createIndex("date", "date", { unique: false });
        expenseStore.createIndex("category", "category", { unique: false });
        expenseStore.createIndex("amount", "amount", { unique: false });
      }
      
      // Create Budgets store
      if (!db.objectStoreNames.contains("budgets")) {
        const budgetStore = db.createObjectStore("budgets", { keyPath: "id", autoIncrement: true });
        budgetStore.createIndex("name", "name", { unique: false });
        budgetStore.createIndex("category", "category", { unique: false });
        budgetStore.createIndex("period", "period", { unique: false });
      }
      
      // Create Categories store
      if (!db.objectStoreNames.contains("categories")) {
        const categoryStore = db.createObjectStore("categories", { keyPath: "id", autoIncrement: true });
        categoryStore.createIndex("name", "name", { unique: true });
        categoryStore.createIndex("type", "type", { unique: false });
      }
      
      // Create Passwords store
      if (!db.objectStoreNames.contains("passwords")) {
        const passwordStore = db.createObjectStore("passwords", { keyPath: "id", autoIncrement: true });
        passwordStore.createIndex("title", "title", { unique: false });
        passwordStore.createIndex("updatedDate", "updatedDate", { unique: false });
      }
    };
  });
};

// Data models with sample data

// User model
export const userModel = {
  id: "user1", // Default user ID
  pin: "", // Will be encrypted
  settings: {
    currency: "INR",
    theme: "light",
    notificationsEnabled: true,
    autoLogoutTime: 5, // minutes
  }
};

// Expense model
export const expenseModel = {
  id: null, // Auto-generated
  amount: 0,
  category: "",
  description: "",
  date: new Date(),
  paymentMethod: "cash" // Default
};

// Budget model
export const budgetModel = {
  id: null, // Auto-generated
  name: "",
  amount: 0,
  period: "monthly", // Default
  category: "",
  startDate: new Date(),
  endDate: null // Optional
};

// Category model
export const categoryModel = {
  id: null, // Auto-generated
  name: "",
  icon: "",
  color: "#000000",
  type: "expense" // Default
};

// Password model
export const passwordModel = {
  id: null, // Auto-generated
  title: "",
  username: "", // Will be encrypted
  password: "", // Will be encrypted
  url: "",
  notes: "", // Will be encrypted
  createdDate: new Date(),
  updatedDate: new Date(),
  expiryReminder: 90 // Default reminder after 90 days
};

// Default categories
export const defaultCategories = [
  { name: "Housing", icon: "home", color: "#4B89DC", type: "expense" },
  { name: "Food", icon: "restaurant", color: "#8CC152", type: "expense" },
  { name: "Transportation", icon: "directions_car", color: "#967ADC", type: "expense" },
  { name: "Entertainment", icon: "movie", color: "#F6BB42", type: "expense" },
  { name: "Shopping", icon: "shopping_cart", color: "#EC87C0", type: "expense" },
  { name: "Utilities", icon: "power", color: "#DA4453", type: "expense" },
  { name: "Healthcare", icon: "local_hospital", color: "#37BC9B", type: "expense" },
  { name: "Education", icon: "school", color: "#3BAFDA", type: "expense" },
  { name: "Personal", icon: "person", color: "#D770AD", type: "expense" },
  { name: "Other", icon: "more_horiz", color: "#AAB2BD", type: "expense" },
  { name: "Salary", icon: "work", color: "#8CC152", type: "income" },
  { name: "Bonus", icon: "card_giftcard", color: "#F6BB42", type: "income" },
  { name: "Investment", icon: "trending_up", color: "#4B89DC", type: "income" },
  { name: "Gift", icon: "redeem", color: "#EC87C0", type: "income" }
];

// Database service functions

// Generic add function
export const addItem = (storeName, item) => {
  return new Promise((resolve, reject) => {
    initDatabase().then(db => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.add(item);
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        reject("Error adding item to " + storeName);
      };
    }).catch(error => reject(error));
  });
};

// Generic get all function
export const getAllItems = (storeName) => {
  return new Promise((resolve, reject) => {
    initDatabase().then(db => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        reject("Error getting items from " + storeName);
      };
    }).catch(error => reject(error));
  });
};

// Generic get by ID function
export const getItemById = (storeName, id) => {
  return new Promise((resolve, reject) => {
    initDatabase().then(db => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        reject("Error getting item from " + storeName);
      };
    }).catch(error => reject(error));
  });
};

// Generic update function
export const updateItem = (storeName, item) => {
  return new Promise((resolve, reject) => {
    initDatabase().then(db => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        reject("Error updating item in " + storeName);
      };
    }).catch(error => reject(error));
  });
};

// Generic delete function
export const deleteItem = (storeName, id) => {
  return new Promise((resolve, reject) => {
    initDatabase().then(db => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = (event) => {
        resolve(true);
      };
      
      request.onerror = (event) => {
        reject("Error deleting item from " + storeName);
      };
    }).catch(error => reject(error));
  });
};

// Specialized functions for expense queries

// Get expenses by date range
export const getExpensesByDateRange = (startDate, endDate) => {
  return new Promise((resolve, reject) => {
    initDatabase().then(db => {
      const transaction = db.transaction(["expenses"], "readonly");
      const store = transaction.objectStore("expenses");
      const index = store.index("date");
      const range = IDBKeyRange.bound(startDate, endDate);
      const request = index.getAll(range);
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        reject("Error getting expenses by date range");
      };
    }).catch(error => reject(error));
  });
};

// Get expenses by category
export const getExpensesByCategory = (category) => {
  return new Promise((resolve, reject) => {
    initDatabase().then(db => {
      const transaction = db.transaction(["expenses"], "readonly");
      const store = transaction.objectStore("expenses");
      const index = store.index("category");
      const request = index.getAll(category);
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        reject("Error getting expenses by category");
      };
    }).catch(error => reject(error));
  });
};

// Initialize database with default data
export const initializeDefaultData = () => {
  return new Promise((resolve, reject) => {
    // Add default user
    addItem("users", userModel)
      .then(() => {
        // Add default categories
        const categoryPromises = defaultCategories.map(category => 
          addItem("categories", { ...categoryModel, ...category })
        );
        return Promise.all(categoryPromises);
      })
      .then(() => resolve(true))
      .catch(error => reject(error));
  });
};

// Encryption service for sensitive data
export const encryptData = (data, pin) => {
  // In a real app, we would use a proper encryption library
  // This is a placeholder for demonstration purposes
  return btoa(pin + ":" + data);
};

export const decryptData = (encryptedData, pin) => {
  // In a real app, we would use a proper decryption method
  // This is a placeholder for demonstration purposes
  try {
    const decoded = atob(encryptedData);
    const parts = decoded.split(":");
    if (parts[0] === pin) {
      return parts.slice(1).join(":");
    }
    return null;
  } catch (e) {
    return null;
  }
};
