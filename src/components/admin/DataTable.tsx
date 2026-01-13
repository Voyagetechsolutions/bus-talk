import React from 'react';

interface Column<T> {
    key: keyof T | string;
    label: string;
    render?: (item: T) => React.ReactNode;
    width?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    keyExtractor: (item: T) => string;
    emptyMessage?: string;
}

function DataTable<T>({
    columns,
    data,
    onEdit,
    onDelete,
    keyExtractor,
    emptyMessage = 'No data available'
}: DataTableProps<T>) {
    const hasActions = onEdit || onDelete;

    return (
        <div className="data-table-wrapper">
            <table className="data-table">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={String(col.key)} style={{ width: col.width }}>
                                {col.label}
                            </th>
                        ))}
                        {hasActions && <th style={{ width: '120px' }}>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length + (hasActions ? 1 : 0)} className="empty-row">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((item) => (
                            <tr key={keyExtractor(item)}>
                                {columns.map((col) => (
                                    <td key={String(col.key)}>
                                        {col.render
                                            ? col.render(item)
                                            : String((item as any)[col.key] ?? '-')}
                                    </td>
                                ))}
                                {hasActions && (
                                    <td className="actions-cell">
                                        {onEdit && (
                                            <button
                                                className="action-btn edit"
                                                onClick={() => onEdit(item)}
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                className="action-btn delete"
                                                onClick={() => onDelete(item)}
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;
