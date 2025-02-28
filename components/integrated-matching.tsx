"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, FilePlus, Database, MoreHorizontal, ChevronDown, ChevronUp, Calendar, Trash2, Settings, Copy, Sparkles, Loader2, Layers } from "lucide-react"
import { uploadCV, deleteCV, deleteRFP, matchCVsToRFPs, saveCV, reanalyzeCVContent, saveRFP } from "@/app/actions"
import RFPForm from "@/components/rfp-form"
import { CVTable } from "@/components/cv-table"
import { RFPTable } from "@/components/rfp-table"
import { CollapsibleSection, StickyHeader, MainNavigation } from "@/components/collapsible-sections"
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
import {
  Tabs,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

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
  pitch?: string
}

type MatchRun = {
  id: string
  timestamp: Date
  results: MatchResult[]
  selectedCVs: string[]
  selectedRFPs: string[]
}

// Add this component before the main IntegratedMatching component
interface CollapsibleMatchRunProps {
  matchRun: MatchRun;
  groupByFilter: "cv" | "rfp";
  onDelete: (id: string) => void;
  generatePitch: (cv: string, rfp: string, matchResult: MatchResult) => void;
  generatingPitch: {[key: string]: boolean};
  pitches: {[key: string]: string};
  copyPitch: (pitchKey: string) => void;
}

