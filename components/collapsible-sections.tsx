"use client"

import { useState, useEffect, useRef } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, FileText, FilePlus, Layers, UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

type SectionProps = {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  count?: number
}

export function CollapsibleSection({ title, icon, children, count }: SectionProps) {
  const [isOpen, setIsOpen] = useState(true)
  
  return (
    <div>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger 
          className="w-full py-4 flex justify-between items-center hover:bg-muted/20 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-lg font-bold text-heading">{title}</h2>
            {count !== undefined && (
              <span className="text-sm text-muted-foreground">({count})</span>
            )}
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        
        <CollapsibleContent className="py-4">
          {children}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export function MainNavigation({ 
  onScrollToData,
  onScrollToResults,
  activeSection = "data"
}: { 
  onScrollToData: () => void
  onScrollToResults: () => void
  activeSection?: "data" | "results"
}) {
  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center">
          <Image 
            src="/images/knightech.png" 
            alt="Knightech Group" 
            width={140} 
            height={32}
            className="h-8 w-auto" 
            priority
          />
        </div>
        
        <div className="flex justify-center flex-1">
          <div className="flex gap-4">
            <button 
              onClick={onScrollToData}
              className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                activeSection === "data" 
                  ? "border-b-2 border-primary text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Candidates & Requirements
            </button>
            <button 
              onClick={onScrollToResults}
              className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                activeSection === "results" 
                  ? "border-b-2 border-primary text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Results
            </button>
          </div>
        </div>
        
        <div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <UserIcon className="h-5 w-5" />
            <span className="sr-only">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function StickyHeader({ 
  cvCount, 
  rfpCount, 
  onExpandCV, 
  onExpandRFP,
  selectedCVCount,
  selectedRFPCount,
  onMatch,
  isMatchingDisabled
}: { 
  cvCount: number
  rfpCount: number
  onExpandCV: () => void
  onExpandRFP: () => void
  selectedCVCount: number
  selectedRFPCount: number
  onMatch: () => void
  isMatchingDisabled: boolean
}) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      // Show sticky header when scrolled past 200px
      setIsVisible(window.scrollY > 200)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  if (!isVisible) return null
  
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm p-4 border-b flex justify-between transition-all duration-300 shadow-sm">
      <div className="flex gap-4">
        <Button variant="outline" size="sm" onClick={onExpandCV}>
          <FileText className="h-4 w-4 mr-2" />
          CVs ({cvCount}) {selectedCVCount > 0 && <span className="ml-1 text-primary">{selectedCVCount} selected</span>}
        </Button>
        <Button variant="outline" size="sm" onClick={onExpandRFP}>
          <FilePlus className="h-4 w-4 mr-2" />
          RFPs ({rfpCount}) {selectedRFPCount > 0 && <span className="ml-1 text-primary">{selectedRFPCount} selected</span>}
        </Button>
      </div>
      <Button 
        variant="default" 
        size="sm" 
        onClick={onMatch}
        disabled={isMatchingDisabled}
      >
        Match Selected
      </Button>
    </div>
  )
} 