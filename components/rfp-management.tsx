"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus } from "lucide-react"
import { addRFP, deleteRFP } from "@/app/actions"

export default function RFPManagement() {
  const [rfps, setRfps] = useState<Array<{ id: string; title: string; description: string; requirements: string }>>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [requirements, setRequirements] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !requirements) return

    setIsSubmitting(true)
    try {
      const newRFP = {
        id: Date.now().toString(),
        title,
        description,
        requirements,
      }

      // Call the server action to add the RFP
      await addRFP(newRFP)
      setRfps([...rfps, newRFP])

      // Reset form
      setTitle("")
      setDescription("")
      setRequirements("")
      setIsSubmitting(false)
    } catch (error) {
      console.error("Error adding RFP:", error)
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      // Call the server action to delete the RFP
      await deleteRFP(id)
      setRfps(rfps.filter((rfp) => rfp.id !== id))
    } catch (error) {
      console.error("Error deleting RFP:", error)
    }
  }

  return (
    <div className="border rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-bold">RFPs</h2>
        <p className="text-muted-foreground">Add and manage Request for Proposals</p>
      </div>
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">RFP Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter RFP title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter RFP description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Enter skills, experience, and other requirements"
              rows={5}
              required
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Adding..." : <Plus className="h-4 w-4 mr-2" />}
            {isSubmitting ? "Adding..." : "Add RFP"}
          </Button>
        </form>

        <div>
          <h3 className="text-lg font-medium mb-2">Added RFPs</h3>
          {rfps.length === 0 ? (
            <p className="text-muted-foreground">No RFPs added yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Requirements</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfps.map((rfp) => (
                  <TableRow key={rfp.id}>
                    <TableCell className="font-medium">{rfp.title}</TableCell>
                    <TableCell className="truncate max-w-[300px]">{rfp.requirements}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(rfp.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  )
}

