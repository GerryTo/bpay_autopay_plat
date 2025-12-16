import { useMemo, useState } from 'react';

/**
 * useTableControls
 * Handles column visibility, sorting, and reset logic.
 * @param {Array} columns - Array of column definitions with unique `key`.
 * @param {Object} options - { onResetFilters?: Function, onResetSelection?: Function }
 */
export const useTableControls = (columns = [], options = {}) => {
  const { onResetFilters, onResetSelection } = options;

  const defaultVisibility = useMemo(() => {
    return columns.reduce((acc, col) => {
      acc[col.key] = true;
      return acc;
    }, {});
  }, [columns]);

  const [columnVisibility, setColumnVisibility] = useState(defaultVisibility);
  const [sortConfig, setSortConfig] = useState(null); // { key, direction }

  const visibleColumns = useMemo(
    () => columns.filter((col) => columnVisibility[col.key]),
    [columns, columnVisibility]
  );

  const handleHideColumn = (key) => {
    setColumnVisibility((prev) => ({ ...prev, [key]: false }));
  };

  const handleSort = (key, direction) => {
    setSortConfig((prev) => {
      if (!direction) return null;
      if (prev?.key === key && prev.direction === direction) return null;
      return { key, direction };
    });
  };

  const handleResetAll = () => {
    setColumnVisibility(defaultVisibility);
    setSortConfig(null);
    onResetFilters?.();
    onResetSelection?.();
  };

  return {
    columnVisibility,
    visibleColumns,
    sortConfig,
    handleHideColumn,
    handleSort,
    handleResetAll,
  };
};
