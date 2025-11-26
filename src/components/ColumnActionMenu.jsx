import { ActionIcon, Menu } from '@mantine/core';
import { IconAdjustments, IconArrowDown, IconArrowUp, IconEyeOff } from '@tabler/icons-react';

/**
 * ColumnActionMenu renders an icon-only menu to sort/hide a column.
 * Props:
 * - columnKey: string
 * - sortConfig: { key: string, direction: 'asc' | 'desc' } | null
 * - onSort: (key, direction) => void
 * - onHide: (key) => void
 */
const ColumnActionMenu = ({ columnKey, sortConfig, onSort, onHide }) => {
  const isSorted = sortConfig?.key === columnKey ? sortConfig.direction : null;

  return (
    <Menu shadow="sm" withinPortal>
      <Menu.Target>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          radius="md"
          title="Sort / Hide"
        >
          {isSorted === 'asc' ? (
            <IconArrowUp size={16} />
          ) : isSorted === 'desc' ? (
            <IconArrowDown size={16} />
          ) : (
            <IconAdjustments size={16} />
          )}
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<IconArrowUp size={14} />} onClick={() => onSort(columnKey, 'asc')}>
          Sort Asc
        </Menu.Item>
        <Menu.Item leftSection={<IconArrowDown size={14} />} onClick={() => onSort(columnKey, 'desc')}>
          Sort Desc
        </Menu.Item>
        <Menu.Item leftSection={<IconEyeOff size={14} />} onClick={() => onHide(columnKey)}>
          Hide Column
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default ColumnActionMenu;
