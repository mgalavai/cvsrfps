"use server"

import { revalidatePath } from "next/cache"

// Types
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

// In a real app, you would use a database
// For this demo, we'll use in-memory storage
let cvs: CV[] = []
let rfps: RFP[] = []

export async function uploadCV(cv: CV) {
  // In a real app, you would save to a database
  cvs.push(cv)
  revalidatePath("/")
  return { success: true }
}

export async function deleteCV(id: string) {
  // In a real app, you would delete from a database
  cvs = cvs.filter((cv) => cv.id !== id)
  revalidatePath("/")
  return { success: true }
}

export async function addRFP(rfp: RFP) {
  // In a real app, you would save to a database
  rfps.push(rfp)
  revalidatePath("/")
  return { success: true }
}

export async function deleteRFP(id: string) {
  // In a real app, you would delete from a database
  rfps = rfps.filter((rfp) => rfp.id !== id)
  revalidatePath("/")
  return { success: true }
}

export async function matchCVsToRFPs(selectedCVs: CV[], selectedRFPs: RFP[]): Promise<MatchResult[]> {
  // In a real app, you would use a more sophisticated matching algorithm
  // For this demo, we'll use a simple keyword matching approach

  const results: MatchResult[] = []

  for (const cv of selectedCVs) {
    for (const rfp of selectedRFPs) {
      // Extract keywords from RFP requirements
      const requirementKeywords = rfp.requirements
        .toLowerCase()
        .split(/[,.\s]+/)
        .filter((word) => word.length > 3) // Filter out short words

      // Check which keywords are present in the CV
      const matchedKeywords = requirementKeywords.filter((keyword) => cv.content.toLowerCase().includes(keyword))

      // Calculate match score (percentage of matched keywords)
      const score = Math.round((matchedKeywords.length / requirementKeywords.length) * 100)

      results.push({
        cvId: cv.id,
        cvName: cv.name,
        rfpId: rfp.id,
        rfpTitle: rfp.title,
        score,
        matchedKeywords,
      })
    }
  }

  // Sort results by score (highest first)
  return results.sort((a, b) => b.score - a.score)
}

