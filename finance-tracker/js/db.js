import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";
import { db } from "./firebase.js";

function transactionsCollection(userId) {
  return collection(db, "users", userId, "transactions");
}

function settingsDocument(userId) {
  return doc(db, "users", userId, "settings", "profile");
}

export function subscribeToTransactions(userId, onData, onError) {
  const transactionsQuery = query(transactionsCollection(userId), orderBy("date", "desc"));

  return onSnapshot(
    transactionsQuery,
    (snapshot) => {
      const transactions = snapshot.docs.map((entry) => ({
        id: entry.id,
        ...entry.data()
      }));
      onData(transactions);
    },
    onError
  );
}

export function subscribeToSettings(userId, onData, onError) {
  return onSnapshot(
    settingsDocument(userId),
    (snapshot) => {
      onData(snapshot.exists() ? snapshot.data() : { budget: 0 });
    },
    onError
  );
}

export async function addTransaction(userId, transaction) {
  return addDoc(transactionsCollection(userId), {
    ...transaction,
    userId,
    createdAt: serverTimestamp()
  });
}

export async function deleteTransaction(userId, transactionId) {
  return deleteDoc(doc(db, "users", userId, "transactions", transactionId));
}

export async function saveBudget(userId, budget) {
  return setDoc(
    settingsDocument(userId),
    {
      userId,
      budget,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}
