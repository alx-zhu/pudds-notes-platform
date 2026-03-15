"use no memo";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { FlaskConical } from "lucide-react";
import type { Trial } from "@/types/trial";
import { columns } from "./columns";

interface TrialsTableProps {
  trials: Trial[];
}

export const TrialsTable = ({ trials }: TrialsTableProps) => {
  const navigate = useNavigate();

  const table = useReactTable({
    data: trials,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (trials.length === 0) {
    return (
      <div className="rounded-xl bg-card ring-1 ring-border/60 overflow-hidden">
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
            <FlaskConical size={18} className="text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No trials yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card ring-1 ring-border/60 overflow-hidden overflow-x-auto">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-border">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30"
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-border/40 last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate(`/trials/${row.original.id}`)}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-4 py-3 align-middle"
                  style={{ width: cell.column.getSize() }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
