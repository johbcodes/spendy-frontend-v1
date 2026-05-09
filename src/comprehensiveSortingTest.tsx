import React, { useState } from 'react';
import { Table, Column } from './components/ui/Table';
import { Button } from './components/ui/Button';

// Comprehensive test data that covers all sorting scenarios
const comprehensiveTestData = [
  // Test data with various amounts, dates, and statuses
  {
    id: '1',
    name: 'Payment A',
    amount: 1000,
    date: '2023-01-15T10:30:00Z',
    status: 'Pending'
  },
  {
    id: '2',
    name: 'Payment B',
    amount: 50000,
    date: '2023-03-20T14:45:00Z',
    status: 'Completed'
  },
  {
    id: '3',
    name: 'Payment C',
    amount: 25000,
    date: '2023-02-10T09:15:00Z',
    status: 'Failed'
  },
  {
    id: '4',
    name: 'Payment D',
    amount: 300000,
    date: '2023-04-05T16:20:00Z',
    status: 'Completed'
  },
  {
    id: '5',
    name: 'Payment E',
    amount: 15000,
    date: '2023-02-15T11:00:00Z',
    status: 'Pending'
  },
  {
    id: '6',
    name: 'Payment F',
    amount: 75000,
    date: '2023-03-01T08:30:00Z',
    status: 'Completed'
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
    sortable: true,
    render: item => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        item.status === 'Completed' ? 'bg-green-100 text-green-800' :
        item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        {item.status}
      </span>
    )
  },
  {
    key: 'actions',
    label: 'Actions',
    render: item => (
      <Button
        variant={item.status === 'Pending' ? "primary" : "secondary"}
        size="sm"
      >
        {item.status === 'Pending' ? 'Pay' : 'View'}
      </Button>
    )
  }
];

export function ComprehensiveSortingTest() {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: 'date', direction: 'desc' });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Comprehensive Sorting Test</h1>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Test Controls</h2>

        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => handleSort('amount')}
            className={`px-4 py-2 rounded hover:bg-blue-600 transition-colors ${
              sortConfig.key === 'amount' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'
            }`}
          >
            Sort Amount: {sortConfig.key === 'amount' ? sortConfig.direction : 'none'}
          </button>

          <button
            onClick={() => handleSort('date')}
            className={`px-4 py-2 rounded hover:bg-green-600 transition-colors ${
              sortConfig.key === 'date' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800'
            }`}
          >
            Sort Date: {sortConfig.key === 'date' ? sortConfig.direction : 'none'}
          </button>

          <button
            onClick={() => handleSort('status')}
            className={`px-4 py-2 rounded hover:bg-purple-600 transition-colors ${
              sortConfig.key === 'status' ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-800'
            }`}
          >
            Sort Status: {sortConfig.key === 'status' ? sortConfig.direction : 'none'}
          </button>

          <button
            onClick={() => handleSort('name')}
            className={`px-4 py-2 rounded hover:bg-gray-600 transition-colors ${
              sortConfig.key === 'name' ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-800'
            }`}
          >
            Sort Name: {sortConfig.key === 'name' ? sortConfig.direction : 'none'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Current Sort: {sortConfig.key} ({sortConfig.direction})</h2>

        <Table
          columns={columns}
          data={comprehensiveTestData}
          defaultSortKey={sortConfig.key}
          defaultSortDirection={sortConfig.direction}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Expected Results</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Amount Sorting:</h3>
            <p className="text-sm">- Descending (largest to smallest): 300000, 75000, 50000, 25000, 15000, 1000</p>
            <p className="text-sm">- Ascending (smallest to largest): 1000, 15000, 25000, 50000, 75000, 300000</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Date Sorting:</h3>
            <p className="text-sm">- Descending (most recent first): 2023-04-05, 2023-03-20, 2023-03-01, 2023-02-15, 2023-02-10, 2023-01-15</p>
            <p className="text-sm">- Ascending (oldest first): 2023-01-15, 2023-02-10, 2023-02-15, 2023-03-01, 2023-03-20, 2023-04-05</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Status Sorting:</h3>
            <p className="text-sm">- Descending (Z-A): Pending, Pending, Completed, Completed, Completed, Failed</p>
            <p className="text-sm">- Ascending (A-Z): Completed, Completed, Completed, Failed, Pending, Pending</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Button Rendering:</h3>
            <p className="text-sm">- Pending payments should show "Pay" button (primary variant)</p>
            <p className="text-sm">- Completed/Failed payments should show "View" button (secondary variant)</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Test Verification</h2>
        <p className="text-sm text-gray-600">
          Click the sort buttons above to test sorting functionality. Verify that:
        </p>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
          <li>Amounts sort correctly from largest to smallest and vice versa</li>
          <li>Dates sort correctly from most recent to oldest and vice versa</li>
          <li>Statuses sort alphabetically in both directions</li>
          <li>Names sort alphabetically in both directions</li>
          <li>Pay/View buttons render correctly based on status</li>
          <li>Sort direction toggles correctly when clicking the same column</li>
        </ul>
      </div>
    </div>
  );
}
