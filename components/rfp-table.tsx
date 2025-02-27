"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Trash2 } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { cn } from "@/lib/utils"

interface RFP {
  id: string
  title: string
  description: string
  requirements: string
}

interface RFPTableProps {
  data: RFP[]
  selectedRFPs: string[]
  onToggleSelect: (id: string) => void
  onDelete: (id: string) => void
}

export function RFPTable({ data, selectedRFPs, onToggleSelect, onDelete }: RFPTableProps) {
  const columns: ColumnDef<RFP>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value)
            data.forEach((rfp) => onToggleSelect(rfp.id))
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedRFPs.includes(row.original.id)}
          onCheckedChange={() => onToggleSelect(row.original.id)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "requirements",
      header: "Requirements",
      cell: ({ row }) => <div className="truncate max-w-[300px]">{row.original.requirements}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 text-destructive"
            onClick={() => onDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return <DataTable 
    columns={columns} 
    data={data} 
    filterColumn="title" 
    placeholder="Filter RFPs..." 
    classNameRow="h-12"
    classNameCell="py-2"
  />
}

