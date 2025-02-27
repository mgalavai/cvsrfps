"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileDown, Eye, MoreHorizontal, Trash2 } from "lucide-react"
import { uploadCV, deleteCV } from "@/app/actions"
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

export default function CVManagement() {
  const [cvs, setCvs] = useState<Array<{ id: string; name: string; firstName: string; lastName: string; content: string }>>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // In a real app, you would upload the file to a server
      // For this demo, we'll simulate parsing the CV content
      const reader = new FileReader()
      reader.onload = async (event) => {
        const content = (event.target?.result as string) || ""
        
        // Extract name from filename (assuming format like "FirstName_LastName_CV.pdf")
        let firstName = ""
        let lastName = ""
        
        const filename = file.name
        const nameParts = filename.split('_')
        if (nameParts.length >= 2) {
          firstName = nameParts[0]
          lastName = nameParts[1]
        }
        
        const newCV = {
          id: Date.now().toString(),
          name: file.name,
          firstName,
          lastName,
          content,
        }

        // Call the server action to upload the CV
        await uploadCV(newCV)
        setCvs([...cvs, newCV])
        setIsUploading(false)
      }
      reader.readAsText(file)
    } catch (error) {
      console.error("Error uploading CV:", error)
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      // Call the server action to delete the CV
      await deleteCV(id)
      setCvs(cvs.filter((cv) => cv.id !== id))
    } catch (error) {
      console.error("Error deleting CV:", error)
    }
  }

  // Mock download function - in a real app, this would download the actual file
  const handleDownload = (cv: { id: string; name: string; content: string }) => {
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

  return (
    <div className="border rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-bold">CVs</h2>
        <p className="text-muted-foreground">Upload and manage candidate CVs</p>
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              id="cv-upload"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <Button disabled={isUploading} variant="outline">
              {isUploading ? "Uploading..." : <Upload className="h-4 w-4 mr-2" />}
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Uploaded CVs</h3>
          {cvs.length === 0 ? (
            <p className="text-muted-foreground">No CVs uploaded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="h-12">
                  <TableHead>Candidate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cvs.map((cv) => {
                  const firstName = cv.firstName || '';
                  const lastName = cv.lastName || '';
                  const fullName = firstName && lastName ? `${firstName} ${lastName}` : cv.name;
                  
                  return (
                    <TableRow key={cv.id} className="h-12">
                      <TableCell className="py-2">{fullName}</TableCell>
                      <TableCell className="py-2">
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
                          
                          {/* View Content Modal */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="View Content"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>{cv.firstName} {cv.lastName}'s CV</DialogTitle>
                                <DialogDescription>Content extracted from the CV</DialogDescription>
                              </DialogHeader>
                              <div className="mt-4 p-4 bg-muted rounded-md">
                                <pre className="whitespace-pre-wrap">{cv.content}</pre>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          {/* More options dropdown with delete */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(cv.id)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  )
}

