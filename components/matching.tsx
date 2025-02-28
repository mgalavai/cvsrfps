"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { matchCVsToRFPs } from "@/app/actions"

type CV = {
  id: string
  name: string
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

export default function Matching() {
  const [cvs, setCvs] = useState<CV[]>([])
  const [rfps, setRfps] = useState<RFP[]>([])
  const [selectedCVs, setSelectedCVs] = useState<string[]>([])
  const [selectedRFPs, setSelectedRFPs] = useState<string[]>([])
  const [matchResults, setMatchResults] = useState<MatchResult[]>([])
  const [isMatching, setIsMatching] = useState(false)

  // In a real app, you would fetch these from the server
  // For this demo, we'll use dummy data
  useState(() => {
    setCvs([
      {
        id: "1",
        name: "Alex_Chen_CV.pdf",
        content: "Software Engineer with 5 years of experience in React, Node.js, and TypeScript.",
      },
      {
        id: "2",
        name: "Priya_Sharma_CV.pdf",
        content: "UX Designer with expertise in Figma, user research, and prototyping.",
      },
      {
        id: "3",
        name: "Marcus_Rodriguez_CV.pdf",
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
    <div className="border rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Match CVs to RFPs</h2>
        <p className="text-muted-foreground">Select CVs and RFPs to find the best matches</p>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Select CVs</h3>
            <ScrollArea className="h-[200px] border rounded-md p-4">
              {cvs.map((cv) => (
                <div key={cv.id} className="flex items-center space-x-2 py-2">
                  <Checkbox
                    id={`cv-${cv.id}`}
                    checked={selectedCVs.includes(cv.id)}
                    onCheckedChange={() => toggleCV(cv.id)}
                  />
                  <label
                    htmlFor={`cv-${cv.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {cv.name}
                  </label>
                </div>
              ))}
            </ScrollArea>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Select RFPs</h3>
            <ScrollArea className="h-[200px] border rounded-md p-4">
              {rfps.map((rfp) => (
                <div key={rfp.id} className="flex items-center space-x-2 py-2">
                  <Checkbox
                    id={`rfp-${rfp.id}`}
                    checked={selectedRFPs.includes(rfp.id)}
                    onCheckedChange={() => toggleRFP(rfp.id)}
                  />
                  <label
                    htmlFor={`rfp-${rfp.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {rfp.title}
                  </label>
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>

        <Button
          onClick={handleMatch}
          disabled={isMatching || selectedCVs.length === 0 || selectedRFPs.length === 0}
          className="w-full"
        >
          {isMatching ? "Matching..." : "Match Selected"}
        </Button>

        {matchResults.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-2">Match Results</h3>
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
  )
}

