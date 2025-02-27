"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Upload } from "lucide-react"
import { uploadCV, deleteCV, deleteRFP, matchCVsToRFPs } from "@/app/actions"
import RFPForm from "@/components/rfp-form"
import { CVTable } from "@/components/cv-table"
import { RFPTable } from "@/components/rfp-table"

type CV = {
  id: string
  name: string
  firstName: string
  lastName: string
  content: string
}

type RFP = {
  id: string
  title: string
  description: string
  requirements: string
}

type MatchResult = {
  cvId: string
  cvName: string
  rfpId: string
  rfpTitle: string
  score: number
  matchedKeywords: string[]
}

export default function IntegratedMatching() {
  // CV state
  const [cvs, setCvs] = useState<CV[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // RFP state
  const [rfps, setRfps] = useState<RFP[]>([])

  // Matching state
  const [selectedCVs, setSelectedCVs] = useState<string[]>([])
  const [selectedRFPs, setSelectedRFPs] = useState<string[]>([])
  const [matchResults, setMatchResults] = useState<MatchResult[]>([])
  const [isMatching, setIsMatching] = useState(false)

  // Initialize with dummy data
  useEffect(() => {
    setCvs([
      {
        id: "1",
        name: "John_Doe_CV.pdf",
        firstName: "John",
        lastName: "Doe",
        content: "Software Engineer with 5 years of experience in React, Node.js, and TypeScript.",
      },
      {
        id: "2",
        name: "Jane_Smith_CV.pdf",
        firstName: "Jane",
        lastName: "Smith",
        content: "UX Designer with expertise in Figma, user research, and prototyping.",
      },
      {
        id: "3",
        name: "Bob_Johnson_CV.pdf",
        firstName: "Bob",
        lastName: "Johnson",
        content: "Project Manager with PMP certification and 7 years of experience in Agile methodologies.",
      },
    ])

    setRfps([
      {
        id: "1",
        title: "Frontend Developer",
        description: "Looking for a frontend developer",
        requirements: "React, TypeScript, 3+ years experience",
      },
      {
        id: "2",
        title: "UX/UI Designer",
        description: "Need a designer for our product",
        requirements: "Figma, user testing, wireframing",
      },
      {
        id: "3",
        title: "Technical Project Manager",
        description: "Managing our development team",
        requirements: "Agile, Scrum, 5+ years experience",
      },
    ])
  }, [])

  // CV handlers
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

  const handleDeleteCV = async (id: string) => {
    try {
      // Call the server action to delete the CV
      await deleteCV(id)
      setCvs(cvs.filter((cv) => cv.id !== id))
      setSelectedCVs(selectedCVs.filter((cvId) => cvId !== id))
    } catch (error) {
      console.error("Error deleting CV:", error)
    }
  }

  // RFP handlers
  const handleDeleteRFP = async (id: string) => {
    try {
      // Call the server action to delete the RFP
      await deleteRFP(id)
      setRfps(rfps.filter((rfp) => rfp.id !== id))
      setSelectedRFPs(selectedRFPs.filter((rfpId) => rfpId !== id))
    } catch (error) {
      console.error("Error deleting RFP:", error)
    }
  }

  // Matching handlers
  const toggleCV = (id: string) => {
    setSelectedCVs((prev) => (prev.includes(id) ? prev.filter((cvId) => cvId !== id) : [...prev, id]))
  }

  const toggleRFP = (id: string) => {
    setSelectedRFPs((prev) => (prev.includes(id) ? prev.filter((rfpId) => rfpId !== id) : [...prev, id]))
  }

  const handleMatch = async () => {
    if (selectedCVs.length === 0 || selectedRFPs.length === 0) return

    setIsMatching(true)
    try {
      // Get the selected CVs and RFPs
      const selectedCVData = cvs.filter((cv) => selectedCVs.includes(cv.id))
      const selectedRFPData = rfps.filter((rfp) => selectedRFPs.includes(rfp.id))

      // Call the server action to match CVs to RFPs
      const results = await matchCVsToRFPs(selectedCVData, selectedRFPData)
      setMatchResults(results)
      setIsMatching(false)
    } catch (error) {
      console.error("Error matching CVs to RFPs:", error)
      setIsMatching(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="border rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CV Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-muted-foreground">CVs</h2>
              <p className="text-sm text-muted-foreground">Upload and manage candidate CVs</p>
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
                {cvs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No CVs uploaded yet.</p>
                ) : (
                  <CVTable data={cvs} selectedCVs={selectedCVs} onToggleSelect={toggleCV} onDelete={handleDeleteCV} />
                )}
              </div>
            </div>
          </div>

          {/* RFP Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-muted-foreground">RFPs</h2>
              <p className="text-sm text-muted-foreground">Add and manage Request for Proposals</p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <RFPForm onRFPAdded={(newRFP) => setRfps([...rfps, newRFP])} />
              </div>

              <div>
                {rfps.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No RFPs added yet.</p>
                ) : (
                  <RFPTable
                    data={rfps}
                    selectedRFPs={selectedRFPs}
                    onToggleSelect={toggleRFP}
                    onDelete={handleDeleteRFP}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Matching Section */}
      <div className="border rounded-lg p-6 bg-muted/50">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-muted-foreground">Match Results</h2>
          <p className="text-sm text-muted-foreground">View matching results between selected CVs and RFPs</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                Selected: {selectedCVs.length} CVs and {selectedRFPs.length} RFPs
              </p>
            </div>
            <Button
              onClick={handleMatch}
              disabled={isMatching || selectedCVs.length === 0 || selectedRFPs.length === 0}
              className="px-8"
            >
              {isMatching ? "Matching..." : "Match Selected"}
            </Button>
          </div>

          {matchResults.length > 0 && (
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>CV</TableHead>
                    <TableHead>RFP</TableHead>
                    <TableHead>Match Score</TableHead>
                    <TableHead>Matched Keywords</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matchResults.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>{result.cvName}</TableCell>
                      <TableCell>{result.rfpTitle}</TableCell>
                      <TableCell>
                        <Badge variant={result.score > 70 ? "success" : result.score > 40 ? "warning" : "destructive"}>
                          {result.score}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {result.matchedKeywords.map((keyword, i) => (
                            <Badge key={i} variant="outline">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

