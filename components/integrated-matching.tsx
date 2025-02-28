"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, FilePlus, Database, MoreHorizontal, ChevronDown, ChevronUp, Calendar, Trash2 } from "lucide-react"
import { uploadCV, deleteCV, deleteRFP, matchCVsToRFPs, saveCV, reanalyzeCVContent, saveRFP } from "@/app/actions"
import RFPForm from "@/components/rfp-form"
import { CVTable } from "@/components/cv-table"
import { RFPTable } from "@/components/rfp-table"
import { CollapsibleSection, StickyHeader } from "@/components/collapsible-sections"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

type MatchRun = {
  id: string
  timestamp: Date
  results: MatchResult[]
  selectedCVs: string[]
  selectedRFPs: string[]
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
  const [matchHistory, setMatchHistory] = useState<MatchRun[]>([])
  const [timeframeFilter, setTimeframeFilter] = useState<string>("all")
  const [isMatching, setIsMatching] = useState(false)
  
  // Collapsible state
  const [dataSectionOpen, setDataSectionOpen] = useState(true)
  const dataSectionRef = useRef<HTMLDivElement>(null)

  // Initialize with dummy data
  useEffect(() => {
    setCvs([
      {
        id: "1",
        name: "Alex_Chen_CV.pdf",
        firstName: "Alex",
        lastName: "Chen",
        content: "Software Engineer with 5 years of experience in React, Node.js, and TypeScript.",
      },
      {
        id: "2",
        name: "Priya_Sharma_CV.pdf",
        firstName: "Priya",
        lastName: "Sharma",
        content: "UX Designer with expertise in Figma, user research, and prototyping.",
      },
      {
        id: "3",
        name: "Marcus_Rodriguez_CV.pdf",
        firstName: "Marcus",
        lastName: "Rodriguez",
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

  // Load historical matches for demo
  useEffect(() => {
    const mockMatchHistory: MatchRun[] = [
      {
        id: "mr-1",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        selectedCVs: ["1", "2"],
        selectedRFPs: ["1", "3"],
        results: [
          {
            cvId: "1",
            cvName: "Alex_Chen_CV.pdf",
            rfpId: "1",
            rfpTitle: "Frontend Developer",
            score: 85,
            matchedKeywords: ["React", "TypeScript", "experience"]
          },
          {
            cvId: "2",
            cvName: "Priya_Sharma_CV.pdf",
            rfpId: "1",
            rfpTitle: "Frontend Developer",
            score: 35,
            matchedKeywords: ["experience"]
          },
          {
            cvId: "1",
            cvName: "Alex_Chen_CV.pdf",
            rfpId: "3",
            rfpTitle: "Technical Project Manager",
            score: 25,
            matchedKeywords: ["experience"]
          },
          {
            cvId: "2",
            cvName: "Priya_Sharma_CV.pdf",
            rfpId: "3",
            rfpTitle: "Technical Project Manager",
            score: 15,
            matchedKeywords: []
          }
        ]
      },
      {
        id: "mr-2",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        selectedCVs: ["2", "3"],
        selectedRFPs: ["2"],
        results: [
          {
            cvId: "2",
            cvName: "Priya_Sharma_CV.pdf",
            rfpId: "2",
            rfpTitle: "UX/UI Designer",
            score: 92,
            matchedKeywords: ["Figma", "user", "prototyping", "wireframing"]
          },
          {
            cvId: "3",
            cvName: "Marcus_Rodriguez_CV.pdf",
            rfpId: "2",
            rfpTitle: "UX/UI Designer",
            score: 10,
            matchedKeywords: []
          }
        ]
      }
    ];
    
    setMatchHistory(mockMatchHistory);
  }, []);

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

  const handleSaveCV = async (updatedCV: CV) => {
    try {
      // Call the server action to save the CV
      const savedCV = await saveCV(updatedCV)
      
      // Update the local state
      setCvs(prevCVs => prevCVs.map(cv => 
        cv.id === savedCV.id ? savedCV : cv
      ))
      
      return savedCV
    } catch (error) {
      console.error("Error saving CV:", error)
      throw error
    }
  }

  const handleReanalyzeCVContent = async (cv: CV) => {
    try {
      // Call the server action to reanalyze the CV
      const updatedCV = await reanalyzeCVContent(cv)
      
      // Update the local state
      setCvs(prevCVs => prevCVs.map(existingCV => 
        existingCV.id === updatedCV.id ? updatedCV : existingCV
      ))
      
      return updatedCV
    } catch (error) {
      console.error("Error reanalyzing CV:", error)
      throw error
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

  const handleSaveRFP = async (updatedRFP: RFP) => {
    try {
      // Call the server action to save the RFP
      const savedRFP = await saveRFP(updatedRFP)
      
      // Update the local state
      setRfps(prevRFPs => prevRFPs.map(rfp => 
        rfp.id === savedRFP.id ? savedRFP : rfp
      ))
      
      return savedRFP
    } catch (error) {
      console.error("Error saving RFP:", error)
      throw error
    }
  }

  // Matching handlers
  const toggleCV = (id: string) => {
    setSelectedCVs((prev) => (prev.includes(id) ? prev.filter((cvId) => cvId !== id) : [...prev, id]))
  }

  const toggleRFP = (id: string) => {
    setSelectedRFPs((prev) => (prev.includes(id) ? prev.filter((rfpId) => rfpId !== id) : [...prev, id]))
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  // Handle match deletion
  const handleDeleteMatch = (id: string) => {
    setMatchHistory(prev => prev.filter(match => match.id !== id));
  };

  // Filter history based on timeframe
  const getFilteredHistory = () => {
    const now = new Date();
    
    switch(timeframeFilter) {
      case "today":
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return matchHistory.filter(match => match.timestamp >= startOfToday);
        
      case "yesterday":
        const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return matchHistory.filter(match => 
          match.timestamp >= startOfYesterday && match.timestamp < endOfYesterday
        );
        
      case "thisWeek":
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        return matchHistory.filter(match => match.timestamp >= startOfWeek);
        
      case "thisMonth":
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return matchHistory.filter(match => match.timestamp >= startOfMonth);
        
      default: // "all"
        return matchHistory;
    }
  };

  const handleMatch = async () => {
    if (selectedCVs.length === 0 || selectedRFPs.length === 0) return

    setIsMatching(true)
    try {
      // Get the selected CVs and RFPs
      const selectedCVData = cvs.filter((cv) => selectedCVs.includes(cv.id))
      const selectedRFPData = rfps.filter((rfp) => selectedRFPs.includes(rfp.id))

      // Call the server action to match CVs to RFPs
      const results = await matchCVsToRFPs(selectedCVData, selectedRFPData)
      
      // Store the results in history
      const newMatchRun: MatchRun = {
        id: `mr-${Date.now()}`,
        timestamp: new Date(),
        results: results,
        selectedCVs: [...selectedCVs],
        selectedRFPs: [...selectedRFPs]
      };
      
      setMatchHistory(prev => [newMatchRun, ...prev]);
      setMatchResults(results);
      setIsMatching(false);
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
                <CVTable 
                  data={cvs} 
                  selectedCVs={selectedCVs} 
                  onToggleSelect={toggleCV} 
                  onDelete={handleDeleteCV}
                  onSaveContent={handleSaveCV}
                  onReanalyze={handleReanalyzeCVContent}
                />
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
                  onSave={handleSaveRFP}
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Select value={timeframeFilter} onValueChange={setTimeframeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="thisWeek">This week</SelectItem>
                    <SelectItem value="thisMonth">This month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button
              onClick={handleMatch}
              disabled={isMatching || selectedCVs.length === 0 || selectedRFPs.length === 0}
              className="px-8 font-medium"
            >
              {isMatching 
                ? "Matching..." 
                : `Match Selected (${selectedCVs.length} CVs + ${selectedRFPs.length} RFPs)`}
            </Button>
          </div>

          {getFilteredHistory().length > 0 ? (
            <div className="space-y-4">
              {getFilteredHistory().map((matchRun) => (
                <Collapsible key={matchRun.id} className="border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-muted/20">
                    <div>
                      <div className="font-medium">{formatDate(matchRun.timestamp)}</div>
                      <div className="text-sm text-muted-foreground">
                        {matchRun.selectedCVs.length} CVs × {matchRun.selectedRFPs.length} RFPs = {matchRun.results.length} matches
                      </div>
                    </div>
                    <div className="flex items-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteMatch(matchRun.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete this run
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="h-4 w-4" />
                          <span className="sr-only">Toggle</span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                  
                  <CollapsibleContent>
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
                          {matchRun.results.map((result, index) => (
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
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-muted/10">
              <p className="text-muted-foreground mb-2">No matches found for the selected timeframe</p>
              <p className="text-sm">Try selecting a different timeframe or run a new match</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

