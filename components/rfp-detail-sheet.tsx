"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

interface RFP {
  id: string
  title: string
  description: string
  requirements: string
}

interface RFPDetailSheetProps {
  rfp: RFP | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (rfp: RFP) => Promise<void>
}

export function RFPDetailSheet({ 
  rfp, 
  open, 
  onOpenChange, 
  onSave
}: RFPDetailSheetProps) {
  const [editedTitle, setEditedTitle] = useState("")
  const [editedDescription, setEditedDescription] = useState("")
  const [editedRequirements, setEditedRequirements] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Update edited content when RFP changes
  useEffect(() => {
    if (rfp) {
      setEditedTitle(rfp.title)
      setEditedDescription(rfp.description)
      setEditedRequirements(rfp.requirements)
    }
  }, [rfp])

  const handleSave = async () => {
    if (!rfp || !onSave) return

    setIsSaving(true)
    try {
      await onSave({
        ...rfp,
        title: editedTitle,
        description: editedDescription,
        requirements: editedRequirements
      })
      setIsSaving(false)
    } catch (error) {
      console.error("Error saving RFP:", error)
      setIsSaving(false)
    }
  }

  if (!rfp) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl w-full flex flex-col">
        <SheetHeader>
          <SheetTitle>{rfp.title}</SheetTitle>
          <SheetDescription>
            Edit the RFP details
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col flex-1 py-4 overflow-auto">
          <div className="space-y-6 pr-2 flex-1">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Enter RFP title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Enter RFP description"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                value={editedRequirements}
                onChange={(e) => setEditedRequirements(e.target.value)}
                placeholder="Enter skills, experience, and other requirements"
                rows={10}
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-4 mt-auto">
            <Button 
              onClick={handleSave}
              disabled={isSaving || (
                editedTitle === rfp.title && 
                editedDescription === rfp.description && 
                editedRequirements === rfp.requirements
              )}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 