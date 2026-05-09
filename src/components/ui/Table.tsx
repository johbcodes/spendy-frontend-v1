import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from './Button';
export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  mobilePriority?: number; // Lower numbers have higher priority for mobile display
  hideOnMobile?: boolean; // Explicitly hide on mobile
}
interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  compact?: boolean;
  itemsPerPage?: number;
  defaultSortKey?: string;
  defaultSortDirection?: 'asc' | 'desc';
}
export function Table<T extends {
  id: string;
}>({
  columns,
  data,
  onRowClick,
  selectable = false,
  onSelectionChange,
  compact = true,
  itemsPerPage = 15,
  defaultSortKey,
  defaultSortDirection = 'desc'
}: TableProps<T>) {
  type GenericRecord = Record<string, unknown>;
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey || null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Auto-detect date field if no default sort key is provided
  const dateFields = useMemo(() => {
    if (defaultSortKey) return [defaultSortKey];
    const possibleDateFields = ['dateTime', 'startDate', 'createdAt', 'date', 'updatedAt', 'dateRequested'];
    return possibleDateFields.filter(field => data.length > 0 && (data[0] as GenericRecord)[field] !== undefined);
  }, [data, defaultSortKey]);

  const handleSelectAllOnPage = () => {
    
    if (paginatedData.every(item => selectedIds.has(item.id))) {
      // Deselect all on current page
      const newSelected = new Set(selectedIds);
      paginatedData.forEach(item => newSelected.delete(item.id));
      setSelectedIds(newSelected);
      onSelectionChange?.(data.filter(d => newSelected.has(d.id)));
    } else {
      // Select all on current page
      const newSelected = new Set(selectedIds);
      paginatedData.forEach(item => newSelected.add(item.id));
      setSelectedIds(newSelected);
      onSelectionChange?.(data.filter(d => newSelected.has(d.id)));
    }
  };
  const handleSelectRow = (item: T) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(item.id)) {
      newSelected.delete(item.id);
    } else {
      newSelected.add(item.id);
    }
    setSelectedIds(newSelected);
    onSelectionChange?.(data.filter(d => newSelected.has(d.id)));
  };
  const paddingClass = compact ? 'px-3 py-2' : 'px-4 py-3';
  const textSize = compact ? 'text-sm' : 'text-base';

  // Apply sorting with "need items" first priority
  const sortedData = useMemo(() => {
    if (data.length === 0) return data;

    // If no sort key is set, try to auto-sort by date fields
    const effectiveSortKey = sortKey || dateFields[0];
    const effectiveSortDirection = sortKey ? sortDirection : defaultSortDirection;

    if (!effectiveSortKey) return data;

    return [...data].sort((a, b) => {
      const aValue = (a as GenericRecord)[effectiveSortKey];
      const bValue = (b as GenericRecord)[effectiveSortKey];

      // Check if items need attention (approval, pending status, etc.)
      const aNeedsAttention = (a as GenericRecord)['approvalRequired'] === true ||
                            (a as GenericRecord)['needsApproval'] === true ||
                            (a as GenericRecord)['status'] === 'Pending' ||
                            (a as GenericRecord)['paymentStatus'] === 'Pending';

      const bNeedsAttention = (b as GenericRecord)['approvalRequired'] === true ||
                            (b as GenericRecord)['needsApproval'] === true ||
                            (b as GenericRecord)['status'] === 'Pending' ||
                            (b as GenericRecord)['paymentStatus'] === 'Pending';

      // Items that need attention come first
      if (aNeedsAttention && !bNeedsAttention) return -1;
      if (!aNeedsAttention && bNeedsAttention) return 1;

      // Handle date sorting
      if (aValue && bValue && (typeof aValue === 'string' || typeof aValue === 'number' || typeof bValue === 'string' || typeof bValue === 'number')) {
        try {
          const dateA = new Date(aValue as string | number).getTime();
          const dateB = new Date(bValue as string | number).getTime();

          if (!isNaN(dateA) && !isNaN(dateB)) {
            return effectiveSortDirection === 'desc' ? dateB - dateA : dateA - dateB;
          }
        } catch (e) {
          // Fall back to string comparison if date parsing fails
        }
      }

      // Handle numeric sorting
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return effectiveSortDirection === 'desc' ? bValue - aValue : aValue - bValue;
      }

      // Handle string sorting
      const strA = String(aValue).toLowerCase();
      const strB = String(bValue).toLowerCase();
      return effectiveSortDirection === 'desc'
        ? strB.localeCompare(strA)
        : strA.localeCompare(strB);
    });
  }, [data, sortKey, sortDirection, dateFields, defaultSortDirection]);

  // Apply pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(sortedData.length / itemsPerPage);
  }, [sortedData, itemsPerPage]);
  // Sort columns by mobile priority for mobile display
  const sortedColumns = [...columns].sort((a, b) => {
    const aPriority = a.mobilePriority !== undefined ? a.mobilePriority : 999;
    const bPriority = b.mobilePriority !== undefined ? b.mobilePriority : 999;
    return aPriority - bPriority;
  });
  return <div className="w-full">
      {/* Desktop view - standard table */}
      <div className="hidden md:block">
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className={`w-full ${textSize}`}>
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                {selectable && <th className={`${paddingClass} text-left`}>
                    <input type="checkbox" checked={paginatedData.length > 0 && paginatedData.every(item => selectedIds.has(item.id))} onChange={handleSelectAllOnPage} className="rounded transition-all duration-200 hover:scale-110" />
                  </th>}
                {columns.map(column => <th key={column.key} className={`${paddingClass} text-left font-semibold text-dark-gray`}>
                    <div className="flex items-center gap-1">
                      <span>{column.label}</span>
                    </div>
                  </th>)}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map(item => <tr key={item.id} onClick={() => onRowClick?.(item)} className={`transition-all duration-200 ${onRowClick ? 'cursor-pointer hover:bg-blue-50/50 hover:shadow-sm' : 'hover:bg-gray-50'}`}>
                  {selectable && <td className={paddingClass}>
                      <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => handleSelectRow(item)} onClick={e => e.stopPropagation()} className="rounded transition-all duration-200 hover:scale-110" />
                    </td>}
                  {columns.map(column => <td key={column.key} className={paddingClass}>
                      {column.render ? column.render(item) : String((item as GenericRecord)[column.key])}
                    </td>)}
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile view - stacked cards */}
      <div className="md:hidden space-y-4">
        {paginatedData.map(item => <div key={item.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 space-y-4">
              {sortedColumns
                .filter(col => !col.hideOnMobile)
                .map(column => <div key={column.key} className="flex flex-col">
                    <div className="text-xs font-medium text-gray-500 uppercase mb-1">{column.label}</div>
                    <div className="text-sm text-dark-gray">
                      {column.render ? column.render(item) : String((item as GenericRecord)[column.key])}
                    </div>
                  </div>)}
            </div>
            {onRowClick && <button onClick={() => onRowClick(item)} className="w-full py-2 bg-gray-50 text-sm font-medium text-azure hover:bg-gray-100 transition-colors">
                View Details
              </button>}
          </div>)}
      </div>

      {/* Pagination controls - shown for both desktop and mobile */}
      {totalPages > 1 && <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="transition-all duration-200 hover:bg-gray-100"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              <span>Previous</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="transition-all duration-200 hover:bg-gray-100"
            >
              <span>Next</span>
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} ({sortedData.length} items)
          </div>
        </div>}
    </div>;
}
