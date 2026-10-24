"use client"
import { useId, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { culturalLabels, type CulturalSeed } from "@/lib/cultural-seeds"

type RecordChoice = CulturalSeed & { description: string }
export function CulturalPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: CulturalSeed[]
  onChange: (value: CulturalSeed[]) => void
  disabled?: boolean
}) {
  const id = useId()
  const [type, setType] = useState<CulturalSeed["type"]>("artist")
  const [query, setQuery] = useState("")
  const [records, setRecords] = useState<RecordChoice[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  async function search() {
    setBusy(true)
    setError("")
    setRecords(null)
    try {
      const response = await fetch("/api/tastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, type }),
        signal: AbortSignal.timeout(40_000),
      })
      const body = await response.json()
      if (!response.ok)
        throw new Error(body.error ?? "Qloo search could not complete.")
      setRecords(body.records)
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Search could not complete. Try again."
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="cultural-picker">
      <p className="eyebrow">START WITH WHAT YOU LOVE</p>
      <p className="field-note">
        Choose up to 3 real artists, films or books. Qloo connects these
        cultural tastes to places.
      </p>
      <ul className="cultural-selected" aria-label="Selected cultural tastes">
        {value.map((seed) => (
          <li key={seed.id}>
            <span>
              <small>{culturalLabels[seed.type]}</small> {seed.name}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || busy}
              aria-label={`Remove ${seed.name}`}
              onClick={() => onChange(value.filter((v) => v.id !== seed.id))}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
      <div className="cultural-search">
        <div>
          <Label htmlFor={`${id}-type`}>Taste type</Label>
          <select
            id={`${id}-type`}
            value={type}
            disabled={disabled || busy}
            onChange={(e) => {
              setType(e.target.value as CulturalSeed["type"])
              setRecords(null)
              setError("")
            }}
          >
            {Object.entries(culturalLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor={`${id}-query`}>Name or title</Label>
          <Input
            id={`${id}-query`}
            value={query}
            maxLength={100}
            disabled={disabled || busy}
            placeholder={
              type === "artist"
                ? "e.g. Radiohead"
                : type === "movie"
                  ? "e.g. The Grand Budapest Hotel"
                  : "e.g. The Little Prince"
            }
            onChange={(e) => {
              setQuery(e.target.value)
              setRecords(null)
              setError("")
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                if (
                  query.trim().length >= 2 &&
                  !busy &&
                  !disabled &&
                  value.length < 3
                )
                  void search()
              }
            }}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={
            disabled || busy || query.trim().length < 2 || value.length >= 3
          }
          onClick={search}
        >
          {busy ? "Searching Qloo…" : "Search Qloo"}
        </Button>
      </div>
      <div aria-live="polite">
        {error && (
          <p role="alert" className="field-note">
            {error}
          </p>
        )}
        {records && !records.length && (
          <p className="field-note">
            No matching {culturalLabels[type].toLowerCase()} records. Try
            another name or title.
          </p>
        )}
        {records && records.length > 0 && (
          <>
            <p className="field-note">
              Qloo matches — choose the intended record. Nothing is selected
              automatically.
            </p>
            <ul className="cultural-results">
              {records.map((record) => (
                <li key={record.id}>
                  <strong>{record.name}</strong>
                  <p>
                    {record.description ||
                      `${culturalLabels[record.type]} record from Qloo.`}
                  </p>
                  <small>Qloo record {record.id}</small>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={
                      disabled ||
                      value.length >= 3 ||
                      value.some((s) => s.id === record.id)
                    }
                    onClick={() => {
                      onChange([
                        ...value,
                        { id: record.id, name: record.name, type: record.type },
                      ])
                      setRecords(null)
                      setQuery("")
                    }}
                  >
                    Choose {record.name}
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
