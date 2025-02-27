"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Trash2, MoreHorizontal, FileEdit } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(row.original.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileEdit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
    pageSize={5}
  />
}

