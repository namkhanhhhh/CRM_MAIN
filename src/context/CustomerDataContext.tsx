import { createContext, useContext, useState, ReactNode } from 'react';
import { Customer, StatusHistoryEntry, CommunicationHistoryEntry, CustomReminder } from '@/types/customer';
import { ReminderHistoryEntry, ReminderSchedule } from '@/types/reminder';
import { mockCustomers, mockStatusHistory, mockCommunicationHistory } from '@/data/mockData';

interface CustomerDataContextType {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  statusHistory: Record<string, StatusHistoryEntry[]>;
  setStatusHistory: React.Dispatch<React.SetStateAction<Record<string, StatusHistoryEntry[]>>>;
  communicationHistory: Record<string, CommunicationHistoryEntry[]>;
  setCommunicationHistory: React.Dispatch<React.SetStateAction<Record<string, CommunicationHistoryEntry[]>>>;
  reminderHistory: Record<string, ReminderHistoryEntry[]>;
  setReminderHistory: React.Dispatch<React.SetStateAction<Record<string, ReminderHistoryEntry[]>>>;
  reminderSchedules: Record<string, ReminderSchedule>;
  setReminderSchedules: React.Dispatch<React.SetStateAction<Record<string, ReminderSchedule>>>;
  customReminders: CustomReminder[];
  setCustomReminders: React.Dispatch<React.SetStateAction<CustomReminder[]>>;
  addCustomReminder: (reminder: CustomReminder) => void;
  completeCustomReminder: (id: string) => void;
  deleteCustomReminder: (id: string) => void;
  addCommunicationHistory: (customerId: string, entry: CommunicationHistoryEntry) => void;
  addStatusHistory: (customerId: string, entry: StatusHistoryEntry) => void;
  addReminderHistory: (customerId: string, entry: ReminderHistoryEntry) => void;
  updateReminderSchedule: (customerId: string, schedule: ReminderSchedule) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
}

const CustomerDataContext = createContext<CustomerDataContextType | undefined>(undefined);

export function CustomerDataProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [statusHistory, setStatusHistory] = useState<Record<string, StatusHistoryEntry[]>>(mockStatusHistory);
  const [communicationHistory, setCommunicationHistory] = useState<Record<string, CommunicationHistoryEntry[]>>(mockCommunicationHistory);
  const [reminderHistory, setReminderHistory] = useState<Record<string, ReminderHistoryEntry[]>>({});
  const [reminderSchedules, setReminderSchedules] = useState<Record<string, ReminderSchedule>>({});
  const [customReminders, setCustomReminders] = useState<CustomReminder[]>([]);

  const addCommunicationHistory = (customerId: string, entry: CommunicationHistoryEntry) => {
    setCommunicationHistory((prev) => ({
      ...prev,
      [customerId]: [entry, ...(prev[customerId] || [])],
    }));
  };

  const addStatusHistory = (customerId: string, entry: StatusHistoryEntry) => {
    setStatusHistory((prev) => ({
      ...prev,
      [customerId]: [entry, ...(prev[customerId] || [])],
    }));
  };

  const addReminderHistory = (customerId: string, entry: ReminderHistoryEntry) => {
    setReminderHistory((prev) => ({
      ...prev,
      [customerId]: [entry, ...(prev[customerId] || [])],
    }));
  };

  const updateReminderSchedule = (customerId: string, schedule: ReminderSchedule) => {
    setReminderSchedules((prev) => ({
      ...prev,
      [customerId]: schedule,
    }));
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
  };

  const addCustomReminder = (reminder: CustomReminder) => {
    setCustomReminders((prev) => [reminder, ...prev]);
  };

  const completeCustomReminder = (id: string) => {
    setCustomReminders((prev) =>
      prev.map((r) => r.id === id ? { ...r, isCompleted: true, completedAt: new Date().toISOString() } : r)
    );
  };

  const deleteCustomReminder = (id: string) => {
    setCustomReminders((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <CustomerDataContext.Provider
      value={{
        customers,
        setCustomers,
        statusHistory,
        setStatusHistory,
        communicationHistory,
        setCommunicationHistory,
        reminderHistory,
        setReminderHistory,
        reminderSchedules,
        setReminderSchedules,
        customReminders,
        setCustomReminders,
        addCustomReminder,
        completeCustomReminder,
        deleteCustomReminder,
        addCommunicationHistory,
        addStatusHistory,
        addReminderHistory,
        updateReminderSchedule,
        updateCustomer,
      }}
    >
      {children}
    </CustomerDataContext.Provider>
  );
}

export function useCustomerData() {
  const context = useContext(CustomerDataContext);
  if (!context) {
    throw new Error('useCustomerData must be used within a CustomerDataProvider');
  }
  return context;
}