function CollapsibleMatchRun({ 
  matchRun, 
  groupByFilter, 
  onDelete,
  generatePitch,
  generatingPitch,
  pitches,
  copyPitch
}: CollapsibleMatchRunProps) {
  const [isOpen, setIsOpen] = useState(false);
  
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
  
  return (
    <div className={`${isOpen ? "" : "space-y-2"}`}>
      <div 
        className="flex items-center justify-between px-4 py-3 bg-white cursor-pointer border rounded-t-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <div className="font-medium">{formatDate(matchRun.timestamp)}</div>
          <div className="text-sm text-muted-foreground">
            {matchRun.selectedCVs.length} CVs × {matchRun.selectedRFPs.length} RFPs = {matchRun.results.length} matches
          </div>
        </div>
        <div className="flex items-center">
          <div onClick={(e) => e.stopPropagation()}>
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
                  onClick={() => onDelete(matchRun.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete this run
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <Button variant="ghost" size="icon">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="sr-only">Toggle</span>
          </Button>
        </div>
      </div>
      
      {isOpen && (
        <div className="border-x border-b rounded-b-md overflow-hidden">
          <Table className="w-full bg-white">
            <TableHeader className="bg-muted/30">
              <TableRow className="h-8">
                {groupByFilter === "cv" ? (
                  <>
                    <TableHead className="py-1">CV</TableHead>
                    <TableHead className="py-1">RFP</TableHead>
                    <TableHead className="py-1 w-[100px]">Match Score</TableHead>
                    <TableHead className="py-1">Matched Keywords</TableHead>
                    <TableHead className="py-1 w-[160px] text-center">Actions</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead className="py-1">RFP</TableHead>
                    <TableHead className="py-1">CV</TableHead>
                    <TableHead className="py-1 w-[100px]">Match Score</TableHead>
                    <TableHead className="py-1">Matched Keywords</TableHead>
                    <TableHead className="py-1 w-[160px] text-center">Actions</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupByFilter === "cv" ? (
                // Group by CV
                Array.from(
                  // Create a Map of CV ID to results for that CV
                  matchRun.results.reduce((map, result) => {
                    if (!map.has(result.cvId)) {
                      map.set(result.cvId, []);
                    }
                    map.get(result.cvId)?.push(result);
                    return map;
                  }, new Map<string, MatchResult[]>())
                ).map(([cvId, results]) => (
                  <React.Fragment key={cvId}>
                    {/* Header row for the CV */}
                    <TableRow className="bg-muted/5 h-8">
                      <TableCell className="font-bold py-1">{results[0].cvName}</TableCell>
                      <TableCell colSpan={3} className="text-sm text-muted-foreground py-1">
                        {results.length} matching RFPs
                      </TableCell>
                    </TableRow>
                    {/* Individual result rows */}
                    {results
                      .sort((a, b) => b.score - a.score)
                      .map((result, idx) => (
                        <TableRow key={`${cvId}-${result.rfpId}`}>
                          <TableCell className="pl-6 py-2"></TableCell>
                          <TableCell className="py-2">{result.rfpTitle}</TableCell>
                          <TableCell className="py-2 w-[100px]">
                            <Badge variant={result.score > 70 ? "success" : result.score > 40 ? "warning" : "destructive"}>
                              {result.score}%
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex flex-wrap gap-1">
                              {result.matchedKeywords.map((keyword, i) => (
                                <Badge key={i} variant="outline" className="px-1.5 py-0 text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="py-2 w-[160px] text-center">
                            {/* Pitch Generation Button */}
                            {generatingPitch[`${result.cvId}-${result.rfpId}`] ? (
                              <Button variant="outline" size="sm" disabled className="px-2.5 h-8 whitespace-nowrap">
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Generating...
                              </Button>
                            ) : pitches[`${result.cvId}-${result.rfpId}`] ? (
                              <Sheet>
                                <SheetTrigger asChild>
                                  <Button variant="outline" size="sm" className="px-2.5 h-8 whitespace-nowrap">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    View Pitch
                                  </Button>
                                </SheetTrigger>
                                <SheetContent className="sm:max-w-md">
                                  <SheetHeader>
                                    <SheetTitle>Generated Pitch</SheetTitle>
                                    <SheetDescription>
                                      For {results[0].cvName} matching {result.rfpTitle}
                                    </SheetDescription>
                                  </SheetHeader>
                                  <div className="mt-4 relative">
                                    <div className="prose prose-sm max-h-[60vh] overflow-y-auto p-4 border rounded-md bg-muted/20 whitespace-pre-line">
                                      {pitches[`${result.cvId}-${result.rfpId}`]}
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant="secondary" 
                                      className="absolute top-2 right-2"
                                      onClick={() => copyPitch(`${result.cvId}-${result.rfpId}`)}
                                    >
                                      <Copy className="h-3 w-3 mr-1" />
                                      Copy
                                    </Button>
                                  </div>
                                  <SheetFooter className="mt-4">
                                    <SheetClose asChild>
                                      <Button type="button" variant="outline">
                                        Close
                                      </Button>
                                    </SheetClose>
                                    <Button 
                                      type="button" 
                                      onClick={() => generatePitch(result.cvId, result.rfpId, result)}
                                    >
                                      <Sparkles className="h-3 w-3 mr-1" />
                                      Regenerate
                                    </Button>
                                  </SheetFooter>
                                </SheetContent>
                              </Sheet>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="px-2.5 h-8 whitespace-nowrap"
                                onClick={() => generatePitch(result.cvId, result.rfpId, result)}
                              >
                                <Sparkles className="h-3 w-3 mr-1" />
                                Generate Pitch
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </React.Fragment>
                ))
              ) : (
                // Group by RFP
                Array.from(
                  // Create a Map of RFP ID to results for that RFP
                  matchRun.results.reduce((map, result) => {
                    if (!map.has(result.rfpId)) {
                      map.set(result.rfpId, []);
                    }
                    map.get(result.rfpId)?.push(result);
                    return map;
                  }, new Map<string, MatchResult[]>())
                ).map(([rfpId, results]) => (
                  <React.Fragment key={rfpId}>
                    {/* Header row for the RFP */}
                    <TableRow className="bg-muted/5 h-8">
                      <TableCell className="font-bold py-1">{results[0].rfpTitle}</TableCell>
                      <TableCell colSpan={3} className="text-sm text-muted-foreground py-1">
                        {results.length} matching CVs
                      </TableCell>
                    </TableRow>
                    {/* Individual result rows */}
                    {results
                      .sort((a, b) => b.score - a.score)
                      .map((result, idx) => (
                        <TableRow key={`${rfpId}-${result.cvId}`}>
                          <TableCell className="pl-6 py-2"></TableCell>
                          <TableCell className="py-2">{result.cvName}</TableCell>
                          <TableCell className="py-2 w-[100px]">
                            <Badge variant={result.score > 70 ? "success" : result.score > 40 ? "warning" : "destructive"}>
                              {result.score}%
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex flex-wrap gap-1">
                              {result.matchedKeywords.map((keyword, i) => (
                                <Badge key={i} variant="outline" className="px-1.5 py-0 text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="py-2 w-[160px] text-center">
                            {/* Pitch Generation Button */}
                            {generatingPitch[`${result.cvId}-${result.rfpId}`] ? (
                              <Button variant="outline" size="sm" disabled className="px-2.5 h-8 whitespace-nowrap">
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Generating...
                              </Button>
                            ) : pitches[`${result.cvId}-${result.rfpId}`] ? (
                              <Sheet>
                                <SheetTrigger asChild>
                                  <Button variant="outline" size="sm" className="px-2.5 h-8 whitespace-nowrap">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    View Pitch
                                  </Button>
                                </SheetTrigger>
                                <SheetContent className="sm:max-w-md">
                                  <SheetHeader>
                                    <SheetTitle>Generated Pitch</SheetTitle>
                                    <SheetDescription>
                                      For {result.cvName} matching {result.rfpTitle}
                                    </SheetDescription>
                                  </SheetHeader>
                                  <div className="mt-4 relative">
                                    <div className="prose prose-sm max-h-[60vh] overflow-y-auto p-4 border rounded-md bg-muted/20 whitespace-pre-line">
                                      {pitches[`${result.cvId}-${result.rfpId}`]}
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant="secondary" 
                                      className="absolute top-2 right-2"
                                      onClick={() => copyPitch(`${result.cvId}-${result.rfpId}`)}
                                    >
                                      <Copy className="h-3 w-3 mr-1" />
                                      Copy
                                    </Button>
                                  </div>
                                  <SheetFooter className="mt-4">
                                    <SheetClose asChild>
                                      <Button type="button" variant="outline">
                                        Close
                                      </Button>
                                    </SheetClose>
                                    <Button 
                                      type="button" 
                                      onClick={() => generatePitch(result.cvId, result.rfpId, result)}
                                    >
                                      <Sparkles className="h-3 w-3 mr-1" />
                                      Regenerate
                                    </Button>
                                  </SheetFooter>
                                </SheetContent>
                              </Sheet>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="px-2.5 h-8 whitespace-nowrap"
                                onClick={() => generatePitch(result.cvId, result.rfpId, result)}
                              >
                                <Sparkles className="h-3 w-3 mr-1" />
                                Generate Pitch
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
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
  const [groupByFilter, setGroupByFilter] = useState<"cv" | "rfp">("cv")
  const [isMatching, setIsMatching] = useState(false)
  
  // Navigation state
  const [activeSection, setActiveSection] = useState<"data" | "results">("data")
  
  // Refs for scrolling to sections
  const dataSectionRef = useRef<HTMLDivElement>(null)
  const resultsSectionRef = useRef<HTMLDivElement>(null)

  // Add default settings constant
  const DEFAULT_MATCH_SETTINGS = {
    threshold: 30,
    keywordWeight: 70,
    contentWeight: 30,
    maxResults: 20,
  };

  // Add matching settings state
  const [matchSettings, setMatchSettings] = useState(DEFAULT_MATCH_SETTINGS);

  // Add state for managing pitch generation
  const [generatingPitch, setGeneratingPitch] = useState<{[key: string]: boolean}>({});
  const [pitches, setPitches] = useState<{[key: string]: string}>({});

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

  // Use Intersection Observer to track which section is visible
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '-100px 0px', // Adjust for header height
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target === dataSectionRef.current) {
            setActiveSection("data");
          } else if (entry.target === resultsSectionRef.current) {
            setActiveSection("results");
          }
        }
      });
    }, options);
    
    if (dataSectionRef.current) {
      observer.observe(dataSectionRef.current);
    }
    if (resultsSectionRef.current) {
      observer.observe(resultsSectionRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
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

  // Handle reset settings
  const handleResetSettings = () => {
    setMatchSettings(DEFAULT_MATCH_SETTINGS);
  };

  const handleMatch = async () => {
    if (selectedCVs.length === 0 || selectedRFPs.length === 0) return

    setIsMatching(true)
    try {
      // Get the selected CVs and RFPs
      const selectedCVData = cvs.filter((cv) => selectedCVs.includes(cv.id))
      const selectedRFPData = rfps.filter((rfp) => selectedRFPs.includes(rfp.id))

      // Call the server action to match CVs to RFPs with current settings
      const results = await matchCVsToRFPs(
        selectedCVData, 
        selectedRFPData,
        {
          threshold: matchSettings.threshold,
          keywordWeight: matchSettings.keywordWeight / 100,
          contentWeight: matchSettings.contentWeight / 100,
          maxResults: matchSettings.maxResults
        }
      )
      
      // Filter results based on threshold
      const filteredResults = results.filter(
        result => result.score >= matchSettings.threshold
      ).slice(0, matchSettings.maxResults);
      
      // Store the results in history
      const newMatchRun: MatchRun = {
        id: `mr-${Date.now()}`,
        timestamp: new Date(),
        results: filteredResults,
        selectedCVs: [...selectedCVs],
        selectedRFPs: [...selectedRFPs]
      };
      
      setMatchHistory(prev => [newMatchRun, ...prev]);
      setMatchResults(filteredResults);
      setIsMatching(false);
    } catch (error) {
      console.error("Error matching CVs to RFPs:", error)
      setIsMatching(false)
    }
  }

  const scrollToDataSection = () => {
    dataSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
    setActiveSection("data")
  }
  
  const scrollToResultsSection = () => {
    resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
    setActiveSection("results")
  }

  // Handle settings change
  const handleSettingChange = (key: string, value: number) => {
    setMatchSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Generate pitch for a specific match
  const generatePitch = async (cv: string, rfp: string, matchResult: MatchResult) => {
    const pitchKey = `${matchResult.cvId}-${matchResult.rfpId}`;
    
    // Don't regenerate if already generating
    if (generatingPitch[pitchKey]) return;
    
    // Set generating state
    setGeneratingPitch(prev => ({
      ...prev,
      [pitchKey]: true
    }));
    
    try {
      // In a real app, this would be an API call to an AI service
      // For demo purposes, we're simulating a delay and using template text
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get the CV and RFP details
      const cvData = cvs.find(c => c.id === matchResult.cvId);
      const rfpData = rfps.find(r => r.id === matchResult.rfpId);
      
      if (!cvData || !rfpData) throw new Error("CV or RFP not found");
      
      // Generate a mock pitch based on the match
      const generatedPitch = `
# Pitch for ${cvData.firstName} ${cvData.lastName} - ${rfpData.title}

## Introduction
I'm writing to express my interest in the ${rfpData.title} position. With my background in ${matchResult.matchedKeywords.join(", ")}, I believe I'm an excellent match for this role.

## Match Analysis
Our system has identified a ${matchResult.score}% match between my qualifications and your requirements.

## Key Qualifications
${cvData.content}

## Why I'm Interested
${rfpData.description} aligns perfectly with my career goals and experience.

## Next Steps
I would welcome the opportunity to discuss how my experience and skills can benefit your team. Please feel free to contact me at any time to schedule an interview.

Best regards,
${cvData.firstName} ${cvData.lastName}
      `;
      
      // Store the generated pitch
      setPitches(prev => ({
        ...prev,
        [pitchKey]: generatedPitch
      }));
      
      // Show success toast
      toast({
        title: "Pitch generated",
        description: "Your pitch has been successfully generated.",
        action: <ToastAction altText="View">View</ToastAction>,
      });
    } catch (error) {
      console.error("Error generating pitch:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate pitch. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset generating state
      setGeneratingPitch(prev => ({
        ...prev,
        [pitchKey]: false
      }));
    }
  };
  
  // Copy pitch to clipboard
  const copyPitch = (pitchKey: string) => {
    const pitch = pitches[pitchKey];
    if (pitch) {
      navigator.clipboard.writeText(pitch);
      toast({
        title: "Copied to clipboard",
        description: "Pitch has been copied to clipboard.",
      });
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <MainNavigation 
        onScrollToData={scrollToDataSection}
        onScrollToResults={scrollToResultsSection}
        activeSection={activeSection}
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
                
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Filter CVs..."
                    className="w-[180px]"
                  />
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
              </div>
              
              {cvs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No CVs uploaded yet.</p>
              ) : (
                <div>
                  <CVTable 
                    data={cvs} 
                    selectedCVs={selectedCVs} 
                    onToggleSelect={toggleCV} 
                    onDelete={handleDeleteCV}
                    onSaveContent={handleSaveCV}
                    onReanalyze={handleReanalyzeCVContent}
                  />
                </div>
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
                
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Filter positions..."
                    className="w-[180px]"
                  />
                  <RFPForm onRFPAdded={(newRFP) => setRfps([...rfps, newRFP])} />
                </div>
              </div>
              
              {rfps.length === 0 ? (
                <p className="text-sm text-muted-foreground">No RFPs added yet.</p>
              ) : (
                <div>
                  <RFPTable
                    data={rfps}
                    selectedRFPs={selectedRFPs}
                    onToggleSelect={toggleRFP}
                    onDelete={handleDeleteRFP}
                    onSave={handleSaveRFP}
                  />
                </div>
              )}
            </div>
          </div>
        </CollapsibleSection>
      </div>

      {/* Matching Section */}
      <div className="py-6" ref={resultsSectionRef}>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="h-5 w-5" />
            <h2 className="text-lg font-bold text-heading">Match Results</h2>
          </div>
          <p className="text-sm text-subtitle">View matching results between selected CVs and RFPs</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Show:</span>
                <Select value={timeframeFilter} onValueChange={setTimeframeFilter}>
                  <SelectTrigger className="w-[180px] px-3">
                    <div className="flex items-center gap-1 mr-1">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{timeframeFilter === "all" ? "All time" : 
                       timeframeFilter === "today" ? "Today" : 
                       timeframeFilter === "yesterday" ? "Yesterday" : 
                       timeframeFilter === "thisWeek" ? "This week" : "This month"}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="min-w-[180px]">
                    <SelectItem value="all" className="py-1.5">All time</SelectItem>
                    <SelectItem value="today" className="py-1.5">Today</SelectItem>
                    <SelectItem value="yesterday" className="py-1.5">Yesterday</SelectItem>
                    <SelectItem value="thisWeek" className="py-1.5">This week</SelectItem>
                    <SelectItem value="thisMonth" className="py-1.5">This month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Group by:</span>
                <Tabs value={groupByFilter} onValueChange={(value) => setGroupByFilter(value as "cv" | "rfp")}>
                  <TabsList className="bg-muted/30">
                    <TabsTrigger className="data-[state=active]:bg-white" value="cv">CV</TabsTrigger>
                    <TabsTrigger className="data-[state=active]:bg-white" value="rfp">RFP</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" title="Matching Settings" className="relative">
                    <Settings className="h-4 w-4" />
                    {(matchSettings.threshold !== DEFAULT_MATCH_SETTINGS.threshold ||
                      matchSettings.keywordWeight !== DEFAULT_MATCH_SETTINGS.keywordWeight ||
                      matchSettings.contentWeight !== DEFAULT_MATCH_SETTINGS.contentWeight ||
                      matchSettings.maxResults !== DEFAULT_MATCH_SETTINGS.maxResults) && (
                      <div className="absolute h-3 w-3 bg-red-500 rounded-full -top-1 -right-1 border border-background" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="end">
                  <div className="space-y-4">
                    <h4 className="font-medium">Matching Settings</h4>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="threshold" className="text-sm">
                          Match Threshold: {matchSettings.threshold}%
                        </label>
                      </div>
                      <Input
                        id="threshold"
                        type="range"
                        min="0"
                        max="100"
                        value={matchSettings.threshold}
                        onChange={(e) => handleSettingChange('threshold', parseInt(e.target.value))}
                        className="cursor-pointer"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="keywordWeight" className="text-sm">
                          Keyword Weight: {matchSettings.keywordWeight}%
                        </label>
                      </div>
                      <Input
                        id="keywordWeight"
                        type="range"
                        min="0"
                        max="100"
                        value={matchSettings.keywordWeight}
                        onChange={(e) => handleSettingChange('keywordWeight', parseInt(e.target.value))}
                        className="cursor-pointer"
                      />
                    </div>
                    
                    <div className="pt-2">
                      <Button size="sm" className="w-full" onClick={handleResetSettings}>
                        Reset to Defaults
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
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
          </div>

          {getFilteredHistory().length > 0 ? (
            <div className="space-y-4">
              {getFilteredHistory().map((matchRun) => (
                <CollapsibleMatchRun
                  key={matchRun.id}
                  matchRun={matchRun}
                  groupByFilter={groupByFilter}
                  onDelete={handleDeleteMatch}
                  generatePitch={generatePitch}
                  generatingPitch={generatingPitch}
                  pitches={pitches}
                  copyPitch={copyPitch}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">No matches found for the selected timeframe</p>
              <p className="text-sm">Try selecting a different timeframe or run a new match</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Add a floating action button for matching when scrolled to the results section */}
      {activeSection === "results" && selectedCVs.length > 0 && selectedRFPs.length > 0 && (
        <div className="fixed bottom-6 right-6 z-10">
          <Button
            onClick={handleMatch}
            disabled={isMatching}
            className="shadow-lg"
            size="lg"
          >
            {isMatching 
              ? "Matching..." 
              : `Match (${selectedCVs.length} CVs + ${selectedRFPs.length} RFPs)`}
          </Button>
        </div>
      )}
    </div>
  )
}

