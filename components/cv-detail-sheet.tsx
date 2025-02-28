"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FileText, RotateCcw, Save, FileDown } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"

interface CV {
  id: string
  name: string
  firstName: string
  lastName: string
  content: string
  // In a real app, we would have a URL to the PDF
  pdfUrl?: string
}

interface CVDetailSheetProps {
  cv: CV | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (cv: CV) => Promise<void>
  onReanalyze?: (cv: CV) => Promise<void>
}

export function CVDetailSheet({ 
  cv, 
  open, 
  onOpenChange, 
  onSave, 
  onReanalyze 
}: CVDetailSheetProps) {
  const [activeView, setActiveView] = useState<"pdf" | "content">("pdf")
  const [editedContent, setEditedContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isReanalyzing, setIsReanalyzing] = useState(false)

  // Update edited content when CV changes
  useEffect(() => {
    if (cv) {
      setEditedContent(cv.content)
    }
  }, [cv])

  const handleSave = async () => {
    if (!cv || !onSave) return

    setIsSaving(true)
    try {
      await onSave({
        ...cv,
        content: editedContent
      })
      setIsSaving(false)
    } catch (error) {
      console.error("Error saving CV:", error)
      setIsSaving(false)
    }
  }

  const handleReanalyze = async () => {
    if (!cv || !onReanalyze) return

    setIsReanalyzing(true)
    try {
      await onReanalyze(cv)
      setIsReanalyzing(false)
    } catch (error) {
      console.error("Error reanalyzing CV:", error)
      setIsReanalyzing(false)
    }
  }

  // Mock download function - in a real app, this would download the actual file
  const handleDownload = () => {
    if (!cv) return
    
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

  if (!cv) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl w-full">
        <SheetHeader>
          <SheetTitle>{cv.firstName} {cv.lastName}'s CV</SheetTitle>
          <SheetDescription>
            View original PDF and edit the extracted content
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-4">
          {/* Custom tab navigation */}
          <div className="flex w-full border rounded-lg mb-4">
            <button
              onClick={() => setActiveView("pdf")}
              className={`flex items-center justify-center py-2 px-4 flex-1 rounded-l-lg ${
                activeView === "pdf"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <FileDown className="h-4 w-4 mr-2" />
              View Original
            </button>
            <button
              onClick={() => setActiveView("content")}
              className={`flex items-center justify-center py-2 px-4 flex-1 rounded-r-lg ${
                activeView === "content"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Edit Content
            </button>
          </div>
          
          {/* View PDF content */}
          {activeView === "pdf" && (
            <div className="h-[60vh] flex flex-col">
              {cv.pdfUrl ? (
                <iframe 
                  src={cv.pdfUrl} 
                  className="w-full h-full border rounded"
                  title={`${cv.firstName} ${cv.lastName}'s CV`}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-muted/30 rounded-md">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    In a production environment, the original PDF would be displayed here.<br />
                    This demo currently only contains text content.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={handleDownload}
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Download Text Version
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {/* Edit content */}
          {activeView === "content" && (
            <div className="h-[60vh] flex flex-col">
              <Textarea 
                value={editedContent} 
                onChange={(e) => setEditedContent(e.target.value)}
                className="flex-1 resize-none min-h-[400px] font-mono text-sm"
                placeholder="CV content appears here"
              />
              <div className="flex justify-between mt-4">
                <Button 
                  variant="outline" 
                  onClick={handleReanalyze}
                  disabled={isReanalyzing}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {isReanalyzing ? "Reanalyzing..." : "Reanalyze"}
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isSaving || editedContent === cv.content}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
} 