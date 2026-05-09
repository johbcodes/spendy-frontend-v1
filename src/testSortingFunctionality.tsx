import React, { useState } from 'react';
import { Table, Column } from './components/ui/Table';

// Test data for payments
const testPayments = [
  {
    id: '1',
    initiatedBy: 'John Doe',
    recipient: 'Supplier A',
    amount: 5000,
    mpesaCode: 'A1B2C3',
    type: 'M-Pesa',
    status: 'Completed',
    dateTime: '2023-01-15T10:30:00Z'
  },
  {
    id: '2',
    initiatedBy: 'Jane Smith',
    recipient: 'Supplier B',
    amount: 15000,
    mpesaCode: 'D4E5F6',
    type: 'M-Pesa',
    status: 'Pending',
    dateTime: '2023-02-20T14:45:00Z'
  },
  {
    id: '3',
    initiatedBy: 'Bob Johnson',
    recipient: 'Supplier C',
    amount: 2500,
    mpesaCode: 'G7H8I9',
    type: 'M-Pesa',
    status: 'Completed',
    dateTime: '2023-01-10T09:15:00Z'
  },
  {
    id: '4',
    initiatedBy: 'Alice Williams',
    recipient: 'Supplier D',
    amount: 30000,
    mpesaCode: 'J1K2L3',
    type: 'M-Pesa',
    status: 'Failed',
    dateTime: '2023-03-05T16:20:00Z'
  }
];

// Test columns configuration
const testColumns: Column<any>[] = [
  {
    key: 'initiatedBy',
    label: 'Initiated By'
  },
  {
    key: 'recipient',
    label: 'Recipient'
  },
  {
    key: 'amount',
    label: 'Amount',
    sortable: true,
    render: payment => `KES ${payment.amount.toLocaleString()}`
  },
  {
    key: 'dateTime',
    label: 'Date & Time',
    sortable: true,
    render: payment => new Date(payment.dateTime).toLocaleString()
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true
  }
];

export function TestSortingFunctionality() {
  const [sortKey, setSortKey] = useState<string>('dateTime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSortChange = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Sorting Functionality Test</h1>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Test Controls</h2>

        <div className="flex gap-4">
          <button
            onClick={() => handleSortChange('amount')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Sort by Amount ({sortKey === 'amount' ? sortDirection : 'none'})
          </button>

          <button
            onClick={() => handleSortChange('dateTime')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Sort by Date ({sortKey === 'dateTime' ? sortDirection : 'none'})
          </button>

          <button
            onClick={() => handleSortChange('status')}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Sort by Status ({sortKey === 'status' ? sortDirection : 'none'})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Current Sort: {sortKey} ({sortDirection})</h2>

          <Table
          columns={testColumns}
          data={testPayments}
          defaultSortKey={sortKey}
          defaultSortDirection={sortDirection}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Expected Results</h2>

        <div className="space-y-2">
          <h3 className="font-medium">Amount Sorting:</h3>
          <p>- Descending: 30000, 15000, 5000, 2500</p>
          <p>- Ascending: 2500, 5000, 15000, 30000</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Date Sorting:</h3>
          <p>- Descending (most recent first): 2023-03-05, 2023-02-20, 2023-01-15, 2023-01-10</p>
          <p>- Ascending (oldest first): 2023-01-10, 2023-01-15, 2023-02-20, 2023-03-05</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Status Sorting:</h3>
          <p>- Descending: Pending, Completed, Failed (alphabetical Z-A)</p>
          <p>- Ascending: Completed, Failed, Pending (alphabetical A-Z)</p>
        </div>
      </div>
    </div>
  );
}
