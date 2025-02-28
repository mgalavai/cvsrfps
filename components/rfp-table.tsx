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
import { useState } from "react"
import { RFPDetailSheet } from "@/components/rfp-detail-sheet"

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
  onSave?: (rfp: RFP) => Promise<void>
}

export function RFPTable({ 
  data, 
  selectedRFPs, 
  onToggleSelect, 
  onDelete,
  onSave
}: RFPTableProps) {
  const [selectedRFP, setSelectedRFP] = useState<RFP | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const columns: ColumnDef<RFP>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value)
              data.forEach((rfp) => onToggleSelect(rfp.id))
            }}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={selectedRFPs.includes(row.original.id)}
            onCheckedChange={() => onToggleSelect(row.original.id)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 20,
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent font-bold text-emphasis"
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium truncate" title={row.original.title}>{row.original.title}</div>,
      size: 250,
    },
    {
      accessorKey: "requirements",
      header: "Requirements",
      cell: ({ row }) => <div className="truncate" title={row.original.requirements}>{row.original.requirements}</div>,
      size: 350,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const rfp = row.original;
        
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedRFP(rfp);
                    setDetailOpen(true);
                  }}
                >
                  <FileEdit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(rfp.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
      size: 50,
    },
  ]

  return (
    <>
      <DataTable 
        columns={columns} 
        data={data} 
        filterColumn="position" 
        placeholder="Filter positions..." 
        classNameRow="h-10"
        classNameCell="py-1"
        pageSize={5}
      />
      
      <RFPDetailSheet
        rfp={selectedRFP}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onSave={onSave}
      />
    </>
  )
}

