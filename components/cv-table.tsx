"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, FileDown, Eye, MoreHorizontal, Trash2 } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { CVDetailSheet } from "@/components/cv-detail-sheet"
import { useState } from "react"

interface CV {
  id: string
  name: string
  firstName: string
  lastName: string
  content: string
}

export interface CVTableProps {
  data: CV[]
  selectedCVs: string[]
  onToggleSelect: (id: string) => void
  onDelete: (id: string) => void
  onSaveContent?: (cv: CV) => Promise<void>
  onReanalyze?: (cv: CV) => Promise<void>
}

export function CVTable({ 
  data, 
  selectedCVs, 
  onToggleSelect, 
  onDelete,
  onSaveContent,
  onReanalyze
}: CVTableProps) {
  // Mock download function - in a real app, this would download the actual file
  const handleDownload = (cv: CV) => {
    // Create a mock text file with the CV content
    const blob = new Blob([cv.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = cv.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const [selectedCV, setSelectedCV] = useState<CV | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const columns: ColumnDef<CV>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value)
              data.forEach((cv) => onToggleSelect(cv.id))
            }}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={selectedCVs.includes(row.original.id)}
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
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent font-bold text-emphasis"
          >
            Candidate
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const firstName = row.original.firstName || '';
        const lastName = row.original.lastName || '';
        const fullName = firstName && lastName ? `${firstName} ${lastName}` : row.original.name;
        
        return (
          <div className="flex items-center">
            <span className="font-medium truncate" title={fullName}>{fullName}</span>
          </div>
        )
      },
      size: 400,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const cv = row.original;
        
        return (
          <div className="flex items-center justify-end gap-1">
            {/* Download PDF button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              title="Download CV"
              onClick={() => handleDownload(cv)}
            >
              <FileDown className="h-4 w-4" />
            </Button>
            
            {/* View/Edit CV button */}
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0"
              title="View/Edit CV"
              onClick={() => {
                setSelectedCV(cv);
                setDetailOpen(true);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {/* More options dropdown with delete */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(cv.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
      size: 120,
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        filterColumn="name"
        placeholder="Filter CVs..."
        classNameRow="h-10"
        classNameCell="py-1"
        pageSize={5}
      />
      
      <CVDetailSheet
        cv={selectedCV}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onSave={onSaveContent}
        onReanalyze={onReanalyze}
      />
    </>
  )
}

