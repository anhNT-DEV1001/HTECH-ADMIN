"use client"

import * as LucideIcons from "lucide-react"
import type { LucideIcon, LucideProps } from "lucide-react"

const FALLBACK_ICON = LucideIcons.Shield

const isLucideIcon = (value: unknown): value is LucideIcon =>
  typeof value === "function" ||
  (typeof value === "object" && value !== null && "$$typeof" in value)

const toPascalCase = (value: string) =>
  value
    .trim()
    .replace(/icon$/i, "")
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("")

export const resolveLucideIcon = (name?: string | null): LucideIcon => {
  const normalizedName = name?.trim()
  if (!normalizedName) return FALLBACK_ICON

  const candidateNames = [
    normalizedName,
    toPascalCase(normalizedName),
  ]

  for (const candidateName of candidateNames) {
    const iconCandidate = LucideIcons[candidateName as keyof typeof LucideIcons]
    if (isLucideIcon(iconCandidate)) return iconCandidate
  }

  return FALLBACK_ICON
}

type LucideIconByNameProps = Omit<LucideProps, "ref" | "name"> & {
  name?: string | null
}

export function LucideIconByName({ name, ...props }: LucideIconByNameProps) {
  const Icon = resolveLucideIcon(name)
  return <Icon {...props} />
}
