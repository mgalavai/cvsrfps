"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, FilePlus, Database } from "lucide-react"
import { uploadCV, deleteCV, deleteRFP, matchCVsToRFPs } from "@/app/actions"
import RFPForm from "@/components/rfp-form"
import { CVTable } from "@/components/cv-table"
import { RFPTable } from "@/components/rfp-table"
import { CollapsibleSection, StickyHeader } from "@/components/collapsible-sections"

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
  
  // Collapsible state
  const [dataSectionOpen, setDataSectionOpen] = useState(true)
  const dataSectionRef = useRef<HTMLDivElement>(null)

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

  const scrollToDataSection = () => {
    setDataSectionOpen(true)
    dataSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="space-y-8">
      <StickyHeader 
        cvCount={cvs.length} 
        rfpCount={rfps.length} 
        onExpandCV={() => scrollToDataSection()} 
        onExpandRFP={() => scrollToDataSection()} 
        selectedCVCount={selectedCVs.length}
        selectedRFPCount={selectedRFPs.length}
        onMatch={handleMatch}
        isMatchingDisabled={isMatching || selectedCVs.length === 0 || selectedRFPs.length === 0}
      />

      <div ref={dataSectionRef}>
        <CollapsibleSection 
          title="Candidates & Requirements" 
          icon={<Database className="h-5 w-5" />}
          count={cvs.length + rfps.length}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CV Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <h3 className="text-sm font-bold text-emphasis">CVs ({cvs.length})</h3>
                  {selectedCVs.length > 0 && 
                    <span className="text-xs bg-primary/10 text-primary rounded-full px-2">
                      {selectedCVs.length} selected
                    </span>
                  }
                </div>
                
                <label htmlFor="cv-upload" className="cursor-pointer">
                  <Button 
                    disabled={isUploading} 
                    variant="outline" 
                    className="flex items-center gap-1"
                    type="button"
                    asChild
                  >
                    <div>
                      {isUploading ? "Uploading..." : <Upload className="h-4 w-4 mr-1" />}
                      {isUploading ? "Uploading..." : "Upload"}
                    </div>
                  </Button>
                  <input
                    id="cv-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>
              
              {cvs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No CVs uploaded yet.</p>
              ) : (
                <CVTable data={cvs} selectedCVs={selectedCVs} onToggleSelect={toggleCV} onDelete={handleDeleteCV} />
              )}
            </div>
            
            {/* RFP Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FilePlus className="h-4 w-4" />
                  <h3 className="text-sm font-bold text-emphasis">RFPs ({rfps.length})</h3>
                  {selectedRFPs.length > 0 && 
                    <span className="text-xs bg-primary/10 text-primary rounded-full px-2">
                      {selectedRFPs.length} selected
                    </span>
                  }
                </div>
                
                <RFPForm onRFPAdded={(newRFP) => setRfps([...rfps, newRFP])} />
              </div>
              
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
        </CollapsibleSection>
      </div>

      {/* Matching Section */}
      <div className="py-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-heading mb-1">Match Results</h2>
          <p className="text-sm text-subtitle">View matching results between selected CVs and RFPs</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-emphasis">
                Selected: {selectedCVs.length} CVs and {selectedRFPs.length} RFPs
              </p>
            </div>
            <Button
              onClick={handleMatch}
              disabled={isMatching || selectedCVs.length === 0 || selectedRFPs.length === 0}
              className="px-8 font-medium"
            >
              {isMatching ? "Matching..." : "Match Selected"}
            </Button>
          </div>

          {matchResults.length > 0 ? (
            <div className="overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
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
                      <TableCell className="font-medium">{result.cvName}</TableCell>
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
          ) : (
            <div className="text-center p-8 bg-muted/10">
              <p className="text-muted-foreground mb-2">No matches yet</p>
              <p className="text-sm">Select CVs and RFPs above and click "Match Selected" to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

