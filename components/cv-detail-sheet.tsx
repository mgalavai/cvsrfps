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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"

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
          {/* Tabs navigation using shadcn Tabs */}
          <Tabs defaultValue="pdf" value={activeView} onValueChange={(value) => setActiveView(value as "pdf" | "content")} className="w-full mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pdf">
                <FileDown className="h-4 w-4 mr-2" />
                View Original
              </TabsTrigger>
              <TabsTrigger value="content">
                <FileText className="h-4 w-4 mr-2" />
                Edit Content
              </TabsTrigger>
            </TabsList>
            
            {/* View PDF content */}
            <TabsContent value="pdf" className="mt-2">
              {cv.pdfUrl ? (
                <iframe 
                  src={cv.pdfUrl} 
                  className="w-full h-[60vh] border rounded"
                  title={`${cv.firstName} ${cv.lastName}'s CV`}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[60vh] bg-muted/30 rounded-md">
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
            </TabsContent>
            
            {/* Edit content */}
            <TabsContent value="content" className="mt-2">
              <Textarea 
                value={editedContent} 
                onChange={(e) => setEditedContent(e.target.value)}
                className="resize-none h-[60vh] font-mono text-sm"
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
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
} 