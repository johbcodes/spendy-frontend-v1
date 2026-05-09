import React from 'react';
import { Table, Column } from './components/ui/Table';

// Test data that should reveal any sorting issues
const testData = [
  {
    id: '1',
    name: 'Item A',
    amount: 1000,
    date: '2023-01-15T10:30:00Z',
    status: 'Pending'
  },
  {
    id: '2',
    name: 'Item B',
    amount: 5000,
    date: '2023-02-20T14:45:00Z',
    status: 'Completed'
  },
  {
    id: '3',
    name: 'Item C',
    amount: 2500,
    date: '2023-01-10T09:15:00Z',
    status: 'Failed'
  },
  {
    id: '4',
    name: 'Item D',
    amount: 30000,
    date: '2023-03-05T16:20:00Z',
    status: 'Completed'
  },
  {
    id: '5',
    name: 'Item E',
    amount: 15000,
    date: '2023-02-15T11:00:00Z',
    status: 'Pending'
  }
];

const columns: Column<any>[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true
  },
  {
    key: 'amount',
    label: 'Amount',
    sortable: true,
    render: item => `KES ${item.amount.toLocaleString()}`
  },
  {
    key: 'date',
    label: 'Date',
    sortable: true,
    render: item => new Date(item.date).toLocaleDateString()
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true
  }
];

// Test the sorting logic directly
const testSortingLogic = () => {
  console.log('Testing sorting logic...');

  // Test amount sorting - descending (largest to smallest)
  const amountDesc = [...testData].sort((a, b) => b.amount - a.amount);
  console.log('Amount Descending:', amountDesc.map(item => item.amount));

  // Test amount sorting - ascending (smallest to largest)
  const amountAsc = [...testData].sort((a, b) => a.amount - b.amount);
  console.log('Amount Ascending:', amountAsc.map(item => item.amount));

  // Test date sorting - descending (most recent first)
  const dateDesc = [...testData].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  console.log('Date Descending:', dateDesc.map(item => item.date));

  // Test date sorting - ascending (oldest first)
  const dateAsc = [...testData].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  console.log('Date Ascending:', dateAsc.map(item => item.date));

  // Test status sorting - descending (Z-A)
  const statusDesc = [...testData].sort((a, b) =>
    b.status.localeCompare(a.status)
  );
  console.log('Status Descending:', statusDesc.map(item => item.status));

  // Test status sorting - ascending (A-Z)
  const statusAsc = [...testData].sort((a, b) =>
    a.status.localeCompare(b.status)
  );
  console.log('Status Ascending:', statusAsc.map(item => item.status));
};

// Run the test when this module is imported
testSortingLogic();

export function VerifySortingTest() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Sorting Verification Test</h1>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Test Data</h2>
        <Table
          columns={columns}
          data={testData}
          defaultSortKey="date"
          defaultSortDirection="desc"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Expected Results</h2>

        <div className="space-y-2">
          <h3 className="font-medium">Amount Sorting:</h3>
          <p>- Descending: 30000, 15000, 5000, 2500, 1000</p>
          <p>- Ascending: 1000, 2500, 5000, 15000, 30000</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Date Sorting:</h3>
          <p>- Descending: 2023-03-05, 2023-02-20, 2023-02-15, 2023-01-15, 2023-01-10</p>
          <p>- Ascending: 2023-01-10, 2023-01-15, 2023-02-15, 2023-02-20, 2023-03-05</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Status Sorting:</h3>
          <p>- Descending: Pending, Pending, Failed, Completed, Completed</p>
          <p>- Ascending: Completed, Completed, Failed, Pending, Pending</p>
        </div>
      </div>
    </div>
  );
}
